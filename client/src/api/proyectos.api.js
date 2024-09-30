import axios from 'axios';

// Define la URL base dependiendo del entorno
const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

// Log para verificar la URL

console.log(URL);
const proyectosApi = axios.create({
  baseURL: `${URL}/api/v1/proyectos/`,
});



// Obtener todos los proyectos
export const getProyectos = (page = 1, searchQuery = '', sortField = '', sortOrder = 'asc') => {
  let queryParams = `?page=${page}`;

  if (searchQuery) {
    queryParams += `&search=${searchQuery}`;
  }

  if (sortField) {
    queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
  }

  return proyectosApi.get(`${queryParams}`);
}


export const getProyectoById = (id) => proyectosApi.get(`/${id}/`);

export const createProyecto = (nuevoProyecto) => proyectosApi.post("/", nuevoProyecto);

export const updateProyecto = (id, proyecto) => proyectosApi.put(`/${id}/`, proyecto);

export const deleteProyecto = (id) => proyectosApi.delete(`/${id}/`);

export const getInvestigadoresByProyecto = (id) => proyectosApi.get(`/${id}/investigadores/`);

export const addInvestigadorToProyecto = (id, investigador) => proyectosApi.post(`/${id}/investigadores/`, investigador);

export const deleteInvestigadorFromProyecto = (id, investigadorId) => proyectosApi.delete(`/${id}/investigadores/${investigadorId}`);
