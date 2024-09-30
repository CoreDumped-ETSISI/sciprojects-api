import React, { useEffect, useState } from 'react';
import { getGrupos } from '../api/grupos.api'; // Asegúrate de que esta función exista
import { getProyectos } from '../api/proyectos.api'; // Asegúrate de que esta función exista

export function InvestigadorCard({ investigador }) {
    const [grupos, setGrupos] = useState([]);
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        async function fetchGrupos() {
            const res = await getGrupos();
            // Filtrar los grupos que incluyen al investigador
            const gruposFiltrados = res.data.filter(grupo =>
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
            const proyectosFiltrados = res.data.filter(proyecto =>
                proyecto.investigadores.includes(investigador.id) // Filtrar por ID
            );
            setProyectos(proyectosFiltrados);
        }
        fetchProyectos();
    }, [investigador.id]);

    return (
        <div>
            <h2>{investigador.nombre} {investigador.apellido}</h2>
            <p>{investigador.email}</p>
            <p>Grupos:</p>
            {grupos.length > 0 ? (
                grupos.map((grupo) => (
                    <p key={grupo.id}>{grupo.nombre}</p>
                ))
            ) : (
                <p>No pertenece a ningún grupo</p>
            )}
            <p>Proyectos:</p>
            {proyectos.length > 0 ? (
                proyectos.map((proyecto) => (
                    <p key={proyecto.id}>{proyecto.nombre}</p>
                ))
            ) : (
                <p>No participa en ningún proyecto</p>
            )}
        </div>
    );
}
