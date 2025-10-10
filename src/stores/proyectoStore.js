// src/stores/proyectoStore.js
import { defineStore } from 'pinia'
import api from '@/api/axios'

/**
 * ================================================================
 * Store: useProyectoStore
 * ------------------------------------------------
 * Maneja el CRUD de proyectos con estados reactivos
 * y compatibilidad completa con Laravel Sanctum.
 * ================================================================
 */
export const useProyectoStore = defineStore('proyecto', {
  state: () => ({
    proyectos: [],
    cargando: false,
    error: null,
  }),

  actions: {
    /** 🔹 Obtener todos los proyectos */
    async fetchAll() {
      this.cargando = true
      this.error = null
      try {
        const res = await api.get('/proyectos')
        this.proyectos = res.data?.data ?? res.data ?? []
        return this.proyectos
      } catch (err) {
        this.error = err.response?.data?.mensaje || 'Error al cargar proyectos'
        console.error('[ProyectoStore] Error en fetchAll:', this.error)
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    /** 🔹 Crear un nuevo proyecto */
    async crear(payload) {
      this.cargando = true
      this.error = null
      try {
        const res = await api.post('/proyectos', payload)
        const nuevo = res.data?.data ?? res.data
        if (nuevo) this.proyectos.unshift(nuevo)
        return nuevo
      } catch (err) {
        this.error =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al crear el proyecto'
        console.error('[ProyectoStore] Error en crear:', this.error)
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    /** 🔹 Actualizar un proyecto existente */
    async actualizar(id, payload) {
      this.cargando = true
      this.error = null
      try {
        const res = await api.put(`/proyectos/${id}`, payload)
        const actualizado = res.data?.data ?? res.data
        const index = this.proyectos.findIndex(p => p.id === id)
        if (index !== -1) this.proyectos[index] = actualizado
        return actualizado
      } catch (err) {
        this.error =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al actualizar el proyecto'
        console.error('[ProyectoStore] Error en actualizar:', this.error)
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },

    /** 🔹 Eliminar un proyecto */
    async eliminar(id) {
      this.cargando = true
      this.error = null
      try {
        await api.delete(`/proyectos/${id}`)
        this.proyectos = this.proyectos.filter(p => p.id !== id)
        return true
      } catch (err) {
        this.error =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al eliminar el proyecto'
        console.error('[ProyectoStore] Error en eliminar:', this.error)
        throw new Error(this.error)
      } finally {
        this.cargando = false
      }
    },
  },
})
