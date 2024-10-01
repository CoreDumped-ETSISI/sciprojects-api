import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api';
import { getProyectos } from '../api/proyectos.api';
import './GrupoCard.css';
import { Link, useParams } from 'react-router-dom';
import { getGrupoById } from '../api/grupos.api';

export function GrupoCard({ id }) {
    const [investigadores, setInvestigadores] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [grupo, setGrupo] = useState(null); // Cambia a null para verificar la carga
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGrupo() {
            try {
                const res = await getGrupoById(id); // Obtener los datos del grupo usando el id
                setGrupo(res.data);
                setLoading(false);
            } catch (error) {
                
                console.error("Error fetching grupo:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGrupo();
    }, [id]);

    useEffect(() => {
        async function fetchInvestigadores() {
            if (grupo && grupo.investigadores && grupo.investigadores.length > 0) {
                const investigadoresPromises = grupo.investigadores.map(async (id) => {
                    const res = await getInvestigadorById(id);
                    return res.data;
                });
                const investigadoresData = await Promise.all(investigadoresPromises);
                setInvestigadores(investigadoresData);
            }
        }
        fetchInvestigadores();
    }, [grupo]);

    useEffect(() => {
        async function fetchProyectos() {
            try {
                const res = await getProyectos();
                const proyectosFiltrados = res.data.results.filter(proyecto =>
                    proyecto.grupos && proyecto.grupos.includes(grupo?.id)
                );
                setProyectos(proyectosFiltrados);
            } catch (error) {
                console.error("Error fetching proyectos:", error);
            }
        }
        if (grupo) {
            fetchProyectos();
        }
    }, [grupo]);

    if (loading) return <p>Cargando...</p>; // Muestra un mensaje de carga

    return (
        <div className="grupo-card">
            <div className="grupo-header">
                <h2>
                    <Link to={`/grupos/${grupo.id}`} className="grupo-enlace">{grupo.nombre}</Link>
                </h2>
                <p>{grupo.descripcion}</p>
            </div>
            
            <div className="grupo-body">
                <div className="tarjeta-lista">
                    <h3>Investigadores:</h3>
                    {investigadores.length > 0 ? (
                        investigadores.map((investigador) => (
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
                        proyectos.map((proyecto) => (
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
