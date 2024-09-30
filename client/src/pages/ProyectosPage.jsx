import React from "react";
import {ProyectosList} from "../components/ProyectosList";
import { Navigation } from "../components/Navigation";

export function ProyectosPage() {
    return (
        <div>
            <Navigation />
            <h1>Proyectos</h1>
            <ProyectosList />
        </div>
    );
}
