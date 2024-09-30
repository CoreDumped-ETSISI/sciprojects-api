import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api'; // Asegúrate de que esta función está correctamente implementada
import { getProyectos } from '../api/proyectos.api'; // Función para obtener un proyecto por ID
import './GrupoCard.css'; // Asegúrate de crear este archivo para los estilos

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

        if (grupo.investigadores && grupo.investigadores.length > 0) {
            fetchInvestigadores();
        }
    }, [grupo.investigadores]);

    useEffect(() => {

        // Recorremos todos los proyectos y si proyecto.grupos contiene el id del grupo, lo añadimos a la lista
        async function fetchProyectos() {
            const res = await getProyectos();
            const proyectosFiltrados = res.data.results.filter(proyecto =>
                proyecto.grupos && proyecto.grupos.includes(grupo.id)                
            );
            setProyectos(proyectosFiltrados);
            console.log(proyectosFiltrados, 'proyectosFiltrados');
        }
        fetchProyectos();



    }
    , [grupo.id]); 

    return (
        <div className="grupo-card">
            <div className="grupo-header">
                <h2>
                    <a href={`/grupos/${grupo.id}`} className="grupo-enlace">{grupo.nombre}</a> {/* Título del grupo como enlace */}
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

                <div className="tarjeta-lista">
                    <h3>Proyectos:</h3>
                    {proyectos.length > 0 ? (
                        proyectos.map((proyecto) => (
                            <div key={proyecto.id} className="tarjeta">
                                <p>
                                    <a href={`/proyectos/${proyecto.id}`} className="proyecto-enlace">
                                        {proyecto.nombre}
                                    </a>
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

};
