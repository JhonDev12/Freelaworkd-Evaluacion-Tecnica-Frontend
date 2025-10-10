/**
 * ===========================================================
 * loaderStore
 * -----------------------------------------------------------
 * Controla el estado global del banner de carga.
 * Se activa automáticamente en solicitudes HTTP o manualmente
 * desde cualquier vista.
 * ===========================================================
 */
import { defineStore } from 'pinia'

export const useLoaderStore = defineStore('loader', {
  state: () => ({
    visible: false,
    pendientes: 0,
    tiempoMinimo: 250, // milisegundos mínimos visibles
    inicio: 0
  }),

  actions: {
    mostrar() {
      if (this.pendientes === 0) this.inicio = Date.now()
      this.pendientes++
      this.visible = true
    },

    async ocultar() {
      if (this.pendientes > 0) this.pendientes--
      if (this.pendientes === 0) {
        const transcurrido = Date.now() - this.inicio
        const espera = Math.max(this.tiempoMinimo - transcurrido, 0)
        await new Promise((r) => setTimeout(r, espera))
        this.visible = false
      }
    },

    reiniciar() {
      this.pendientes = 0
      this.visible = false
    }
  }
})
