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
    const [previous, setPrevious] = useState('');
    const [next, setNext] = useState('');

    useEffect(() => {
        async function fetchGrupos() {
            try {
                const res = await getGrupos(currentPage, searchQuery, sortField, sortOrder);
                console.log(res.data.results);
                setGrupos(res.data.results);
                setPrevious(res.data.previous);
                setNext(res.data.next);
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
        setCurrentPage(1); // Reset to the first page when searching
    };

    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                    <GrupoCard key={grupo.id} grupo={grupo} />
                ))}
            </div>

            <div>
                
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={!previous}>Anterior</button>
                <span>{currentPage} de {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={!next}>Siguiente</
                button>

            </div>
        </div>
    );
}

