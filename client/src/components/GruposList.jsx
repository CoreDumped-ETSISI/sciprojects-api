import React, { useEffect, useState } from 'react';
import { getGrupos } from '../api/grupos.api';
import { GrupoCard } from './GrupoCard';
import './styles/Pagination.css';



/**
 * GruposList es un componente de React que muestra una lista paginada de grupos 
 * disponibles. Utiliza el estado para manejar la lista de grupos, la página 
 * actual, el número total de páginas, el conteo total de grupos, y las opciones 
 * de búsqueda y ordenamiento. 
 * 
 * Al cargar, el componente realiza una solicitud a la API para obtener los grupos 
 * según los parámetros de paginación, búsqueda, y orden. Permite a los usuarios 
 * buscar grupos por nombre o descripción, cambiar el número de resultados por 
 * página, y alternar entre el orden ascendente y descendente de los resultados.
 * 
 * Los grupos se muestran utilizando el componente GrupoCard. También incluye 
 * controles de paginación para navegar entre diferentes páginas de resultados. 
 * Si ocurre un error durante la obtención de los grupos, se muestra un mensaje 
 * de error.
 */

export function GruposList() {
    const [grupos, setGrupos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0); 
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState('');
    const [pageSize, setPageSize] = useState(10); 

    useEffect(() => {
        async function fetchGrupos() {
            try {
                const res = await getGrupos(currentPage, pageSize, searchQuery, sortField, sortOrder);
                setGrupos(res.data.results);
                setTotalCount(res.data.count); 
                setTotalPages(Math.ceil(res.data.count / pageSize));
            } catch (error) {
                console.error("Error fetching grupos:", error);
                setError("Error fetching grupos.");
            }
        }
        fetchGrupos();
    }, [currentPage, searchQuery, sortField, sortOrder, pageSize]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleResultsPerPageChange = (e) => {
        setPageSize(parseInt(e.target.value, 10)); // Cambiar a setPageSize
        setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
    };    

    return (
        <div>
            {error && <p>{error}</p>}

            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar grupo"
                />
            </div>

            <div className='controls'>

                <div className='sort-dropdown'>
                    <label htmlFor="sortSelect">Ordenar por:</label>
                    <select id="sortSelect" className="sort-select" onChange={(e) => handleSortChange(e.target.value)}>
                        <option value="nombre">Nombre</option>
                        <option value="descripcion">Descripción</option>
                    </select>
                </div>
                <div className='page-size-container'>
                    <label htmlFor="pageSize" className="page-size-label">Resultados por página:</label>
                    <select id="pageSize" value={pageSize} onChange={handleResultsPerPageChange}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>




            <div>
                {grupos.map((grupo) => (
                    <GrupoCard key={grupo.id} id={grupo.id} />
                ))}
            </div>

            <div className="pagination-controls">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Anterior
                </button>
                <span>
                    Página {currentPage} de {totalPages} 
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
