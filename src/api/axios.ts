// Configuración global de Axios para comunicar el frontend con la API Laravel
import axios, { AxiosError, type AxiosResponse } from "axios";

// Instancia principal de Axios con baseURL tomada del entorno (.env)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Requerido para autenticación con Sanctum
});

// Interceptor de respuestas: maneja errores globales y sesiones expiradas
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ No autorizado o sesión expirada");
    }
    return Promise.reject(error);
  }
);

export default api;
