import React, { useState } from 'react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/signin/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store both access and refresh tokens
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user', email);  // Store the user's email

                // Limpiar el error y redirigir
                setError('');
                window.location.href = '/';  // Redirigir al home o a otra ruta
            } else {
                // Mostrar mensaje de error si falla el login
                setError(data.error || 'Login fallido');
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        }
    };

    return (
        <div>
            <h2>Iniciar Sesión</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
