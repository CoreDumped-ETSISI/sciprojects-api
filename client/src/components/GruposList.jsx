import React, {useEffect, useState} from 'react';
import {getGrupos} from '../api/grupos.api';
import {GrupoCard} from './GrupoCard';

export function GruposList() { 
        
    const [grupos, setGrupos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState('');

    const gruposPerPage = 10;

    useEffect(() => {
        async function fetchGrupos() {
            try {
                const res = await getGrupos(currentPage, searchQuery, sortField, sortOrder);
                setGrupos(res.data.results);
                setTotalPages(Math.ceil(res.data.count / gruposPerPage));
            } catch (error) {
                console.error("Error fetching grupos:", error);
                setError("Error fetching grupos.");
            }
        }
        fetchGrupos();
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
                    placeholder="Buscar grupo"
                />
            </div>

            <div>
                <button onClick={() => handleSortChange('name')}>Ordenar por Nombre</button>
                <button onClick={() => handleSortChange('description')}>Ordenar por Descripción</button>
            </div>

            <div>
                {grupos.map((grupo) => (
                    <GrupoCard key={grupo.id} id={grupo.id} />
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

