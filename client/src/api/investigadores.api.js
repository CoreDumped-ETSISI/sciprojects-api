import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log(URL);
const tasksApi = axios.create({
  baseURL: `${URL}/api/v1/investigadores`,
});




// Obtener todos los investigadores
export const getInvestigadores = () => tasksApi.get("/");

// Obtener un investigador por su ID
export const getInvestigadorById = (id) => tasksApi.get(`/${id}/`);


// Actualizar un investigador
export const updateInvestigador = (id, investigador) => tasksApi.put(`/${id}/`, investigador);

