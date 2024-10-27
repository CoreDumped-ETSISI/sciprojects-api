import axios from "axios";


const URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : import.meta.env.VITE_REACT_APP_API_URL;

  


const investigadoresApi = axios.create({
  baseURL: `${URL}/api/v1/investigadores`,
});

// Obtener todos los investigadores con paginación, búsqueda y ordenamiento
export const getInvestigadores = (
  page = 1,
  pageSize = 1,  // Nuevo parámetro para el tamaño de la página
  searchQuery = '',
  sortField = '',
  sortOrder = 'asc'
) => {
  let queryParams = `?page=${page}&page_size=${pageSize}`;  // Añadir el tamaño de página a los parámetros de consulta

  if (searchQuery) {
    queryParams += `&search=${searchQuery}`;
  }

  if (sortField) {
    queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
  }

  return investigadoresApi.get(`/${queryParams}`);
};

// Obtener un investigador por su ID
export const getInvestigadorById = (id) => investigadoresApi.get(`/${id}/`);

// Actualizar un investigador
export const updateInvestigador = (id, investigador) => investigadoresApi.put(`/${id}/`, investigador);
