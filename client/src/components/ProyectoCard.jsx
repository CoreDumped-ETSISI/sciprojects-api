import React, { useState, useEffect } from 'react';
import { getGrupoById } from '../api/grupos.api';
import { getInvestigadorById } from '../api/investigadores.api';
import './ProyectoCard.css'; // Asegúrate de crear este archivo para los estilos
import { Link, useParams } from 'react-router-dom';
import { getProyectoById } from '../api/proyectos.api';

export function ProyectoCard({ id }) {
    const [grupos, setGrupos] = useState([]);
    const [investigadores, setInvestigadores] = useState([]);
    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canModify, setCanModify] = useState(false); // Para controlar si se puede modificar

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
                checkUserPermission(investigadoresData); // Verifica permisos después de obtener investigadores
            }
        }
        fetchInvestigadores();
    }, [proyecto]);

    const checkUserPermission = (associatedResearchers) => {
        const currentUserId = localStorage.getItem('user'); // Obtener el id del usuario actual
        const isUserInGroup = associatedResearchers.some((researcher) => researcher.email === currentUserId);
        setCanModify(isUserInGroup);
    };

    const handleModifyClick = () => {
        // Lógica para manejar el clic en modificar
        console.log("Modificar proyecto");
    };

    return (
        <div className="proyecto-card">
            {loading ? ( // Agrega loading aquí para que sea más limpio
                <div>Loading...</div> // Mensaje de carga si no hay proyecto
            ) : (
                proyecto ? (
                    <>
                        <div className="proyecto-header">
                            <h3>
                                <Link to={`/proyectos/${proyecto.id}`} className="proyecto-enlace">{proyecto.nombre}</Link>
                            </h3>
                            <p>{proyecto.descripcion}</p>
                            {canModify && <button onClick={handleModifyClick} className="modify-button">Modificar</button>} {/* Botón de modificar */}
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
