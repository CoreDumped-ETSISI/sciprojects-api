import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api'; // Asegúrate de tener esta función en tu API

export function GrupoCard({ grupo }) {
    const [investigadores, setInvestigadores] = useState([]);

    useEffect(() => {
        async function fetchInvestigadores() {
            const investigadoresPromises = grupo.investigadores.map(async (id) => {
                const res = await getInvestigadorById(id); // Obtener el investigador por ID
                return res.data; // Asegúrate de que esto devuelve el investigador correcto
            });
            const investigadoresData = await Promise.all(investigadoresPromises);
            setInvestigadores(investigadoresData);
        }

        if (grupo.investigadores && grupo.investigadores.length > 0) {
            fetchInvestigadores();
        }
    }, [grupo.investigadores]);

    return (
        <div>
            <h2>{grupo.nombre}</h2>
            <p>{grupo.descripcion}</p>
            <p>Investigadores:</p>
            {investigadores.length > 0 ? (
                investigadores.map((investigador) => (
                    <p key={investigador.id}>{investigador.nombre} {investigador.apellido}</p>
                ))
            ) : (
                <p>No tiene investigadores</p>
            )}
        </div>
    );
}
