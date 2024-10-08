import axios from 'axios';

// Define la URL base dependiendo del entorno
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

// Log para verificar la URL
console.log(BASE_URL);

const proyectosApi = axios.create({
  baseURL: `${BASE_URL}/api/v1/proyectos/`,
});

// Obtener todos los proyectos
export const getProyectos = (
  page = 1,  // Nuevo parámetro para el tamaño de la página
  pageSize = 1,  // Nuevo parámetro para el tamaño de la página
  searchQuery = '',
  sortField = '',
  sortOrder = 'asc',
  investigador_id = '',
  grupo_id = ''
) => {
  let queryParams = `?page_size=${pageSize}`;  // Añadir el tamaño de página a los parámetros de consulta

  if (searchQuery) {
    queryParams += `&search=${searchQuery}`;
  }

  if (sortField) {
    queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
  }

  if (investigador_id) {
    queryParams += `&investigador_id=${investigador_id}`;
  }

  if (grupo_id) {
    queryParams += `&grupo_id=${grupo_id}`;
  }
  

  return proyectosApi.get(`${queryParams}`);
}

export const getProyectoById = (id) => proyectosApi.get(`/${id}/`);
export const createProyecto = (nuevoProyecto) => proyectosApi.post("/", nuevoProyecto);
export const updateProyecto = (id, proyecto) => proyectosApi.put(`/${id}/`, proyecto);
export const deleteProyecto = (id) => proyectosApi.delete(`/${id}/`);
