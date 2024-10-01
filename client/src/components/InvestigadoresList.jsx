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

  // Cantidad de investigadores por página (puede ser un valor fijo o venir del backend)
  const investigadoresPerPage = 10;

  useEffect(() => {
    async function fetchInvestigadores() {
      try {
        // Petición a la API con los parámetros de paginación, búsqueda, orden, etc.
        const res = await getInvestigadores(currentPage, searchQuery, sortField, sortOrder);
        
        setInvestigadores(res.data.results);

        // Calcular el número total de páginas basadas en el total de resultados y por página
        setTotalPages(Math.ceil(res.data.count / investigadoresPerPage));
      } catch (error) {
        console.error("Error fetching investigadores:", error);
        setError("Error fetching investigadores.");
      }
    }
    fetchInvestigadores();
  }, [currentPage, searchQuery, sortField, sortOrder]);

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
          placeholder="Buscar investigador"
        />
      </div>

      <div>
        <button onClick={() => handleSortChange('nombre')}>Ordenar por Nombre</button>
        <button onClick={() => handleSortChange('apellido')}>Ordenar por Apellido</button>
      </div>

      <div>
        {investigadores.map((investigador) => (
          <InvestigadorCard key={investigador.id} id={investigador.id} />
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
