import axios from 'axios';

// Define la URL base dependiendo del entorno
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

// Log para verificar la URL
console.log(BASE_URL);

const gruposApi = axios.create({
  baseURL: `${BASE_URL}/api/v1/grupos/`,
});

// Obtener todos los grupos
export const getGrupos = (
  page = 1,
  pageSize = 1,  // Nuevo parámetro para el tamaño de la página
  searchQuery = '',
  sortField = '',
  sortOrder = 'asc',
  investigador_id = '',
) => {
  let queryParams = `?page=${page}&page_size=${pageSize}`;  // Añadir el tamaño de página a los parámetros de consulta

  if (searchQuery) {
    queryParams += `&search=${searchQuery}`;
  }

  if (sortField) {
    queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
  }

  if (investigador_id) {
    queryParams += `&investigador_id=${investigador_id}`;
  }

  return gruposApi.get(`${queryParams}`);
}

export const getGrupoById = (id) => gruposApi.get(`/${id}/`);
export const createGrupo = (nuevoGrupo) => gruposApi.post("/", nuevoGrupo);
export const updateGrupo = (id, grupo) => gruposApi.put(`/${id}/`, grupo);
export const deleteGrupo = (id) => gruposApi.delete(`/${id}/`);
