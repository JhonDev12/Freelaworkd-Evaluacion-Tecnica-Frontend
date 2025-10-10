// src/stores/propuestaStore.js
import { defineStore } from 'pinia';
import api from '@/api/axios';

export const usePropuestaStore = defineStore('propuesta', {
  state: () => ({ list: [], loading: false }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const res = await api.get('/propuestas', { params });
        const payload = res.data?.data ?? res.data ?? [];
        // si la API incluye relación proyecto (ej. 'proyecto') ya vendrá anidado
        this.list = Array.isArray(payload) ? payload : (payload.data ?? []);
        return this.list;
      } finally {
        this.loading = false;
      }
    }
  },
});
