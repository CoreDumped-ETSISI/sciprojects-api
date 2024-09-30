import React from "react";
import {GruposList} from "../components/GruposList";
import { Navigation } from "../components/Navigation";
export function GruposPage() {
    return (
        <div>
            <Navigation />
            <h1>Grupos</h1>
            <GruposList />
        </div>
    );
}
