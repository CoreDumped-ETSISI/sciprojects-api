import React, { useEffect, useState } from 'react';
import { getProyectos } from '../api/proyectos.api';
import { ProyectoCard } from './ProyectoCard';

export function ProyectosList() {
    const [proyectos, setProyectos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState('');
    
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

            <div>
                <button onClick={() => handleSortChange('nombre')}>Ordenar por Nombre</button>
                <button onClick={() => handleSortChange('descripcion')}>Ordenar por Descripción</button>
            </div>

            <div>
                <label htmlFor="pageSize">Resultados por página:</label>
                <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

            <div>
                {proyectos.map((proyecto) => (
                    <ProyectoCard key={proyecto.id} id={proyecto.id} />
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
