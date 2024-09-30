import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api'; // Asegúrate de que esta función está correctamente implementada
import { getProyectoById } from '../api/proyectos.api'; // Función para obtener un proyecto por ID

export function GrupoCard({ grupo }) {
    const [investigadores, setInvestigadores] = useState([]);
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        async function fetchInvestigadores() {
            const investigadoresPromises = grupo.investigadores.map(async (id) => {
                const res = await getInvestigadorById(id); // Obtener el investigador por ID
                return res.data; // Asegúrate de que esto devuelve el investigador correcto
            });
            const investigadoresData = await Promise.all(investigadoresPromises);
            setInvestigadores(investigadoresData);
        }

        async function fetchProyectos() {
            const proyectosPromises = grupo.proyectos.map(async (id) => {
                const res = await getProyectoById(id); // Obtener el proyecto por ID
                return res.data; // Asegúrate de que esto devuelve el proyecto correcto
            });
            const proyectosData = await Promise.all(proyectosPromises);
            setProyectos(proyectosData);
        }

        if (grupo.investigadores && grupo.investigadores.length > 0) {
            fetchInvestigadores();
        }

        if (grupo.proyectos && grupo.proyectos.length > 0) {
            fetchProyectos();
        }
    }, [grupo.investigadores, grupo.proyectos]);

    return (
        <div>
            <h2>
                <a href={`/grupos/${grupo.id}`}>{grupo.nombre}</a> {/* Título del grupo como enlace */}
            </h2>
            <p>{grupo.descripcion}</p>
            <p>Investigadores:</p>
            {investigadores.length > 0 ? (
                investigadores.map((investigador) => (
                    <p key={investigador.id}>
                        <a href={`/investigadores/${investigador.id}`}>{investigador.nombre} {investigador.apellido}</a>
                    </p>
                ))
            ) : (
                <p>No tiene investigadores</p>
            )}
            <p>Proyectos:</p>
            {proyectos.length > 0 ? (
                proyectos.map((proyecto) => (
                    <p key={proyecto.id}>
                        <a href={`/proyectos/${proyecto.id}`}>{proyecto.nombre}</a>
                    </p>
                ))
            ) : (
                <p>No tiene proyectos</p>
            )}
        </div>
    );
}
