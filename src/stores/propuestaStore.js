import { defineStore } from 'pinia'
import api from '@/api/axios'

export const usePropuestaStore = defineStore('propuesta', {
  state: () => ({
    propuestas: [],
    cargando: false,
    error: null,
  }),

  actions: {
    async fetchAll() {
      this.cargando = true
      this.error = null
      try {
        const res = await api.get('/propuestas')
        this.propuestas = res.data?.data ?? res.data ?? []
        return this.propuestas
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar propuestas'
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    async crear(payload) {
      this.cargando = true
      this.error = null
      try {
        const res = await api.post('/propuestas', payload)
        const nueva = res.data?.data ?? res.data
        if (nueva) this.propuestas.unshift(nueva)
        return nueva
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear propuesta'
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    async actualizar(id, payload) {
      this.cargando = true
      this.error = null
      try {
        const res = await api.put(`/propuestas/${id}`, payload)
        const actualizada = res.data?.data ?? res.data
        const i = this.propuestas.findIndex(p => p.id === id)
        if (i !== -1) this.propuestas[i] = actualizada
        return actualizada
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar propuesta'
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    async eliminar(id) {
      this.cargando = true
      this.error = null
      try {
        await api.delete(`/propuestas/${id}`)
        this.propuestas = this.propuestas.filter(p => p.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al eliminar propuesta'
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },
  },
})
