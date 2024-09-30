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
    const [previous, setPrevious] = useState('');
    const [next, setNext] = useState('');

    useEffect(() => {
        async function fetchProyectos() {
            try {
                const res = await getProyectos(currentPage, searchQuery, sortField, sortOrder);
                setProyectos(res.data.results);
                setPrevious(res.data.previous);
                setNext(res.data.next);
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
                    placeholder="Buscar proyecto"
                />
                <button onClick={() => handleSortChange('nombre')}>Sort by name</button>
                <button onClick={() => handleSortChange('fechaInicio')}>Sort by start date</button>
                <button onClick={() => handleSortChange('fechaFin')}>Sort by end date</button>
            </div>

            <div>
                {proyectos.map((proyecto) => (
                    <ProyectoCard key={proyecto.id} proyecto={proyecto} />
                ))}
            </div>

            <div>
                <button disabled={!previous} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                <button disabled={!next} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </div>
        </div>
    );



}

