import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api';
import './styles/GrupoCard.css';
import { Link} from 'react-router-dom';
import { getGrupoById } from '../api/grupos.api';
import { useNavigate } from 'react-router-dom';


/**
 * GrupoCard es un componente de React que representa una tarjeta de información 
 * sobre un grupo específico. Al recibir un ID de grupo como prop, realiza 
 * solicitudes a la API para obtener los detalles del grupo, incluyendo 
 * investigadores y proyectos asociados. El componente maneja el estado de 
 * carga y muestra un mensaje mientras se recuperan los datos. 
 * Incluye lógica para determinar si el usuario actual tiene permisos para 
 * modificar el grupo. Si el usuario tiene permiso, se muestra un botón para 
 * modificar el grupo. Además, se muestran listas de investigadores y proyectos 
 * asociados, donde cada investigador y proyecto es un enlace a sus respectivos 
 * detalles. 
 */



export function GrupoCard({ id }) {
    const [investigadores, setInvestigadores] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canModify, setCanModify] = useState(false);
    const Navigate = useNavigate();

    useEffect(() => {
        async function fetchGrupo() {
            try {
                const res = await getGrupoById(id);
                if (res.data) {
                    setGrupo(res.data);
                    setProyectos(res.data.proyectos);
                }
            } catch (error) {
                console.error("Error fetching grupo:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGrupo();
    }, [id]);

    useEffect(() => {
        const fetchInvestigadores = async () => {
            if (grupo && grupo.investigadores && grupo.investigadores.length > 0) {
                const investigadoresPromises = grupo.investigadores.map(async (idInvestigador) => {
                    const res = await getInvestigadorById(idInvestigador);
                    return res.data;
                });
                const investigadoresData = await Promise.all(investigadoresPromises);
                setInvestigadores(investigadoresData);
                checkUserPermission(investigadoresData);
            }
            else {
                setInvestigadores([]);
                checkUserPermission([]);
            }


        };
    
        fetchInvestigadores();
    }, [grupo]); // Dependencia del efecto: se ejecutará cada vez que 'grupo' cambie
    

    const checkUserPermission = (associatedResearchers) => {
        const currentUserId = localStorage.getItem('user');
        const isUserInGroup = associatedResearchers.some(researcher => researcher.email === currentUserId);
        if (investigadores.length === 0 ) {
            setCanModify(true);
        }
        else {
            setCanModify(isUserInGroup);
        }
    };

    if (loading) return <p>Cargando...</p>;

    const handleModifyClick = () => {
        Navigate(`/modify-group/${grupo.id}`);
    };

    return (
        <div className="grupo-card">
            <div className="grupo-header">
                <h2>
                    <Link to={`/grupos/${grupo.id}`} className="grupo-enlace">{grupo.nombre}</Link>
                </h2>
                <p>{grupo.descripcion}</p>
                {canModify && <button onClick={handleModifyClick} className="modify-button">Modificar</button>}
            </div>

            <div className="grupo-body">
                <div className="tarjeta-lista">
                    <h3>Investigadores:</h3>
                    {investigadores.length > 0 ? (
                        investigadores.map(investigador => (
                            <div key={investigador.id} className="tarjeta">
                                <p>
                                    <Link to={`/investigadores/${investigador.id}`} className="investigador-enlace">
                                        {investigador.nombre} {investigador.apellido}
                                    </Link>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No tiene investigadores</p>
                    )}
                </div>

                <div className="tarjeta-lista">
                    <h3>Proyectos:</h3>
                    {proyectos.length > 0 ? (
                        proyectos.map(proyecto => (
                            <div key={proyecto.id} className="tarjeta">
                                <p>
                                    <Link to={`/proyectos/${proyecto.id}`} className="proyecto-enlace">
                                        {proyecto.nombre}
                                    </Link>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No tiene proyectos</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GrupoCard;