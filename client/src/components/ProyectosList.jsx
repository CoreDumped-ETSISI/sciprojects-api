import React, {useEffect, useState} from 'react';
import {getProyectos} from '../api/proyectos.api';
import {ProyectoCard} from './ProyectoCard';

export function ProyectosList() {
    
    const [proyectos, setProyectos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState('');

    const proyectosPerPage = 10;
    
    useEffect(() => {
        async function fetchProyectos() {
            try {
                const res = await getProyectos(currentPage, searchQuery, sortField, sortOrder);
                setProyectos(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } catch (error) {
                console.error("Error fetching proyectos:", error);
                setError("Error fetching proyectos.");
            }
        }
        fetchProyectos();
    }



    , [currentPage, searchQuery, sortField, sortOrder]);



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
        setCurrentPage(); // Resetear a la primera página al cambiar el orden
      };
    
      const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
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
                <button onClick={() => handleSortChange('nombre')}>Sort by name</button>
                <button onClick={() => handleSortChange('fechaInicio')}>Sort by start date</button>
                <button onClick={() => handleSortChange('fechaFin')}>Sort by end date</button>
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
