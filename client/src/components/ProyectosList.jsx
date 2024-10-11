import React, { useEffect, useState } from 'react';
import { getProyectos } from '../api/proyectos.api';
import { ProyectoCard } from './ProyectoCard';
import { useSearchParams } from 'react-router-dom';
import './styles/Pagination.css';


/**
 * ProyectosList es un componente de React que se encarga de mostrar una lista de proyectos, 
 * permitiendo realizar búsquedas, ordenamiento y paginación de los resultados.
 *
 * - Utiliza hooks como useState y useEffect para gestionar el estado y las llamadas a la API 
 *   que obtienen los proyectos desde el backend.
 * - El estado incluye proyectos, currentPage (página actual), totalPages (total de páginas), 
 *   searchQuery (consulta de búsqueda), sortField (campo de ordenamiento), sortOrder (orden de clasificación), 
 *   error (mensaje de error) y pageSize (número de resultados por página).
 * - Se utiliza useSearchParams de React Router para gestionar parámetros de búsqueda en la URL, 
 *   estableciendo el searchQuery basado en el parámetro 'keyword'.
 * - Al montar el componente, se realiza una llamada a la API getProyectos para obtener la lista de proyectos 
 *   según la página actual, el tamaño de la página, la consulta de búsqueda y los parámetros de ordenamiento.
 * - Los métodos handleSearchChange, handleSortChange, handlePageChange y handlePageSizeChange 
 *   permiten al usuario interactuar con la interfaz, actualizando el estado y reiniciando la paginación 
 *   cuando sea necesario.
 * - handleKeywordClick permite que al hacer clic en una palabra clave, se actualice la búsqueda y 
 *   se reinicie la paginación.
 * - En el renderizado, se muestran los proyectos utilizando el componente ProyectoCard para cada uno, 
 *   junto con controles para búsqueda, ordenamiento, selección de tamaño de página y navegación entre páginas.
 * - Si hay un error al obtener los proyectos, se mostrará un mensaje de error en la interfaz.
 */



export function ProyectosList() {
    const [proyectos, setProyectos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();

    const keyword = searchParams.get('keyword');
    useEffect(() => {
        if (keyword) {
            setSearchQuery(keyword);
        }
    }, [keyword]);
    


    
    // Estado para el tamaño de la página
    const [pageSize, setPageSize] = useState(10); // Valor por defecto

    useEffect(() => {
        async function fetchProyectos() {
            try {
                const res = await getProyectos(currentPage, pageSize, searchQuery, sortField, sortOrder);
                setProyectos(res.data.results);
                setTotalPages(Math.ceil(res.data.count / pageSize)); // Usar pageSize para calcular total de páginas
            } catch (error) {
                console.error("Error fetching proyectos:", error);
                setError("Error fetching proyectos.");
            }
        }
        fetchProyectos();
    }, [currentPage, searchQuery, sortField, sortOrder, pageSize]); // Añadir pageSize como dependencia

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Resetear a la primera página al buscar
    };

    const handleSortChange = (field) => {

        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1); // Resetear a la primera página al cambiar el orden
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value)); // Actualizar el tamaño de la página
        setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
    };

    // Función para manejar clic en una palabra clave
    const handleKeywordClick = (keyword) => {
        setSearchQuery(keyword); // Actualiza el campo de búsqueda
        setCurrentPage(1); // Reinicia la paginación a la primera página
    };

    return (
        <div>
            {error && <p>{error}</p>}

            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar proyecto"
                />
            </div>

            
            <div className="controls">
                <div className="sort-dropdown">
                    <label htmlFor="sortSelect">Ordenar por:</label>
                    <select id="sortSelect" className="sort-select" onChange={(e) => handleSortChange(e.target.value)}>
                        <option value="nombre">Nombre</option>
                        <option value="descripcion">Descripción</option>
                        <option value="fecha">Fecha</option>
                    </select>
                </div>
                <div className="page-size-container">
                    <label htmlFor="pageSize" className="page-size-label">Resultados por página:</label>
                    <select id="pageSize" value={pageSize} onChange={handlePageSizeChange} className="page-size-select">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>


            <div>
                {proyectos.map((proyecto) => (
                    <ProyectoCard key={proyecto.id} id={proyecto.id}/>
                ))}
            </div>

            <div className="pagination-controls">
                <button
                    disabled={currentPage === 1} // Deshabilitar si estamos en la primera página
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Anterior
                </button>
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages} // Deshabilitar si estamos en la última página
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
