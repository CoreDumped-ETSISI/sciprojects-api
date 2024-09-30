import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode' // import dependency

export function CreateProject() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectStartDate, setProjectStartDate] = useState("");
    const [projectEndDate, setProjectEndDate] = useState("");
    const [projectStatus, setProjectStatus] = useState("");
    const [grupos, setGrupos] = useState([]);
    const [researchers, setResearchers] = useState([]); // Lista de investigadores
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [projectKeywords, setProjectKeywords] = useState(""); 
    const [projectMoreInfo, setProjectMoreInfo] = useState("");

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
    

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetchWithAuth("http://localhost:8000/api/v1/grupos/");
                if (!response.ok) {
                    throw new Error("Error al obtener los grupos");
                }
                const data = await response.json();
                setGrupos(data.results);
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
            }
        }

        fetchGroups();
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
    


    const handleCreateProject = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/v1/proyectos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ 
                    'nombre': projectName,
                    'descripcion': projectDescription,
                    'grupos': selectedGroups, // Incluye los grupos seleccionados
                    'fecha_inicio': projectEndDate,
                    'fecha_fin': projectEndDate,
                    'keyword': projectKeywords,
                    'more_info': projectMoreInfo,
                    'investigadores': selectedResearchers // Incluye los investigadores seleccionados
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Proyecto creado");
            } else {
                alert(data.error || "Error al crear el proyecto");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    }

    const handleSelectGroup = (group) => {
        const groupId = group.id;
        if (selectedGroups.includes(groupId)) {
            // Si el grupo ya está seleccionado, lo eliminamos
            setSelectedGroups(selectedGroups.filter(id => id !== groupId));
            // También removemos los investigadores de ese grupo
            setSelectedResearchers(selectedResearchers.filter(researcherId => !group.investigadores.includes(researcherId)));
        } else {
            // Si no está seleccionado, lo agregamos
            setSelectedGroups([...selectedGroups, groupId]);
            // Agregamos los investigadores de ese grupo a los seleccionados
            setSelectedResearchers([...selectedResearchers, ...group.investigadores]);
        }
    };

    const handleSelectResearcher = (researcher) => {
        const researcherId = researcher.id;
        if (selectedResearchers.includes(researcherId)) {
            // Si el investigador ya está seleccionado, lo eliminamos
            setSelectedResearchers(selectedResearchers.filter(id => id !== researcherId));
        } else {
            // Si no está seleccionado, lo agregamos
            setSelectedResearchers([...selectedResearchers, researcherId]);
        }
    }; 


    return (
        <div>
            <h1>Crear Proyecto</h1>
            <input type="text" placeholder="Nombre del proyecto" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <input type="text" placeholder="Descripción del proyecto" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
            <input type="date" placeholder="Fecha de inicio" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} />
            <input type="date" placeholder="Fecha de fin" value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} />
            <input type="text" placeholder="Estado del proyecto" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} />
            <input type="text" placeholder="Palabras clave" value={projectKeywords} onChange={(e) => setProjectKeywords(e.target.value)} />
            <input type="text" placeholder="Más información" value={projectMoreInfo} onChange={(e) => setProjectMoreInfo(e.target.value)} />


            <h2>Grupos</h2>
            {grupos.map((grupo) => (
                <div key={grupo.id}>
                    <input
                        type="checkbox"
                        checked={selectedGroups.includes(grupo.id)}
                        onChange={() => handleSelectGroup(grupo)}
                    />
                    <label>{grupo.nombre}</label>
                </div>
            ))}

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


            <button onClick={handleCreateProject}>Crear Proyecto</button>
        </div>
    );
}
