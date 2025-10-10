// src/stores/authStore.js
import { defineStore } from "pinia";
import api, { setApiToken, API_ROOT } from "@/api/axios";
import axios from "axios"; // para petición CSRF en la raíz del backend

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    errors: {},
    message: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    /**
     * Inicializa: si hay token lo pone en headers y opcionalmente trae user
     */
    async init({ fetchUser = true } = {}) {
      if (this.token) {
        setApiToken(this.token);
        if (fetchUser) {
          await this.fetchUser().catch(() => {
            this.clearToken();
          });
        }
      }
    },

    setToken(token) {
      this.token = token;
      if (token) {
        try {
          localStorage.setItem("token", token);
        } catch (e) {
          console.warn("No se pudo guardar token en localStorage:", e);
        }
        setApiToken(token);
      } else {
        this.clearToken();
      }
    },

    clearToken() {
      this.token = null;
      try {
        localStorage.removeItem("token");
      } catch (e) {}
      setApiToken(null);
    },

    /**
     * CSRF: solicita /sanctum/csrf-cookie en la raíz del backend (no en /api).
     * Evita 404 en llamadas a /api/sanctum/csrf-cookie.
     */
    async csrf() {
      // API_ROOT exportado desde src/api/axios.js
      await axios.get(`${API_ROOT}/sanctum/csrf-cookie`, { withCredentials: true });
    },

    /**
     * LOGIN:
     * - solicita CSRF (si usas cookie-based Sanctum)
     * - llama a POST /api/auth/login
     * - guarda token y user según respuesta
     */
    async login({ email, password }) {
      this.loading = true;
      this.errors = {};
      this.message = null;
      try {
        // Si backend usa cookie flow: pedir csrf-cookie
        await this.csrf();

        const res = await api.post("/auth/login", { email, password });
        // backend puede devolver { mensaje, data: { user, token } } o directamente { user, token }
        const payload = res.data?.data ?? res.data ?? {};

        // guardar token si llega
        if (payload.token) {
          this.setToken(payload.token);
        } else if (payload.access_token) {
          this.setToken(payload.access_token);
        }

        // setear user (si viene) o intentar traerlo
        if (payload.user) {
          this.user = payload.user;
        } else {
          await this.fetchUser().catch(() => {});
        }

        return payload;
      } catch (err) {
        if (err?.response?.status === 422 && err.response.data?.errors) {
          this.errors = err.response.data.errors;
          this.message = "Corrige los campos indicados.";
        } else {
          // muchos controladores devuelven 'mensaje' en español
          this.message = err?.response?.data?.mensaje || err?.response?.data?.message || "Error al iniciar sesión";
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(payload) {
      this.loading = true;
      this.errors = {};
      this.message = null;
      try {
        await this.csrf();
        const res = await api.post("/auth/registro", payload);
        const data = res.data?.data ?? res.data ?? {};

        if (data.token || data.access_token) {
          this.setToken(data.token ?? data.access_token);
        }
        if (data.user) this.user = data.user;

        return data;
      } catch (err) {
        if (err?.response?.status === 422 && err.response.data?.errors) {
          this.errors = err.response.data.errors;
          this.message = "Corrige los campos indicados.";
        } else {
          this.message = err?.response?.data?.mensaje || err?.response?.data?.message || "Error en el registro";
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      this.message = null;
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.warn("Logout backend falló:", err);
      } finally {
        this.clearToken();
        this.user = null;
        this.loading = false;
      }
    },

    async fetchUser() {
      this.loading = true;
      try {
        const res = await api.get("/auth/user");
        // endpoint /api/auth/user devuelve { user: ... } según tu controller
        this.user = res.data.user ?? res.data ?? null;
        return this.user;
      } catch (err) {
        if (err?.response?.status === 401) {
          this.clearToken();
          this.user = null;
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setUser(user) {
      this.user = user;
    },

    clearErrors() {
      this.errors = {};
      this.message = null;
    },
  },
});
