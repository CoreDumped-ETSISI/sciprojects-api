import React, {useEffect, useState} from 'react';
import {getGrupos} from '../api/grupos.api';
import {GrupoCard} from './GrupoCard';

export function GruposList() {
        
    const [grupos, setGrupos] = useState([]);

    useEffect(() => {
        async function fetchGrupos() {
            const res = await getGrupos();
            setGrupos(res.data);
    }
    fetchGrupos();

    }, []);

    return (

        <div>

            {grupos.map((grupo) => (
                <GrupoCard key={grupo.id} grupo={grupo} />
                // Sacar los investigadores de cada grupo
            ))}

        </div>
    );  
}
