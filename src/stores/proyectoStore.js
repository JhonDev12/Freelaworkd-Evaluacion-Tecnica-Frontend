// src/stores/proyectoStore.js
import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useProyectoStore = defineStore('proyecto', {
  state: () => ({ list: [], loading: false }),
  actions: {
    /**
     * fetchAll: obtiene lista de proyectos.
     * params: { limit, page, ... }
     * El backend devuelve usualmente data[] o un array simple.
     */
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const res = await api.get('/proyectos', { params });
        // soportar respuestas paginadas { data: [...] } o arrays directos
        const payload = res.data?.data ?? res.data ?? [];
        this.list = Array.isArray(payload) ? payload : (payload.data ?? []);
        return this.list;
      } finally {
        this.loading = false;
      }
    }
  },
});
