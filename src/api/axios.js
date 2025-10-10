// src/api/axios.js
import axios from "axios";

/**
 * Configuración de base URLs:
 * - VITE_API_URL puede ser "http://localhost:8000" o "http://localhost:8000/api".
 * - Normalizamos root y la url /api para el cliente `api` utilizado por el frontend.
 */
const RAW = import.meta.env.VITE_API_URL || "http://localhost:8000";

// root del backend (sin "/api")
export const API_ROOT = RAW.replace(/\/api\/?$/i, "").replace(/\/$/, "");

// base para llamadas a /api
const API_BASE = `${API_ROOT}/api`;

// cliente principal para llamadas /api/*
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // necesario si usas cookie-based Sanctum
});

// helper para establecer o limpiar header Authorization en runtime
export function setApiToken(token) {
  if (token) {
    api.defaults.headers = api.defaults.headers || {};
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else if (api.defaults.headers && api.defaults.headers.Authorization) {
    delete api.defaults.headers.Authorization;
  }
}

// Request interceptor: si localStorage tiene token, lo adjunta (por seguridad)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: maneja 401 globalmente (limpia token y redirige)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("[API] No autorizado — token expirado o inválido. Limpiando sesión.");
      try {
        localStorage.removeItem("token");
      } catch (e) { /* ignore */ }
      // redirige al login (evita dependencias con router)
      // Si no quieres redirección automática coméntala.
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
