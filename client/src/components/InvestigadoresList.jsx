import React, { useState, useEffect } from 'react';
import { getInvestigadores } from '../api/investigadores.api';
import { InvestigadorCard } from './InvestigadorCard';

export function InvestigadoresList() {
  const [investigadores, setInvestigadores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  useEffect(() => {
    async function fetchInvestigadores() {
      try {
        const res = await getInvestigadores(currentPage, searchQuery, sortField, sortOrder);
        setInvestigadores(res.data.results);
        setTotalPages(res.data.count);
        setPrevious(res.data.previous);
        setNext(res.data.next);
      } catch (error) {
        console.error("Error fetching investigadores:", error);
        setError("Error fetching investigadores.");
      }
    }
    fetchInvestigadores();
  }, [currentPage, searchQuery, sortField, sortOrder]);

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
          placeholder="Buscar investigador"
        />
      </div>

      <div>
        <button onClick={() => handleSortChange('name')}>Ordenar por Nombre</button>
        <button onClick={() => handleSortChange('lastname')}>Ordenar por Apellido</button>
      </div>

      <div>
        {investigadores.map((investigador) => (
          <InvestigadorCard key={investigador.id} investigador={investigador} />
        ))}
      </div>

      <div>
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
