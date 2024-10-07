import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode'; // import dependency
import { useParams } from "react-router-dom";
import "./styles/CreateProject.css"; // Asegúrate de crear este archivo para los estilos
import { getGrupos } from "../api/grupos.api";
import { getInvestigadores } from "../api/investigadores.api";

export function CreateProject() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectStartDate, setProjectStartDate] = useState("");
    const [projectEndDate, setProjectEndDate] = useState("");
    const [projectStatus, setProjectStatus] = useState("");
    const [grupos, setGrupos] = useState([]);
    const [researchers, setResearchers] = useState([]); 
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [projectKeywords, setProjectKeywords] = useState(""); 
    const [projectMoreInfo, setProjectMoreInfo] = useState("");

    const { id } = useParams(); // Recuperar el ID de la URL

    useEffect(() => {
        if (id) {
            // Si hay un id, es un proyecto existente: cargamos la información
            fetchProjectData();
        }
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const response = await fetchWithAuth(`http://localhost:8000/api/v1/proyectos/${id}/`);
            const data = await response.json();
            
            if (response.ok) {
                // Seteamos los datos del proyecto en los estados
                setProjectName(data.nombre);
                setProjectDescription(data.descripcion);
                setProjectStartDate(data.fecha_inicio);
                setProjectEndDate(data.fecha_fin);
                setSelectedGroups(data.grupos);
                setSelectedResearchers(data.investigadores);
                setProjectKeywords(data.keyword);
                setProjectMoreInfo(data.more_info);
            } else {
                console.error("Error al obtener el proyecto", data);
            }
        } catch (err) {
            console.error("Error al conectar con el servidor:", err);
        }
    };

    const handleCreateOrUpdateProject = async () => {
        const method = id ? "PUT" : "POST";
        const url = id ? `http://localhost:8000/api/v1/proyectos/${id}/` : "http://localhost:8000/api/v1/proyectos/";
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ 
                    'nombre': projectName,
                    'descripcion': projectDescription,
                    'grupos': selectedGroups,
                    'fecha_inicio': projectStartDate,
                    'fecha_fin': projectEndDate,
                    'keyword': projectKeywords,
                    'more_info': projectMoreInfo,
                    'investigadores': selectedResearchers
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(id ? "Proyecto modificado" : "Proyecto creado");
            } else {
                alert(data.error || `Error al ${id ? "modificar" : "crear"} el proyecto`);
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };


    useEffect(() => {
        const access_token = localStorage.getItem("access_token");
        if (access_token) {
            const decoded = jwtDecode(access_token);
            if (decoded) {
                setIsAuthenticated(true);
            }
        }
    
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await getGrupos();
                const data = await response.json();
                if (response.ok) {
                    setGrupos(data.results);
                } else {
                    console.error("Error al cargar grupos", data);
                }
            } catch (err) {
                console.error("Error al conectar con el servidor", err);
            }
        };

        const fetchResearchers = async () => {
            try {
                const response = await getInvestigadores();
                const data = await response.json();
                if (response.ok) {
                    console.log(data.results, "data.results");
                    setResearchers(data.results);
                } else {
                    console.error("Error al cargar investigadores", data);
                }
            } catch (err) {
                console.error("Error al conectar con el servidor", err);
            }
        }
    }, []);

    if (!isAuthenticated) {
        return (
            <div>
                <h1>Debes iniciar sesión para acceder a esta página</h1>
            </div>
        );
    }


    return (
        <div className="create-project-container">
            <h1>{id ? "Modificar Proyecto" : "Crear Proyecto"}</h1>
            <input 
                type="text" 
                placeholder="Nombre del proyecto" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Descripción del proyecto" 
                value={projectDescription} 
                onChange={(e) => setProjectDescription(e.target.value)} 
            />
            <input 
                type="date" 
                placeholder="Fecha de inicio" 
                value={projectStartDate} 
                onChange={(e) => setProjectStartDate(e.target.value)} 
            />
            <input 
                type="date" 
                placeholder="Fecha de fin" 
                value={projectEndDate} 
                onChange={(e) => setProjectEndDate(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Estado del proyecto" 
                value={projectStatus} 
                onChange={(e) => setProjectStatus(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Palabras clave" 
                value={projectKeywords} 
                onChange={(e) => setProjectKeywords(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Más información" 
                value={projectMoreInfo} 
                onChange={(e) => setProjectMoreInfo(e.target.value)} 
            />

            {/* Grupos */}
            <h2>Grupos</h2>
            <select
                multiple
                value={selectedGroups}
                onChange={(e) => {
                    const options = e.target.selectedOptions;
                    const selected = Array.from(options).map(option => option.value);
                    setSelectedGroups(selected);
                }}
            >
                {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                        {grupo.nombre}
                    </option>
                ))}
            </select>

            <h2>Investigadores</h2>
            <select
                multiple
                value={selectedResearchers}
                onChange={(e) => {
                    const options = e.target.selectedOptions;
                    const selected = Array.from(options).map(option => option.value);
                    setSelectedResearchers(selected);
                }}
            >
                {researchers.map((researcher) => (
                    <option key={researcher.id} value={researcher.id}>
                        {researcher.nombre} {researcher.apellido}
                    </option>
                ))}
            </select>

            <button onClick={handleCreateOrUpdateProject}>
                {id ? "Modificar Proyecto" : "Crear Proyecto"}
            </button>

        </div>
    );

}