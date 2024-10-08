import React from "react";
import {GruposList} from "../components/GruposList";
import { Navigation } from "../components/Navigation";
import { useParams } from 'react-router-dom';
import { GrupoCard } from "../components/GrupoCard";

export function GruposPage() {
    
    const { id } = useParams();


    return (
        <div>
            <Navigation />
            <div style={{ padding: "20px" }}>

            {id ? (
                <>
                    <h1>Detalles del Grupo</h1>
                    <GrupoCard id={id} />
                </>
            ) : (
                <>
                    <h1>Lista de Grupos</h1>
                    <GruposList />
                </>
            )}
            </div>
            
        </div>
    );
}
