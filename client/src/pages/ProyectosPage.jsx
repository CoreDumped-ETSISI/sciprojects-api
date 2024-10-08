import React from "react";
import {ProyectosList} from "../components/ProyectosList";
import { Navigation } from "../components/Navigation";
import { useParams } from 'react-router-dom';
import { ProyectoCard } from "../components/ProyectoCard";
export function ProyectosPage() {

    const { id } = useParams();

    return (
        <div>
            <Navigation />
            <div style={{ padding: "20px" }}>
                {id ? (
                    <>
                        <h1>Detalles del Proyecto</h1>
                        <ProyectoCard id={id} />
                    </>

                ) : (
                    <>
                    
                    <h1>Lista de Proyectos</h1>
                    <ProyectosList />
                    </>
                )}
                
            </div>

        </div>
    );
}
