import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log(URL);

const investigadoresApi = axios.create({
  baseURL: `${URL}/api/v1/investigadores`,
});

// Obtener todos los investigadores con paginación, búsqueda y ordenamiento
export const getInvestigadores = (page = 1, searchQuery = '', sortField = '', sortOrder = 'asc') => {
  let queryParams = `?page=${page}`;

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
