import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import Grupos from './components/Grupos'; // Asegúrate de que la ruta sea correcta
//import Proyectos from './components/Proyectos'; // Asegúrate de que la ruta sea correcta
//import Login from './components/Login'; // Asegúrate de que la ruta sea correcta
//import Register from './components/Register'; // Asegúrate de que la ruta sea correcta
import { HomePage } from './pages/HomePage';
import { InvestigadoresPage } from './pages/InvestigadoresPage';
import { GruposPage } from './pages/GruposPage';
import { ProyectosPage } from './pages/ProyectosPage';
import '@fortawesome/fontawesome-free/css/all.css';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';  // Importa FontAwesome
import { InvestigadorCard } from './components/InvestigadorCard';
import { MyProfilePage } from './pages/MyProfilePage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { CreateProjectPage } from './pages/CreateProjectPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/investigadores" element={<InvestigadoresPage />} />
        <Route path="investigadores/:id" element={<InvestigadoresPage />} />

        <Route path="/grupos" element={<GruposPage />} />
        <Route path="/grupos/:id" element={<GruposPage />} />

        <Route path="/proyectos" element={<ProyectosPage />} />
        <Route path="/proyectos/:id" element={<ProyectosPage />} />

        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/create-project" element={<CreateProjectPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
