// components/Home.jsx
import React, { useEffect, useState } from 'react';
import { InvestigadoresList } from './InvestigadoresList';
import { ProyectosList } from './ProyectosList';
import { GruposList } from './GruposList';
import BarraBusqueda from './BarraBusqueda';
/**

* Home es un componente de React que actúa como la página de inicio de la 
* aplicación. Se encarga de renderizar tres componentes principales: 
* ProyectosList, GruposList e InvestigadoresList. 
* 
* Al montarse, este componente muestra un encabezado "Inicio" y presenta 
* las listas de proyectos, grupos e investigadores en su respectivo orden. 
* Este diseño permite a los usuarios ver de manera rápida y fácil 
* la información relevante sobre proyectos, grupos e investigadores 
* en un solo lugar.
*/





export const Home = () => {
    // Mostar componente investigadores
    return (
        <div>
            {/* <h1>Inicio</h1>
            <ProyectosList />
            <GruposList />
            <InvestigadoresList /> */}
            <p>Bienvenido al repositorio de proyectos de la UPM.</p>
            <BarraBusqueda />

        </div>
    );

}

export default Home;
