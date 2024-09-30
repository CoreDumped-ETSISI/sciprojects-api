import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';  // Para estilos personalizados

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
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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
