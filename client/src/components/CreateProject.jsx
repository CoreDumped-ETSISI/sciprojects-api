import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { useParams } from "react-router-dom";
import "./styles/CreateProject.css";
import { getGrupos } from "../api/grupos.api";
import { getInvestigadores } from "../api/investigadores.api";

const SelectWithSearch = ({ options, selectedOptions, setSelectedOptions, label }) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const filteredOptions = options.filter(option => 
        option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectChange = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(option => option.value);
        
        // Crear un nuevo array combinando las selecciones anteriores y las nuevas
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

const SelectWithSearchInvestigador = ({ options, selectedOptions, setSelectedOptions, label }) => {
    const [searchTerm, setSearchTerm] = useState("");

    console.log(options);
    const filteredOptions = options.filter(option => {
        const regex = new RegExp(searchTerm, 'i'); // 'i' para hacer la búsqueda insensible a mayúsculas
        return `${option.nombre} ${option.apellido} ${option.email}`.match(regex);
    });

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
                placeholder="Buscar por nombre, apellido o correo..."
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
                        {option.nombre} {option.apellido} : {option.email}
                    </option>
                ))}
            </select>
        </div>
    );
};





const SelectedItems = ({ items, label, setSelectedOptions, selectedOptions }) => {
    const handleRemove = (id) => {
        const newSelectedOptions = selectedOptions.filter(itemId => itemId !== id);
        setSelectedOptions(newSelectedOptions);
    };

    return (
        <div className="selected-items">
            <h3>{label}</h3>
            {items.length === 0 ? (
                <p>No hay seleccionados.</p>
            ) : (
                <ul>
                    {items.map(item => (
                        <li key={item.id}>
                            {item.nombre} 
                            <span 
                                className="remove-icon" 
                                onClick={() => handleRemove(item.id)}
                                style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                            >
                                X
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const SelectedItemsInvestigador = ({ items, label, setSelectedOptions, selectedOptions }) => {
    const handleRemove = (id) => {
        const newSelectedOptions = selectedOptions.filter(itemId => itemId !== id);
        setSelectedOptions(newSelectedOptions);
    };

    return (
        <div className="selected-items">
            <h3>{label}</h3>
            {items.length === 0 ? (
                <p>No hay seleccionados.</p>
            ) : (
                <ul>
                    {items.map(item => (
                        <li key={item.id}>
                            {item.nombre} {item.apellido} : {item.email}
                            <span 
                                className="remove-icon" 
                                onClick={() => handleRemove(item.id)}
                                style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                            >
                                X
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export function CreateProject() {
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [grupos, setGrupos] = useState([]);
    const [investigadores, setInvestigadores] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [searchTermGrupo, setSearchTermGrupo] = useState("");
    const [searchTermInvestigador, setSearchTermInvestigador] = useState("");
    const [projectLink, setProjectLink] = useState("");
    const [projectDate, setProjectDate] = useState("");
    const [pageGrupo, setPageGrupo] = useState(1);
    const [pageInvestigador, setPageInvestigador] = useState(1);
    const [pageSize] = useState(10);


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
        fetchGrupos();
        fetchInvestigadores();
    }, [pageGrupo, pageInvestigador]);

    const fetchGrupos = async () => {
        try {
            const response = await getGrupos(pageGrupo, pageSize);
            setGrupos(response.data.results);
        } catch (error) {
            console.error("Error fetching grupos:", error);
        }
    };



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
    
        setInvestigadores(allResearchers);
    };

    const handleSearchGrupo = (e) => {
        setSearchTermGrupo(e.target.value);
    };

    const handleSearchInvestigador = (e) => {
        setSearchTermInvestigador(e.target.value);
    };


    const handleCreateProject = async () => {
        const projectName = document.querySelector("input[placeholder='Nombre']").value;
        const projectDescription = document.querySelector("input[placeholder='Descripción']").value;
        const projectLink = document.querySelector("input[placeholder='Link']").value;
        const projectKeyword = document.querySelector("input[placeholder='Keyword']").value;
        const projectDate = document.querySelector("input[placeholder='Fecha']").value;
        
    
        if (!projectName) {
            alert("Por favor, completa el nombre del proyecto");
            return;
        }
    
        try {
            const response = await fetchWithAuth("http://localhost:8000/api/v1/proyectos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    nombre: projectName,
                    descripcion: projectDescription,
                    link: projectLink,
                    keyword: projectKeyword,
                    fecha: projectDate,
                    grupos: selectedGroups,
                    investigadores: selectedResearchers,
                }),
            });
    
            if (response.ok) {
                alert("Proyecto creado con éxito");
                // Puedes redirigir o hacer otra acción después de crear el proyecto
            } else {
                const data = await response.json();
                alert(data.error || "Error al crear el proyecto");
            }
        } catch (err) {
            console.error("Error al crear el proyecto:", err);
            alert("Error al conectar con el servidor");
        }
    };


    // Filtrar grupos e investigadores seleccionados
    const selectedGruposData = grupos.filter(grupo => selectedGroups.includes(grupo.id));
    const selectedInvestigadoresData = investigadores.filter(investigador => selectedResearchers.includes(investigador.id));


    const title = id ? "Editar Proyecto" : "Crear Proyecto";

    return (
        
        
        <div className="create-project-container">
            <h2>{title}</h2>
            <input type="text" placeholder="Nombre" className="input-field" required />
            <input type="text" placeholder="Descripción" className="input-field" required />
            <input type="text" placeholder="Link" className="input-field" />
            <input type="text" placeholder="Keyword" className="input-field" />
            <input type='date' placeholder="Fecha" className="input-field" />
            <SelectWithSearch
                options={grupos}
                selectedOptions={selectedGroups}
                setSelectedOptions={setSelectedGroups}
                label="Seleccionar Grupos"
            />
            <SelectWithSearchInvestigador
                options={investigadores}
                selectedOptions={selectedResearchers}
                setSelectedOptions={setSelectedResearchers}
                label="Seleccionar Investigadores"
            />
            
            {/* Mostrar grupos seleccionados */}
            <SelectedItems 
                items={selectedGruposData} 
                label="Grupos Seleccionados" 
                selectedOptions={selectedGroups}
                setSelectedOptions={setSelectedGroups}    
            />
            
            {/* Mostrar investigadores seleccionados */}
            <SelectedItemsInvestigador
                items={selectedInvestigadoresData} 
                label="Investigadores Seleccionados" 
                selectedOptions={selectedResearchers}
                setSelectedOptions={setSelectedResearchers}
                
            />


        
            <button onClick={handleCreateProject}>{title}</button>
        </div>




    );
}
