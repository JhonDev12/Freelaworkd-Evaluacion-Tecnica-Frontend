// src/api/axios.js
import axios from "axios";

const RAW = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_ROOT = RAW.replace(/\/api\/?$/i, "").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function setApiToken(token) {
  if (token) {
    api.defaults.headers = api.defaults.headers || {};
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else if (api.defaults.headers?.Authorization) {
    delete api.defaults.headers.Authorization;
  }
}

// 🔐 Adjunta token de localStorage en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚫 Manejo de errores globales sin forzar recarga de la app
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("[API] Sesión no autorizada — token inválido o expirado.");
      try {
        localStorage.removeItem("token");
      } catch (_) {}

      // 🔥 Antes recargaba, ahora solo notifica y deja que la vista maneje el error
      // No redirigimos ni recargamos: evita perder estado del login
    }
    return Promise.reject(err);
  }
);

export default api;
