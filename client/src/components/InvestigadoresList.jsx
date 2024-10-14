import React, { useState, useEffect } from 'react';
import { getInvestigadores } from '../api/investigadores.api';
import { InvestigadorCard } from './InvestigadorCard';
import './styles/Pagination.css';

/**
 * InvestigadoresList es un componente de React que muestra una lista de investigadores 
 * paginada, con funcionalidades de búsqueda y ordenación. Permite a los usuarios 
 * buscar investigadores por nombre o apellido, y cambiar el número de resultados 
 * mostrados por página.
 *
 * - Utiliza el hook useEffect para recuperar los datos de investigadores 
 *   desde la API, aplicando los parámetros de paginación, búsqueda y orden 
 *   según las opciones seleccionadas por el usuario.
 * - El componente incluye un campo de búsqueda que resetea la página actual 
 *   a la primera cuando se ingresa un nuevo término.
 * - Los usuarios pueden ordenar la lista de investigadores al hacer clic en 
 *   los botones correspondientes, lo que también reinicia la página actual a la primera.
 * - Permite cambiar el tamaño de la página mediante un select, también 
 *   reseteando a la primera página.
 * - Muestra mensajes de error si hay problemas al recuperar los datos de 
 *   investigadores.
 * - La lista se presenta mediante el componente InvestigadorCard, que 
 *   representa la información de cada investigador individualmente.
 */





export function InvestigadoresList() {
  const [investigadores, setInvestigadores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  
  // Estado para el tamaño de la página
  const [pageSize, setPageSize] = useState(10); // Valor por defecto

  useEffect(() => {
    async function fetchInvestigadores() {
      try {
        // Petición a la API con los parámetros de paginación, búsqueda, orden, etc.
        const res = await getInvestigadores(currentPage, pageSize, searchQuery, sortField, sortOrder);
        
        setInvestigadores(res.data.results);

        // Calcular el número total de páginas basadas en el total de resultados y por página
        setTotalPages(Math.ceil(res.data.count / pageSize));
      } catch (error) {
        console.error("Error fetching investigadores:", error);
        setError("Error fetching investigadores.");
      }
    }
    fetchInvestigadores();
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
          placeholder="Buscar investigador"
        />
      </div>

      <div className='controls'>
		<div className='sort-dropdown'>
			<label htmlFor="sortSelect">Ordenar por:</label>
			<select id="sortSelect" value={sortField} onChange={(e) => handleSortChange(e.target.value)}>
				<option value="nombre">Nombre</option>
				<option value="apellido">Apellido</option>
			</select>
		</div>

		<div className='page-size-container'>
			<label htmlFor="pageSize">Resultados por página:</label>
			<select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
			<option value={5}>5</option>
			<option value={10}>10</option>
			<option value={20}>20</option>
			<option value={50}>50</option>
			</select>
		</div>
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
