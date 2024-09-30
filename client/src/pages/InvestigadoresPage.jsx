import React from "react";
import {InvestigadoresList} from "../components/InvestigadoresList";
import { Navigation } from "../components/Navigation";

export function InvestigadoresPage() {
    return (
        <div>
            <Navigation />
            <h1>Investigadores</h1>
            <InvestigadoresList />
        </div>
    );
}
