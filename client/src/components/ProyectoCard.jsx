import React, { useState, useEffect } from 'react';
import { getGrupoById } from '../api/grupos.api';
import { getInvestigadorById } from '../api/investigadores.api';
import './styles/ProyectoCard.css'; // Asegúrate de crear este archivo para los estilos
import { Link, Navigate, useParams } from 'react-router-dom';
import { getProyectoById } from '../api/proyectos.api';
import { useNavigate } from 'react-router-dom';

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
        }
        fetchInvestigadores();
    }, [proyecto]);

    const checkUserPermission = (associatedResearchers) => {
        const currentUserId = localStorage.getItem('user'); 
        const isUserInGroup = associatedResearchers.some((researcher) => researcher.email === currentUserId);
        setCanModify(isUserInGroup);
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
                                    {proyecto.keyword.split(',').map((kw, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleKeywordClick(kw.trim())} // Elimina espacios en blanco
                                            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }} // Estilo inline, puedes moverlo a tu CSS
                                        >
                                            {kw.trim()} {/* Asegúrate de eliminar espacios en blanco */}
                                        </span>
                                    ))}
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