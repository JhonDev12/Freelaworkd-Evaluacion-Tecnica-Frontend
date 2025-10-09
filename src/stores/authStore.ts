// Store de autenticación: maneja sesión y usuario actual
import { defineStore } from "pinia";
import { login, logout, getUser } from "../api/authService";
import type { User } from "@/types/User";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    loading: false,
  }),

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      try {
        const res = await login(email, password);
        this.user = res.data.user;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      const res = await getUser();
      this.user = res.data;
    },

    async logout() {
      await logout();
      this.user = null;
    },
  },
});
