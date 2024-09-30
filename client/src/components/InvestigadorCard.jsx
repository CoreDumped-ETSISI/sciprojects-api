import React, { useEffect, useState } from 'react';
import { getGrupos } from '../api/grupos.api'; // Asegúrate de que esta función exista
import { getProyectos } from '../api/proyectos.api'; // Asegúrate de que esta función exista
import './InvestigadorCard.css'; // Asegúrate de crear este archivo para los estilos

export function InvestigadorCard({ investigador }) {
    const [grupos, setGrupos] = useState([]);
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        async function fetchGrupos() {
            const res = await getGrupos();
            // Filtrar los grupos que incluyen al investigador
            const gruposFiltrados = res.data.results.filter(grupo =>
                grupo.investigadores.includes(investigador.id) // Filtrar por ID
            );
            setGrupos(gruposFiltrados);
        }
        fetchGrupos();
    }, [investigador.id]);

    useEffect(() => {
        async function fetchProyectos() {
            const res = await getProyectos();
            // Filtrar los proyectos que incluyen al investigador
            const proyectosFiltrados = res.data.results.filter(proyecto =>
                proyecto.investigadores.includes(investigador.id) // Filtrar por ID
            );
            setProyectos(proyectosFiltrados);
        }
        fetchProyectos();
    }, [investigador.id]);

    return (
        <div className="investigador-card">
            <div className="investigador-header">
                <h2 className="investigador-nombre">{investigador.nombre} {investigador.apellido}</h2>
                <p className="investigador-email">{investigador.email}</p>
            </div>

            <div className="investigador-body">
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
                        <p>No pertenece a ningún grupo</p>
                    )}
                </div>

                <div className="tarjeta-lista">
                    <h4>Proyectos:</h4>
                    {proyectos.length > 0 ? (
                        proyectos.map((proyecto) => (
                            <div key={proyecto.id} className="tarjeta">
                                <p className="proyecto-nombre">
                                    <a href={`/proyectos/${proyecto.id}`} className="proyecto-enlace">{proyecto.nombre}</a>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No participa en ningún proyecto</p>
                    )}
                </div>
            </div>
        </div>
    );
};
