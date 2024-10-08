import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import "./styles/CreateGroup.css"; 
import { useParams } from "react-router-dom";

const SelectWithSearch = ({ options, selectedOptions, setSelectedOptions, label }) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const filteredOptions = options.filter(option => 
        option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectChange = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(option => option.value);
        const newSelectedOptions = [...new Set([...selectedOptions, ...selected])];
        setSelectedOptions(newSelectedOptions);
    };

    return (
        <div className="select-with-search">
            <h2>{label}</h2>
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                multiple
                value={selectedOptions}
                onChange={handleSelectChange}
            >
                {filteredOptions.map(option => (
                    <option key={option.id} value={option.id}>
                        {option.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
};

const SelectedItems = ({ items, label }) => {
    return (
        <div className="selected-items">
            <h3>{label}</h3>
            {items.length === 0 ? (
                <p>No hay seleccionados.</p>
            ) : (
                <ul>
                    {items.map(item => (
                        <li key={item.id}>{item.nombre}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export function CreateGroup() {
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [researchers, setResearchers] = useState([]);
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [link, setLink] = useState("");
    const [pageInvestigador, setPageInvestigador] = useState(1);


    useEffect(() => {
        if (id) {
            const fetchGroupData = async () => {
                try {
                    const response = await fetchWithAuth(`http://localhost:8000/api/v1/grupos/${id}/`);
                    if (response.ok) {
                        const groupData = await response.json();
                        setName(groupData.nombre);
                        setDescription(groupData.descripcion);
                        setLink(groupData.link);
                        setSelectedResearchers(groupData.investigadores); // Asumiendo que es un array de IDs
                    } else {
                        alert("Error al obtener los datos del grupo");
                    }
                } catch (err) {
                    alert("Error al conectar con el servidor");
                }
            };
            fetchGroupData();
        }
    }, [id]);


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


    useEffect(() => {
        fetchInvestigadores();
    }, [pageInvestigador]);

    const fetchInvestigadores = async () => {
        let allResearchers = [];
        let page = 1;
    
        while (true) {
            try {
                const response = await fetchWithAuth(`http://localhost:8000/api/v1/investigadores/?page=${page}`);
                if (!response.ok) {
                    throw new Error("Error al obtener los investigadores");
                }
                const data = await response.json();
    
                // Concatenar los investigadores de la página actual
                allResearchers = [...allResearchers, ...data.results];
    
                // Si no hay más resultados, salir del bucle
                if (!data.next) {
                    break;
                }
                page++;
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
                break;
            }
        }
    
        setResearchers(allResearchers);
    };

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

        const grupoName = document.querySelector("input[placeholder='Nombre']").value;

        if (!grupoName) {
            alert("Por favor, completa el campo de nombre del grupo");
            return;
        }


        try {
            const response = await fetchWithAuth("http://localhost:8000/api/v1/grupos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    'nombre': name,
                    'descripcion': description,
                    'investigadores': selectedResearchers,
                    'link': link,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Grupo creado");
                // Redirigir o realizar otra acción después de crear el grupo
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
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    'nombre': name,
                    'descripcion': description,
                    'investigadores': selectedResearchers,
                    'link': link,
                }),
            });
        
            if (response.ok) {
                alert("Grupo modificado");
            } else {
                alert(data.error || "Error al modificar el grupo");
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    const selectedResearchersData = researchers.filter(researcher => selectedResearchers.includes(researcher.id));

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

            <input 
                type="text" 
                placeholder="Enlace" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                className="input-field" 
            />

            <SelectWithSearch
                options={researchers}
                selectedOptions={selectedResearchers}
                setSelectedOptions={setSelectedResearchers}
                label="Seleccionar Investigadores"
            />
            <SelectedItems items={selectedResearchersData} label="Investigadores Seleccionados" />            
            {id ? (
                <button onClick={handleUpdateGroup} className="submit-button">Modificar grupo</button>
            ) : (
                <button onClick={handleCreateGroup} className="submit-button">Crear grupo</button>
            )}
        </div>
    );
}