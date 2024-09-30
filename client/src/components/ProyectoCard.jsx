import React, {useState, useEffect} from 'react';
import {getProyectos} from '../api/proyectos.api';
import {getGrupoById} from '../api/grupos.api';
import {getInvestigadorById} from '../api/investigadores.api';


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
        <div>
            <h3>{proyecto.nombre}</h3>
            <p>{proyecto.descripcion}</p>
            <p>Grupo:</p>
            {grupos.length > 0 ? (
                grupos.map((grupo) => (
                    <p key={grupo.id}>{grupo.nombre}</p>
                ))
            ) : (
                <p>No tiene grupo</p>
            )}
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