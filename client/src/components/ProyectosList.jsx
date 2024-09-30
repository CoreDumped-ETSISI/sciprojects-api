import React, {useEffect, useState} from 'react';
import {getProyectos} from '../api/proyectos.api';
import {ProyectoCard} from './ProyectoCard';

export function ProyectosList() {
    
    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        async function fetchProyectos() {
            const res = await getProyectos();
            setProyectos(res.data);
    }
    fetchProyectos();

    }, []);

    return (

    <div>

    {proyectos.map((proyecto) => (
    <ProyectoCard key={proyecto.id} proyecto={proyecto} />
    ))}

    </div>
    );  
}

