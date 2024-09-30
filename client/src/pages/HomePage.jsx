// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import {Home} from '../components/Home';
import {Navigation} from '../components/Navigation'; 

export const HomePage = () => {
    // Si quieres manejar la carga de investigadores aquí, hazlo así:
    return (
        <div>
            <Navigation />
            <Home />
        </div>
    );
};
