import React, { useState, useEffect } from "react";

export function MyProfile() {
    const [user, setUser] = useState(null);
    const [investigador, setInvestigador] = useState({});
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {

        // Guardar user con el correo del investigador
        const user = localStorage.getItem('user');

        if (user) {
            setUser(user);
            const investigador = fetchInvestigador(user);
            setInvestigador(investigador);
        }
    }
        , []);



    const fetchInvestigador = async (email) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/investigadores?email=${email}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json', 
                },

            });

            
            const data = await response.json();
            if (response.ok) {
                // Devolver aquel investigador que tenga el correo del usuario
                for (let i = 0; i < data.results.length; i++) {
                    if (data.results[i].email === email) {
                        setInvestigador(data.results[i]);
                    }
                }

            } else {
                setError(data.error || 'Error al cargar perfil');
                // Hacer login nuevamente
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/signin';
            }
        } catch (err) {
            console.log(err);
            setError('Error al conectar con el servidor');

        }
    }


    const handleUpdateProfile = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario
        try {
            console.log(investigador, 'investigador');

            const response = await fetch(`http://localhost:8000/api/v1/investigadores/${investigador.id}/`, {
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
            console.log(err);
            setError('Error al conectar con el servidor');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario
        try {
            const response = await fetch(`http://localhost:8000/api/v1/change_password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ password, newPassword }),
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
        <div>
            <p>Email: {investigador.email}</p>
            <form onSubmit={handleUpdateProfile}>
                <input
                    type="text"
                    value={investigador.nombre}
                    onChange={(e) => setInvestigador({ ...investigador, nombre: e.target.value })}
                    placeholder="Nombre"
                    required
                />
                <input
                    type="text"
                    value={investigador.apellido}
                    onChange={(e) => setInvestigador({ ...investigador, apellido: e.target.value })}
                    placeholder="Apellido"
                    required
                />
                <input
                    type="text"
                    value={investigador.link}
                    onChange={(e) => setInvestigador({ ...investigador, link: e.target.value })}
                    placeholder="Link"
                />
                <input
                    type="text"
                    value={investigador.moreInfo}
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

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );

}