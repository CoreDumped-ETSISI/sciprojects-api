import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import "./styles/CreateGroup.css"; 
import { useParams } from "react-router-dom";



// Funcionalidades Principales
// Creación y Modificación de Grupos:

// Los usuarios pueden ingresar un nombre, una descripción y un enlace para el grupo.
// Si se proporciona un id en la URL (a través de useParams), el componente se configura para modificar un grupo existente. En este caso, se carga la información del grupo desde la API y se prellenan los campos correspondientes.
// Selección de Investigadores:

// Se incluye un campo de selección múltiple (SelectWithSearch) que permite a los usuarios buscar y seleccionar investigadores mediante un campo de búsqueda. Este campo filtra los investigadores por nombre, apellido o correo electrónico.
// Los investigadores seleccionados se muestran en una lista separada (SelectedItems), donde los usuarios pueden ver y eliminar investigadores seleccionados.
// Manejo de Sesiones y Autenticación:

// Se verifica la autenticidad del usuario utilizando tokens JWT, asegurando que solo los usuarios autenticados puedan acceder a las funcionalidades de creación y modificación de grupos.
// Se implementa una lógica para refrescar el token de acceso si ha expirado.
// Eliminación de Grupos:

// El componente permite la eliminación de un grupo existente, presentando un modal de confirmación donde se solicita al usuario que ingrese el nombre del grupo como medida de seguridad antes de proceder con la eliminación.
// Interacciones con la API:

// Las operaciones de creación, modificación y eliminación de grupos se gestionan a través de una API REST, utilizando métodos HTTP como POST, PUT y DELETE.
// Se manejan errores de conexión y respuestas de la API, informando al usuario sobre el estado de las operaciones.
// Componentes Internos
// SelectWithSearch: Componente reutilizable que permite la selección de elementos con una funcionalidad de búsqueda.
// SelectedItems: Componente que muestra los elementos seleccionados y permite eliminarlos de la lista de selección.





const SelectWithSearch = ({ options, selectedOptions, setSelectedOptions, label }) => {
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
                            {`${item.nombre} ${item.apellido}: ${item.email}`} 
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

export function CreateGroup() {

    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [researchers, setResearchers] = useState([]);
    const [selectedResearchers, setSelectedResearchers] = useState([]);
    const [link, setLink] = useState("");
    const [pageInvestigador, setPageInvestigador] = useState(1);


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

    const handleDeleteGroup = async () => {
        if (confirmationName === name) {
            try {
                const response = await fetchWithAuth(`http://localhost:8000/api/v1/grupos/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });

                if (response.ok) {
                    alert("Grupo eliminado");
                    closeModal();
                    // Redirigir o realizar otra acción después de eliminar el grupo
                } else {
                    alert("Error al eliminar el grupo");
                }
            } catch (err) {
                alert("Error al conectar con el servidor");
            }
        } else {
            alert("El nombre ingresado no coincide con el nombre del grupo. Por favor, inténtalo de nuevo.");

        }
    };


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
            <SelectedItems 
                items={selectedResearchersData} 
                label="Investigadores Seleccionados" 
                selectedOptions={selectedResearchers} // Agregar esta línea
                setSelectedOptions={setSelectedResearchers} // Agregar esta línea
            />

            {id ? (
                <button onClick={handleUpdateGroup} className="submit-button">Modificar grupo</button>
            ) : (
                <button onClick={handleCreateGroup} className="submit-button">Crear grupo</button>
            )}

            {id && (
                <button onClick={openModal} className="delete-button" style={{backgroundColor:'red'}}>Eliminar grupo</button>
            )}

            <div className={`modal ${modalIsOpen ? "is-open" : ""}`}>
                <div className="modal-content">
                    <h2>Eliminar grupo</h2>
                    <p>¿Estás seguro de que deseas eliminar el grupo <strong>{name}</strong>?</p>
                    <p>Ingresa el nombre del grupo para confirmar: <strong>{name}</strong></p>
                    <input 
                        type="text" 
                        value={confirmationName} 
                        onChange={(e) => setConfirmationName(e.target.value)} 
                    />
                    <div>
                        <button onClick={handleDeleteGroup} className="delete-button">Eliminar</button>
                        <button onClick={closeModal} className="cancel-button">Cancelar</button>
                    </div>
                </div>
            </div>

        </div>
    );
}