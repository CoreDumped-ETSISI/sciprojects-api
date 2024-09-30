import axios from 'axios';

// Define la URL base dependiendo del entorno
const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

// Log para verificar la URL

console.log(URL);
const gruposApi = axios.create({
  baseURL: `${URL}/api/v1/grupos/`,
});

export const getGrupos = (page = 1, searchQuery = '', sortField = '', sortOrder = 'asc') => {
  let queryParams = `?page=${page}`;

  if (searchQuery) {
    queryParams += `&search=${searchQuery}`;
  }

  if (sortField) {
    queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
  }

  return gruposApi.get(`${queryParams}`);
}




export const getGrupoById = (id) => gruposApi.get(`/${id}/`);
export const createGrupo = (nuevoGrupo) => gruposApi.post("/", nuevoGrupo);
export const updateGrupo = (id, grupo) => gruposApi.put(`/${id}/`, grupo);
export const deleteGrupo = (id) => gruposApi.delete(`/${id}/`);
export const getInvestigadoresByGrupo = (id) => gruposApi.get(`/${id}/investigadores/`);
export const addInvestigadorToGrupo = (id, investigador) => gruposApi.post(`/${id}/investigadores/`, investigador);
export const deleteInvestigadorFromGrupo = (id, investigadorId) => gruposApi.delete(`/${id}/investigadores/${investigadorId}`);
export const getProyectosByGrupo = (id) => gruposApi.get(`/${id}/proyectos/`);
export const addProyectoToGrupo = (id, proyecto) => gruposApi.post(`/${id}/proyectos/`, proyecto);
export const deleteProyectoFromGrupo = (id, proyectoId) => gruposApi.delete(`/${id}/proyectos/${proyectoId}`);
