import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { useParams } from "react-router-dom";
import "./styles/CreateProject.css";
import { getGrupos } from "../api/grupos.api";

/**
 * CreateProject es un componente de React que permite a los usuarios crear y 
 * editar proyectos en la aplicación. Incluye formularios para ingresar 
 * detalles del proyecto (nombre, descripción, enlace, etc.) y selecciones 
 * de grupos e investigadores mediante componentes de selección con búsqueda.
 * Utiliza hooks para manejar el estado del componente y realizar peticiones 
 * a la API para obtener datos de grupos e investigadores. Además, incluye 
 * funcionalidad para abrir un modal de confirmación al eliminar un proyecto.
 */


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

    const [projectDescription, setProjectDescription] = useState("");
    const [projectKeyword, setProjectKeyword] = useState("");


    const [confirmationName, setConfirmationName] = useState("");
    const [projectName, setProjectName] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);


    // Abre el modal
    const openModal = () => {
        setModalIsOpen(true);
    };

    // Cierra el modal
    const closeModal = () => {
        setModalIsOpen(false);
        setConfirmationName("");
    };

    // Maneja la eliminación del proyecto
    const handleDeleteProject = async () => {
        if (confirmationName === projectName) {
            try {
                const response = await fetchWithAuth(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/proyectos/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });

                if (response.ok) {
                    alert("Proyecto eliminado con éxito");
                    closeModal();
                    // Redirige o haz algo después de eliminar el proyecto
                } else {

                    alert("Error al eliminar el proyecto");
                }
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
                alert("Error al conectar con el servidor");
            }
        } else {
            alert("El nombre del proyecto no coincide.");
        }
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
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/token/refresh/`, {
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

    useEffect(() => {
        if (id) {
            const fetchProjectData = async () => {
                try {
                    const response = await fetchWithAuth(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/proyectos/${id}/`);
                    if (response.ok) {
                        const data = await response.json();
                        setProjectName(data.nombre);
                        setProjectDescription(data.descripcion);
                        setProjectLink(data.link);
                        setProjectKeyword(data.keyword);
                        setProjectDate(data.fecha);
                        setSelectedGroups(data.grupos);
                        setSelectedResearchers(data.investigadores);
                    } else {
                        alert("Error al obtener el proyecto");
                    }
                } catch (err) {
                    console.error("Error al conectar con el servidor:", err);
                    alert("Error al conectar con el servidor");
                }
            };
        fetchProjectData();
        }
    }, [id]);




    const fetchInvestigadores = async () => {
        let allResearchers = [];
        let page = 1;
    
        while (true) {
            try {
                const response = await fetchWithAuth(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/investigadores/?page=${page}`);
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



    const handleUpdateProject = async () => {
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/proyectos/${id}/`, {
                method: "PUT",
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
                alert("Proyecto actualizado con éxito");
                // Puedes redirigir o hacer otra acción después de actualizar el proyecto
            } else {
                const data = await response.json();
                alert(data.error || "Error al actualizar el proyecto");

            }
        } catch (err) {
            console.error("Error al actualizar el proyecto:", err);
            alert("Error al conectar con el servidor");

        }
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
            const response = await fetchWithAuth(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/proyectos/`, {
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
            <input 
                type="text" 
                placeholder="Nombre" 
                className="input-field" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required />
            <input 
                type="text" 
                placeholder="Descripción" 
                className="input-field" 
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required />
            <input 
                type="text" 
                placeholder="Link" 
                className="input-field"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                />
            <input 
                type="text" 
                placeholder="Keyword" 
                className="input-field" 
                value={projectKeyword}
                onChange={(e) => setProjectKeyword(e.target.value)}
                />
            <input type='date' 
                placeholder="Fecha" 
                className="input-field" 
                value={projectDate}
                onChange={(e) => setProjectDate(e.target.value)}
                />
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


        
            {id ? (
                <button onClick={handleUpdateProject}>Actualizar Proyecto</button>
            ) : (
                <button onClick={handleCreateProject}>Crear Proyecto</button>
            )}

            {id && (
                <button onClick={openModal} style={{ backgroundColor: 'red' }}>Eliminar Proyecto</button>
            )}

            <div className="modal" style={{ display: modalIsOpen ? 'block' : 'none' }}>
                <div className="modal-content">
                    <h2>Eliminar Proyecto</h2>
                    <p>¿Estás seguro de que deseas eliminar el proyecto?</p>
                    <p>Introduce el nombre del proyecto para confirmar: {projectName}</p>
                    <input 
                        type="text" 
                        value={confirmationName} 
                        onChange={(e) => setConfirmationName(e.target.value)} 
                    />
                    <button onClick={handleDeleteProject} style={{ backgroundColor: 'red' }}>Eliminar</button>
                    <button onClick={closeModal}>Cancelar</button>
                </div>

            </div>
        </div>




    );
}
