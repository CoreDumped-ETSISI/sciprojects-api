import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode'; // import dependency
import "./styles/CreateGroup.css"; // Asegúrate de crear este archivo para los estilos
import { useParams } from "react-router-dom";


export function CreateGroup() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [researchers, setResearchers] = useState([]);
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [link, setLink] = useState("");
    const [moreInfo, setMoreInfo] = useState("");

    const { id } = useParams();


    const fetchWithAuth = async (url, options = {}) => {
        let token = localStorage.getItem('access_token');

        if (!isTokenValid(token)) {
            token = await refreshToken();
            if (!token) {
                return;
            }
        }

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
            alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            window.location.href = "/signin";
        }
    }, []);

    useEffect(() => {
        async function fetchResearchers() {
            try {
                const response = await fetchWithAuth("http://localhost:8000/api/v1/investigadores/");
                if (!response.ok) {
                    throw new Error("Error al obtener los investigadores");
                }
                const data = await response.json();
                setResearchers(data.results);
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
            }
        }

        fetchResearchers();
    }, []);

    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decodedToken.exp > currentTime;
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
                    localStorage.setItem('access_token', data.access);
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
                alert(data.error || "Error al crear el grupo");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const handleUpdateGroup = async () => {
        try {
            
            const response = await fetchWithAuth(`http://localhost:8000/api/v1/grupos/${id}/`, {
                method: "PUT",
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
                alert("Grupo modificado");
            } else {
                alert(data.error || "Error al modificar el grupo");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    }

    const handleSelectResearcher = (researcher) => {
        const researcherId = researcher.id;
        if (selectedResearchers.includes(researcherId)) {
            setSelectedResearchers(selectedResearchers.filter((id) => id !== researcherId));
        } else {
            setSelectedResearchers([...selectedResearchers, researcherId]);
        }
    };

    return (
        <div className="create-group-container">

            <h2>{id ? "Modificar grupo" : "Crear grupo"}</h2>


    
            <input 
                type="text" 
                placeholder="Nombre" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="input-field" 
                required 
            />
            
            <input 
                type="text" 
                placeholder="Descripción" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="input-field" 
                required 
            />
    
            <h3>Investigadores</h3>
            <select 
                multiple 
                value={selectedResearchers} 
                onChange={(e) => {
                    const options = e.target.selectedOptions;
                    const selected = Array.from(options).map(option => option.value);
                    setSelectedResearchers(selected);
                }} 
                className="select-field"
            >
                {researchers.map((researcher) => (
                    <option key={researcher.id} value={researcher.id}>
                        {researcher.nombre} {researcher.apellido}
                    </option>
                ))}
            </select>
    
            <input 
                type="text" 
                placeholder="Enlace" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                className="input-field" 
            />
            
            <input 
                type="text" 
                placeholder="Más información" 
                value={moreInfo} 
                onChange={(e) => setMoreInfo(e.target.value)} 
                className="input-field" 
            />
    
            
            { id ? (
                <button onClick={handleUpdateGroup} className="submit-button">Modificar grupo</button>
            ) : (
                <button onClick={handleCreateGroup} className="submit-button">Crear grupo</button>
            )}

        </div>
    );
}    