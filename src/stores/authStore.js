// src/stores/authStore.js
import { defineStore } from "pinia";
import api, { setApiToken, API_ROOT } from "@/api/axios";
import axios from "axios";

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
      } catch (_) {}
      setApiToken(null);
    },

    async csrf() {
      await axios.get(`${API_ROOT}/sanctum/csrf-cookie`, { withCredentials: true });
    },

    async login({ email, password }) {
      this.loading = true;
      this.errors = {};
      this.message = null;
      try {
        await this.csrf();
        const res = await api.post("/auth/login", { email, password });
        const payload = res.data?.data ?? res.data ?? {};

        if (payload.token) {
          this.setToken(payload.token);
        } else if (payload.access_token) {
          this.setToken(payload.access_token);
        }

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
          this.message =
            err?.response?.data?.mensaje ||
            err?.response?.data?.message ||
            "Error al iniciar sesión.";
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
          this.message =
            err?.response?.data?.mensaje ||
            err?.response?.data?.message ||
            "Error en el registro.";
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
        this.user = res.data.user ?? res.data ?? null;
        return this.user;
      } catch (err) {
        if (err?.response?.status === 401 && this.user) {
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
