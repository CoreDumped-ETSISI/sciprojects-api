import React, { useState, useEffect } from "react";

import { jwtDecode } from 'jwt-decode' // import dependency


export function CreateGroup() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [researchers, setResearchers] = useState([]);
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [link, setLink] = useState("");
    const [moreInfo, setMoreInfo] = useState("");

    useEffect(() => {
        async function fetchResearchers() {
            try {
                const response = await fetchWithAuth("http://localhost:8000/api/v1/investigadores/");
                if (!response.ok) {
                    throw new Error("Error al obtener los investigadores");
                }
                const data = await response.json();
                setResearchers(data);
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
            }
        }
    
        fetchResearchers();
    }, []);
    
    // La función fetchWithAuth manejará la autenticación y renovación del token.
    const fetchWithAuth = async (url, options = {}) => {
        let token = localStorage.getItem('access_token');
    
        if (!isTokenValid(token)) {
            // Si el token no es válido, intenta renovarlo
            token = await refreshToken();
            if (!token) {
                return; // Si no se puede renovar el token, detén la ejecución
            }
        }
    
        // Añade el token a los headers de la solicitud
        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`,
        };
    
        return fetch(url, options);
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token && isTokenValid(token)) {
            setIsAuthenticated(true);
        } else {
            console.log("Token inválido");
            // Mostrar cuando caduca el token
            
            console.log(jwtDecode(token).exp);
            console.log(Date.now() / 1000);
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            window.location.href = "/signin"; // Redirige al usuario a iniciar sesión si el token no es válido
        }
    }, []);


    const isTokenValid = (token) => {
        if (!token) return false;    
        try {
            const decodedToken = jwtDecode(token); // Decodifica el token JWT
            const currentTime = Date.now() / 1000; // Tiempo actual en segundos
            console.log(decodedToken, currentTime);
            return decodedToken.exp > currentTime; // Compara la expiración con el tiempo actual
        } catch (e) {
            return false;
        }
    };

    const refreshToken = async () => {
        const refresh = localStorage.getItem('refresh_token');
        
        if (refresh) {
            try {
                const response = await fetch('http://localhost:8000/api/v1/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('access_token', data.access);  // Actualizar el token de acceso
                    return data.access;
                } else {
                    console.log('Error al refrescar el token');
                    return null;
                }
            } catch (err) {
                console.log('Error en la conexión:', err);
                return null;
            }
        }
    };
    
    
    
    const handleCreateGroup = async () => {
        try {
            const response = await fetchWithAuth("http://localhost:8000/api/v1/grupos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    'nombre': name,
                    'descripcion': description,
                    'investigadores': selectedResearchers,
                    'link': link,
                    'more_info': moreInfo,
                    }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Grupo creado");
            } else {
                console.log(data);
                alert(data.error || "Error al crear el grupo");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };
    

    const handleSelectResearcher = (researcher) => {
        const researcherId = researcher.id; // Asegúrate de que aquí estás obteniendo el ID correcto
        if (selectedResearchers.includes(researcherId)) {
            // Si el investigador ya está seleccionado, lo eliminamos por su ID
            setSelectedResearchers(selectedResearchers.filter((id) => id !== researcherId));
        } else {
            // Si no está seleccionado, lo agregamos
            setSelectedResearchers([...selectedResearchers, researcherId]);
        }
    };
    

    return (
        <div>
            <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />

            <h2>Investigadores</h2>
            {researchers.map((researcher) => (
                <div key={researcher.id}>
                    <input
                        type="checkbox"
                        checked={selectedResearchers.includes(researcher.id)}
                        onChange={() => handleSelectResearcher(researcher)}
                    />
                    <label>{researcher.nombre} {researcher.apellido}</label>
                </div>
            ))}

            <input type="text" placeholder="Enlace" value={link} onChange={(e) => setLink(e.target.value)} />
            <input type="text" placeholder="Más información" value={moreInfo} onChange={(e) => setMoreInfo(e.target.value)} />

            <button onClick={handleCreateGroup}>Crear grupo</button>
        </div>
    );
}
