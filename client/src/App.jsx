import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { MyProfilePage } from './pages/MyProfilePage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { CreateProjectPage } from './pages/CreateProjectPage';



/**
 * App es el componente principal de la aplicación que gestiona las rutas y la navegación.
 * 
 * - Utiliza React Router para definir las rutas de la aplicación. Cada ruta está asociada a un 
 *   componente específico que se renderiza cuando la URL coincide con el path definido.
 * - Las rutas incluyen las siguientes páginas:
 *   - "/" : Página de inicio (HomePage)
 *   - "/investigadores" y "/investigadores/:id": Página para mostrar investigadores.
 *   - "/grupos" y "/grupos/:id": Página para mostrar grupos.
 *   - "/proyectos" y "/proyectos/:id": Página para mostrar proyectos.
 *   - "/signin": Página de inicio de sesión (LoginPage).
 *   - "/signup": Página de registro (RegisterPage).
 *   - "/profile": Página de perfil del usuario (MyProfilePage).
 *   - "/create-group": Página para crear un nuevo grupo (CreateGroupPage).
 *   - "/modify-group/:id": Página para modificar un grupo existente (CreateGroupPage).
 *   - "/create-project": Página para crear un nuevo proyecto (CreateProjectPage).
 *   - "/modify-project/:id": Página para modificar un proyecto existente (CreateProjectPage).
 * - Se importan estilos de Bootstrap y FontAwesome para el diseño y la iconografía de la aplicación.
 * - Este componente actúa como un contenedor que permite la navegación a través de las distintas páginas 
 *   de la aplicación sin recargar la página completa, aprovechando las capacidades del enrutador de React.
 */


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
        <Route path="/modify-group/:id" element={<CreateGroupPage />} />

        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/modify-project/:id" element={<CreateProjectPage />} />
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
