import React, { useState, useEffect } from 'react';
import { getGrupoById } from '../api/grupos.api';
import { getInvestigadorById } from '../api/investigadores.api';
import './styles/ProyectoCard.css'; // Asegúrate de crear este archivo para los estilos
import { Link, Navigate, useParams } from 'react-router-dom';
import { getProyectoById } from '../api/proyectos.api';
import { useNavigate } from 'react-router-dom';


/**
 * ProyectoCard es un componente de React que muestra información detallada sobre un proyecto específico.
 *
 * - Utiliza los hooks useState y useEffect para manejar el estado y realizar llamadas a la API para 
 *   obtener los detalles del proyecto, así como los grupos e investigadores asociados.
 * - El componente acepta un prop 'id', que representa el ID del proyecto a cargar.
 * - Se inicializa el estado de grupos, investigadores, proyecto, loading, canModify y redirect.
 * - Al montarse el componente, se realiza una llamada a la API para obtener los detalles del proyecto 
 *   mediante la función getProyectoById. Si se produce un error, se maneja adecuadamente.
 * - Se obtienen los grupos e investigadores asociados al proyecto, realizando llamadas a las APIs 
 *   correspondientes. Los resultados se almacenan en los estados grupos e investigadores.
 * - Una vez que se han cargado los investigadores, se verifica si el usuario actual tiene permiso 
 *   para modificar el proyecto, basado en si su email se encuentra entre los investigadores asociados.
 * - Si el usuario tiene permisos para modificar, se muestra un botón que, al hacer clic, establece el 
 *   estado de redirección para navegar a la página de modificación del proyecto.
 * - El componente muestra un mensaje de carga mientras se obtienen los datos. Si el proyecto se carga 
 *   exitosamente, se presenta su nombre, descripción, fecha y palabras clave. Las palabras clave son 
 *   clicables, redirigiendo a una búsqueda basada en la palabra clave seleccionada.
 * - Se muestran las listas de grupos e investigadores asociados, y se manejan los casos donde no hay 
 *   grupos o investigadores asociados al proyecto.
 * - Utiliza estilos personalizados de un archivo CSS externo llamado "ProyectoCard.css".
 */


export function ProyectoCard({ id }) {
    const [grupos, setGrupos] = useState([]);
    const [investigadores, setInvestigadores] = useState([]);
    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canModify, setCanModify] = useState(false);
    const [redirect, setRedirect] = useState(false); // Estado para redirección

    
    const navigate = useNavigate();

    const handleKeywordClick = (keyword) => {
        navigate(`/proyectos?keyword=${keyword}`);
    };

    useEffect(() => {
        async function fetchProyecto() {
            try {
                const res = await getProyectoById(id);
                setProyecto(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching proyecto:", error);
                setLoading(false);
            }
        }
        fetchProyecto();
    }, [id]);

    useEffect(() => {
        async function fetchGrupos() {
            if (proyecto && proyecto.grupos && proyecto.grupos.length > 0) {
                const gruposPromises = proyecto.grupos.map(async (id) => {
                    const res = await getGrupoById(id);
                    return res.data;
                });
                const gruposData = await Promise.all(gruposPromises);
                setGrupos(gruposData);
            }
        }
        fetchGrupos();
    }, [proyecto]);

    useEffect(() => {
        async function fetchInvestigadores() {
            if (proyecto && proyecto.investigadores && proyecto.investigadores.length > 0) {
                const investigadoresPromises = proyecto.investigadores.map(async (idInvestigadores) => {
                    const res = await getInvestigadorById(idInvestigadores);
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
        }
        fetchInvestigadores();
    }, [proyecto]);

    const checkUserPermission = (associatedResearchers) => {
        const currentUserId = localStorage.getItem('user'); 
        const isUserInGroup = associatedResearchers.some((researcher) => researcher.email === currentUserId);

        if (investigadores.length === 0) {
            setCanModify(true);
        }
        else {
            setCanModify(isUserInGroup);
        }

    };

    const handleModifyClick = () => {
        setRedirect(true); // Cambiar el estado para redirigir
    };

    // Redirigir si se necesita
    if (redirect) {
        return <Navigate to={`/modify-project/${proyecto.id}`} />;
    }

    return (
        <div className="proyecto-card">
            {loading ? (
                <div>Loading...</div>
            ) : (
                proyecto ? (
                    <>
                        <div className="proyecto-header">
                            <h3>
                                <Link to={`/proyectos/${proyecto.id}`} className="proyecto-enlace">{proyecto.nombre}</Link>
                            </h3>
                            <p>{proyecto.descripcion}</p>
                            {proyecto.fecha && <p>{proyecto.fecha}</p>}


                            {proyecto.keyword && (
                                <p>
                                    {proyecto.keyword.split(',').map((kw, index) => {
                                        const trimmedKeyword = kw.trim();
                                        return (
                                            trimmedKeyword && (
                                                <span key={index}>
                                                    <span
                                                        onClick={() => handleKeywordClick(trimmedKeyword)}
                                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                                    >
                                                        {trimmedKeyword}
                                                    </span>
                                                    {index < proyecto.keyword.split(',').length - 1 && ' '} {/* Añade un espacio solo si no es la última palabra */}
                                                </span>
                                            )
                                        );
                                    })}
                                </p>
                            )}


                            {canModify && <button onClick={handleModifyClick} className="modify-button">Modificar</button>}
                        </div>

                        <div className="proyecto-body">
                            <div className="tarjeta-lista">
                                <h4>Grupos:</h4>
                                {grupos.length > 0 ? (
                                    grupos.map((grupo) => (
                                        <div key={grupo.id} className="tarjeta">
                                            <p className="grupo-nombre">
                                                <a href={`/grupos/${grupo.id}`} className="grupo-enlace">{grupo.nombre}</a>
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No tiene grupo</p>
                                )}
                            </div>

                            <div className="tarjeta-lista">
                                <h4>Investigadores:</h4>
                                {investigadores.length > 0 ? (
                                    investigadores.map((investigador) => (
                                        <div key={investigador.id} className="tarjeta">
                                            <p className="investigador-nombre">
                                                <a href={`/investigadores/${investigador.id}`} className="investigador-enlace">
                                                    {investigador.nombre} {investigador.apellido}
                                                </a>
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No tiene investigadores</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>No se encontró el proyecto.</div>
                )
            )}
        </div>
    );
}

export default ProyectoCard;