import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api';
import { getProyectos } from '../api/proyectos.api';
import './styles/GrupoCard.css';
import { Link, useParams } from 'react-router-dom';
import { getGrupoById } from '../api/grupos.api';
import { useNavigate } from 'react-router-dom';

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

        };
    
        fetchInvestigadores();
    }, [grupo]); // Dependencia del efecto: se ejecutará cada vez que 'grupo' cambie
    

    const checkUserPermission = (associatedResearchers) => {
        const currentUserId = localStorage.getItem('user');
        console.log(currentUserId, associatedResearchers);
        const isUserInGroup = associatedResearchers.some(researcher => researcher.email === currentUserId);
        console.log(isUserInGroup);
        setCanModify(isUserInGroup);
    };

    if (loading) return <p>Cargando...</p>;

    const handleModifyClick = () => {
        Navigate(`/modify-project/${grupo.id}`);
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
