// components/Home.jsx
import React, { useEffect, useState } from 'react';
import { InvestigadoresList } from './InvestigadoresList';
import { ProyectosList } from './ProyectosList';
import { GruposList } from './GruposList';

export const Home = () => {
    // Mostar componente investigadores
    return (
        <div>
            <h1>Inicio</h1>
            <ProyectosList />
            <GruposList />
            <InvestigadoresList />
        </div>

    );

}

export default Home;
