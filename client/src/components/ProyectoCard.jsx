import React, {useState, useEffect} from 'react';
import {getProyectos} from '../api/proyectos.api';
import {getGrupoById} from '../api/grupos.api';
import {getInvestigadorById} from '../api/investigadores.api';
import './ProyectoCard.css'; // Asegúrate de crear este archivo para los estilos


export function ProyectoCard({ proyecto }) {
    const [grupos, setGrupos] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [investigadores, setInvestigadores] = useState([]);

    useEffect(() => {
        async function fetchGrupos() {
            const gruposPromises = proyecto.grupos.map(async (id) => {
                const res = await getGrupoById(id);
                return res.data;
            });
            const gruposData = await Promise.all(gruposPromises);
            setGrupos(gruposData);
        }
        
        if (proyecto.grupos && proyecto.grupos.length > 0) {
            fetchGrupos();
        }

    }, [proyecto.grupos]);


    useEffect(() => {
        async function fetchInvestigador() {
            const investigadoresPromises = proyecto.investigadores.map(async (id) => {
                const res = await getInvestigadorById(id);
                return res.data;
            });
            const investigadoresData = await Promise.all(investigadoresPromises);
            setInvestigadores(investigadoresData);

        }
        if (proyecto.investigadores && proyecto.investigadores.length > 0) {
            fetchInvestigador();
        }
    }, [proyecto.investigadores]);


    useEffect(() => {
        async function fetchProyectos() {
            const res = await getProyectos();
            setProyectos(res.data);
        }
        fetchProyectos();
    }
    , []);


    return (
        <div className="proyecto-card">
            <div className="proyecto-header">
                <h3 className="proyecto-nombre">{proyecto.nombre}</h3>
                <p>{proyecto.descripcion}</p>
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
        </div>
    );
};