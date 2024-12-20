import React, { useState, useEffect } from "react";
import "./styles/MyProfile.css";
import { getInvestigadorById } from "../api/investigadores.api";


/**
 * MyProfile es un componente de React que permite a los investigadores ver y actualizar su perfil,
 * así como cambiar su contraseña y ver los grupos y proyectos a los que pertenece.
 * 
 * - Utiliza varios hooks de estado para manejar la información del usuario, 
 *   el investigador, los grupos, los proyectos, mensajes de error y mensajes de éxito.
 * - Al cargar el componente, se obtiene el email del usuario del localStorage, 
 *   y se hace una solicitud a la API para recuperar la información del investigador correspondiente.
 * - El perfil se puede actualizar mediante un formulario, que envía una solicitud PUT 
 *   a la API con los datos actualizados del investigador.
 * - También hay un formulario para cambiar la contraseña, que envía la contraseña actual y 
 *   la nueva contraseña a la API para su actualización.
 * - Los grupos y proyectos a los que pertenece el investigador se muestran en listas.
 * - Se gestionan errores y mensajes de éxito para mejorar la experiencia del usuario.
 * - Si el investigador no se encuentra, se muestra un mensaje de error. 
 * - Se requiere que el usuario esté autenticado; de lo contrario, se muestra un mensaje de carga.
 * - Estilos personalizados se aplican a través de un archivo CSS externo llamado "MyProfile.css".
 */


export function MyProfile() {
    const [user, setUser] = useState(null);
    const [investigador, setInvestigador] = useState({});
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [grupos, setGrupos] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userEmail = localStorage.getItem('user');
        if (userEmail) {
            setUser(userEmail);
            fetchInvestigador(userEmail);
        }
    }, []);

    const fetchInvestigador = async (email) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/investigadores?email=${email}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                const investigadorEncontrado = data.results.find(investigador => investigador.email === email);
                if (investigadorEncontrado) {

                    const investigadorId = investigadorEncontrado.id;

                    try {
                        const researcher = await getInvestigadorById(investigadorId);
                        if (researcher.data) {
                            setInvestigador(researcher.data);
                            setGrupos(researcher.data.grupos);
                            setProyectos(researcher.data.proyectos);
                        }
                    } catch (error) {
                        console.error("Error fetching investigador:", error);
                        
                    }

                } else {
                    setError('Investigador no encontrado');
                }
            } else {
                setError(data.error || 'Error al cargar perfil');
                localStorage.removeItem('access_token');
                window.location.href = '/signin';
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };




    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/investigadores/${investigador.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(investigador),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Información actualizada');
            } else {
                setError(data.error || 'Error al actualizar');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/change_password/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ 
                    password: password,
                    new_password: newPassword,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Contraseña actualizada');
            } else {
                setError(data.error || 'Error al actualizar contraseña');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };

    if (!user) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="profile-container">
            <h2>Mi Perfil</h2>
            <p>Email: {investigador.email}</p>
            <form onSubmit={handleUpdateProfile}>
                <input
                    type="text"
                    value={investigador.nombre || ''}
                    onChange={(e) => setInvestigador({ ...investigador, nombre: e.target.value })}
                    placeholder="Nombre"
                    required
                />
                <input
                    type="text"
                    value={investigador.apellido || ''}
                    onChange={(e) => setInvestigador({ ...investigador, apellido: e.target.value })}
                    placeholder="Apellido"
                    required
                />
                <input
                    type="text"
                    value={investigador.link || ''}
                    onChange={(e) => setInvestigador({ ...investigador, link: e.target.value })}
                    placeholder="Link"
                />
                <input
                    type="text"
                    value={investigador.moreInfo || ''}
                    onChange={(e) => setInvestigador({ ...investigador, moreInfo: e.target.value })}
                    placeholder="Más Información"
                />
                <button type="submit">Actualizar Perfil</button>
            </form>

            <form onSubmit={handleUpdatePassword}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña Actual"
                    required
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva Contraseña"
                    required
                />
                <button type="submit">Cambiar Contraseña</button>
            </form>


            {/* Mostrar Grupos */}
            <div className="groups-projects-section">
                <h3>Mis Grupos</h3>
                <ul className="groups-list">
                    {grupos.length > 0 ? (
                        grupos.map((grupo) => (
                            <li key={grupo.id} className="group-item">
                                <a href={`/grupos/${grupo.id}`} className="group-link">
                                    {grupo.nombre}
                                </a>
                            </li>
                        ))
                    ) : (
                        <p>No perteneces a ningún grupo.</p>
                    )}
                </ul>
            </div>

            {/* Mostrar Proyectos */}
            <div className="groups-projects-section">
                <h3>Mis Proyectos</h3>
                <ul className="projects-list">
                    {proyectos.length > 0 ? (
                        proyectos.map((proyecto) => (
                            <li key={proyecto.id} className="project-item">
                                <a href={`/proyectos/${proyecto.id}`} className="project-link">
                                    {proyecto.nombre}
                                </a>
                            </li>
                        ))
                    ) : (
                        <p>No participas en ningún proyecto.</p>
                    )}
                </ul>
            </div>


            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
}