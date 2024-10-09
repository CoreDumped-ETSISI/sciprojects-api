import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navigation.css';

/**
 * Navigation es un componente de React que maneja la barra de navegación de la aplicación.
 * 
 * - Utiliza el hook useState para determinar si el usuario está autenticado o no,
 *   basado en la presencia de un token de acceso en el localStorage.
 * - Al montar el componente, se verifica si hay un token en localStorage y se actualiza el estado 
 *   isAuthenticated en consecuencia.
 * - El componente proporciona enlaces de navegación a varias secciones de la aplicación, incluyendo 
 *   Investigadores, Grupos y Proyectos, accesibles para todos los usuarios.
 * - Si el usuario está autenticado, se muestran enlaces adicionales para acceder a su perfil, 
 *   crear grupos y proyectos, así como un botón para cerrar sesión. 
 * - Al cerrar sesión, se elimina el token del localStorage, se actualiza el estado de autenticación 
 *   y se redirige al usuario a la página de inicio de sesión.
 * - Si el usuario no está autenticado, se muestran opciones para iniciar sesión o registrarse.
 * - El componente utiliza estilos personalizados de un archivo CSS externo llamado "Navigation.css" 
 *   y hace uso de Bootstrap para la estructura de la barra de navegación.
 */


export function Navigation() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Verificar si el token existe en localStorage
    useEffect(() => {
        const token = localStorage.getItem('access_token'); 
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Manejar cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('access_token');  // Eliminar token
        setIsAuthenticated(false);
        navigate('/signin');  // Redirigir a la página de inicio de sesión
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img
                        src="https://www.upm.es/gsfs/SFS11416"
                        alt="Logo"
                        width="150"  // Ajustar el tamaño del logo
                        className="d-inline-block align-text-top"
                    />
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {/* Links generales accesibles para todos los usuarios */}
                        <li className="nav-item">
                            <Link to="/investigadores" className="nav-link">Investigadores</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/grupos" className="nav-link">Grupos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/proyectos" className="nav-link">Proyectos</Link>
                        </li>

                        {/* Links condicionados a la autenticación del usuario */}
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link to="/profile" className="nav-link">Mi Perfil</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/create-group" className="nav-link">Crear Grupo</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/create-project" className="nav-link">Crear Proyecto</Link>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={handleLogout}>
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link to="/signin" className="nav-link">
                                        <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/signup" className="nav-link">Registrarse</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
