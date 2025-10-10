<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f5f9ff] via-white to-[#f0f6fc] p-10">
    <!-- Encabezado -->
    <header class="flex flex-col sm:flex-row justify-between items-center mb-10">
      <div>
        <h1 class="text-4xl font-extrabold text-[#002D5B] tracking-tight mb-2">
          Gestión de Propuestas
        </h1>
        <p class="text-slate-500 text-sm">
          Administra, crea y analiza tus propuestas activas en un solo lugar
        </p>
      </div>

      <button
        @click="abrirModalNuevo"
        class="mt-5 sm:mt-0 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
      >
        + Nueva Propuesta
      </button>
    </header>

    <!-- Resumen estadístico -->
    <section class="grid gap-6 sm:grid-cols-3 mb-12">
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300">
        <p class="text-xs uppercase text-slate-400 tracking-wide">Total de propuestas</p>
        <p class="text-4xl font-extrabold text-[#002D5B] mt-1">{{ propuestas.length }}</p>
      </div>

      <div class="bg-gradient-to-br from-[#e0f7fa] to-[#f0faff] rounded-2xl shadow-md p-6 border border-[#00ADEF]/20 hover:shadow-lg transition-all duration-300">
        <p class="text-xs uppercase text-slate-500 tracking-wide">Promedio presupuestal</p>
        <p class="text-4xl font-extrabold text-[#00ADEF] mt-1">
          ${{ promedioPresupuesto.toLocaleString('es-CO') }}
        </p>
      </div>

      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300">
        <p class="text-xs uppercase text-slate-400 tracking-wide">Tiempo promedio estimado</p>
        <p class="text-4xl font-extrabold text-[#002D5B] mt-1">{{ promedioDias }} días</p>
      </div>
    </section>

    <!-- Grid de propuestas -->
    <section>
      <div v-if="!propuestas.length" class="text-center py-16 text-slate-500 italic text-lg font-medium">
        No hay propuestas registradas todavía.
      </div>

      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="propuesta in propuestas"
          :key="propuesta.id"
          class="relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div
            class="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#06b6d4]/10 via-transparent to-[#3b82f6]/10 opacity-0 hover:opacity-100 transition duration-300"
          ></div>

          <div class="relative z-10">
            <h2 class="text-lg font-semibold text-[#002D5B] leading-tight">
              {{ propuesta.proyecto?.titulo || 'Proyecto sin nombre' }}
            </h2>
            <p class="text-sm text-slate-500 italic mb-3">
              por {{ propuesta.usuario?.name || 'Desconocido' }}
            </p>

            <p class="text-slate-600 text-sm mb-4 line-clamp-3">
              {{ propuesta.descripcion }}
            </p>

            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p class="text-slate-400 text-xs uppercase tracking-wide">Presupuesto</p>
                <p class="font-semibold text-slate-700">
                  ${{ Number(propuesta.presupuesto).toLocaleString('es-CO') }}
                </p>
              </div>
              <div>
                <p class="text-slate-400 text-xs uppercase tracking-wide">Tiempo</p>
                <p class="font-semibold text-slate-700">{{ propuesta.tiempo_estimado }} días</p>
              </div>
            </div>

            <div class="flex justify-end gap-4 border-t pt-3">
              <button
                @click="editar(propuesta)"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
              >
                Editar
              </button>
              <button
                @click="abrirModalConfirmacion(propuesta.id)"
                class="text-red-600 hover:text-red-800 font-medium text-sm transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de creación / edición -->
    <transition name="modal-fade">
      <div v-if="modalAbierto" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
          <h2 class="text-2xl font-bold text-[#002D5B] mb-5">
            {{ propuestaActual?.id ? 'Editar Propuesta' : 'Nueva Propuesta' }}
          </h2>

          <form @submit.prevent="guardarPropuesta" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Proyecto asociado</label>
              <select
                v-model="form.proyecto_id"
                required
                class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#00ADEF]"
              >
                <option value="">Selecciona un proyecto...</option>
                <option
                  v-for="proyecto in proyectosDisponibles"
                  :key="proyecto.id"
                  :value="proyecto.id"
                >
                  {{ proyecto.titulo }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea
                v-model.trim="form.descripcion"
                required
                placeholder="Describe brevemente tu propuesta..."
                class="w-full border border-slate-300 rounded-lg p-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Presupuesto</label>
                <input
                  v-model.number="form.presupuesto"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ej. 3000"
                  class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#00ADEF]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tiempo estimado (días)</label>
                <input
                  v-model.number="form.tiempo_estimado"
                  type="number"
                  min="1"
                  max="365"
                  required
                  placeholder="Ej. 30"
                  class="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#00ADEF]"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white rounded-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <div
      v-if="toast.mensaje"
      :class="[
        'fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white font-medium transition',
        toast.tipo === 'error' ? 'bg-red-600' : 'bg-green-600',
      ]"
    >
      {{ toast.mensaje }}
    </div>

    <!-- Modal de confirmación global -->
    <ConfirmModal
      :show="modalConfirmacion.abierto"
      title="¿Eliminar propuesta?"
      message="Esta acción no se puede deshacer. La propuesta se eliminará permanentemente del sistema."
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      @cancel="cerrarModalConfirmacion"
      @confirm="eliminarConfirmado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePropuestaStore } from '@/stores/propuestaStore'
import { useProyectoStore } from '@/stores/proyectoStore'
import { useLoaderStore } from '@/stores/loaderStore'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const propuestaStore = usePropuestaStore()
const proyectoStore = useProyectoStore()
const loader = useLoaderStore()

const propuestas = ref([])
const proyectosDisponibles = ref([])
const modalAbierto = ref(false)
const propuestaActual = ref(null)
const modalConfirmacion = ref({ abierto: false, id: null })

const form = ref({
  proyecto_id: '',
  descripcion: '',
  presupuesto: null,
  tiempo_estimado: null,
})

// Toast
const toast = ref({ mensaje: '', tipo: 'success' })
const mostrarToast = ({ mensaje, tipo = 'success', duracion = 2500 }) => {
  toast.value = { mensaje, tipo }
  setTimeout(() => (toast.value.mensaje = ''), duracion)
}

// Carga inicial
onMounted(async () => {
  loader.mostrar()
  try {
    propuestas.value = await propuestaStore.fetchAll()
    proyectosDisponibles.value = await proyectoStore.fetchAll()
  } catch (err) {
    mostrarToast({ tipo: 'error', mensaje: 'Error al cargar los datos iniciales' })
  } finally {
    loader.ocultar()
  }
})

// Abrir modal
const abrirModalNuevo = () => {
  propuestaActual.value = null
  form.value = { proyecto_id: '', descripcion: '', presupuesto: null, tiempo_estimado: null }
  modalAbierto.value = true
}

const cerrarModal = () => (modalAbierto.value = false)

// Editar
const editar = (propuesta) => {
  propuestaActual.value = propuesta
  form.value = { ...propuesta }
  modalAbierto.value = true
}

// Guardar propuesta
const guardarPropuesta = async () => {
  try {
    loader.mostrar()
    if (propuestaActual.value?.id) {
      await propuestaStore.actualizar(propuestaActual.value.id, form.value)
      mostrarToast({ tipo: 'success', mensaje: 'Propuesta actualizada correctamente.' })
    } else {
      await propuestaStore.crear(form.value)
      mostrarToast({ tipo: 'success', mensaje: 'Propuesta creada correctamente.' })
    }
    propuestas.value = await propuestaStore.fetchAll()
    cerrarModal()
  } catch (e) {
    mostrarToast({ tipo: 'error', mensaje: e.message || 'Error al guardar la propuesta.' })
  } finally {
    loader.ocultar()
  }
}

// Confirmación visual
const abrirModalConfirmacion = (id) => {
  modalConfirmacion.value = { abierto: true, id }
}

const cerrarModalConfirmacion = () => {
  modalConfirmacion.value = { abierto: false, id: null }
}

const eliminarConfirmado = async () => {
  const id = modalConfirmacion.value.id
  if (!id) return
  try {
    loader.mostrar()
    await propuestaStore.eliminar(id)
    propuestas.value = propuestas.value.filter((p) => p.id !== id)
    mostrarToast({ tipo: 'success', mensaje: 'Propuesta eliminada correctamente.' })
  } catch (e) {
    mostrarToast({ tipo: 'error', mensaje: 'Error al eliminar la propuesta.' })
  } finally {
    loader.ocultar()
    cerrarModalConfirmacion()
  }
}

// Promedios corregidos
const promedioPresupuesto = computed(() => {
  if (!propuestas.value.length) return 0
  const total = propuestas.value.reduce((acc, p) => acc + parseFloat(p.presupuesto || 0), 0)
  return Math.round(total / propuestas.value.length)
})

const promedioDias = computed(() => {
  if (!propuestas.value.length) return 0
  const total = propuestas.value.reduce((acc, p) => acc + parseFloat(p.tiempo_estimado || 0), 0)
  return Math.round(total / propuestas.value.length)
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@keyframes slide-up {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slide-up 0.3s ease;
}
</style>
