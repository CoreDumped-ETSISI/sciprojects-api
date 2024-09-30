import React, { useEffect, useState } from "react";

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

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        async function fetchGrupos() {
            try {
                const response = await fetch("http://localhost:8000/api/v1/grupos/");
                const data = await response.json();
                setGrupos(data);
            } catch (error) {
                console.error("Error fetching grupos:", error);
            }
        }

        async function fetchResearchers() {
            try {
                const response = await fetch("http://localhost:8000/api/v1/investigadores/");
                const data = await response.json();
                setResearchers(data);
            } catch (error) {
                console.error("Error fetching researchers:", error);
            }
        }

        fetchGrupos();
        fetchResearchers();
    }, []);

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
