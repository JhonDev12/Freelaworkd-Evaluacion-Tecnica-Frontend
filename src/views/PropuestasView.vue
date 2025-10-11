<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[#eef6fc] via-white to-[#f3f8fd] p-4 sm:p-8">

    <!-- CABECERA -->
    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
      <!-- IZQUIERDA: botón volver + título -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
        <button
          @click="volverAtras"
          class="order-2 sm:order-1 w-full sm:w-auto bg-[#00ADEF]/10 hover:bg-[#00ADEF]/20 border border-[#00ADEF]/30 text-[#00ADEF] font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          ← Volver
        </button>

        <div class="order-1 sm:order-2 text-center sm:text-left w-full sm:w-auto">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#002D5B] tracking-tight mb-1">
            Gestión de Propuestas
          </h1>
          <p class="text-slate-600 text-sm sm:text-base">
            Administra, crea y analiza tus propuestas activas fácilmente.
          </p>
        </div>
      </div>

      <!-- BOTÓN NUEVA PROPUESTA -->
      <button
        @click="abrirModalNuevo"
        class="w-full sm:w-auto bg-gradient-to-r from-[#00ADEF] to-[#0084CA] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.04] hover:shadow-lg transition-all duration-300"
      >
        + Nueva Propuesta
      </button>
    </header>

    <!-- ESTADÍSTICAS -->
    <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition">
        <p class="text-xs uppercase text-slate-400 tracking-wide">Total de propuestas</p>
        <p class="text-4xl font-extrabold text-[#002D5B] mt-1">{{ propuestas.length }}</p>
      </div>

      <div class="bg-gradient-to-br from-[#e0f7fa] to-[#f0faff] rounded-2xl shadow-sm border border-[#00ADEF]/20 p-6 text-center hover:shadow-lg transition">
        <p class="text-xs uppercase text-slate-500 tracking-wide">Promedio presupuestal</p>
        <p class="text-4xl font-extrabold text-[#00ADEF] mt-1">
          ${{ promedioPresupuesto.toLocaleString('es-CO') }}
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-lg transition">
        <p class="text-xs uppercase text-slate-400 tracking-wide">Tiempo promedio estimado</p>
        <p class="text-4xl font-extrabold text-[#002D5B] mt-1">{{ promedioDias }} días</p>
      </div>
    </section>

    <!-- GRID DE PROPUESTAS -->
    <section>
      <div
        v-if="!propuestas.length"
        class="text-center py-16 text-slate-500 italic text-lg font-medium"
      >
        No hay propuestas registradas todavía.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
      >
        <div
          v-for="propuesta in propuestas"
          :key="propuesta.id"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-[#002D5B] leading-tight">
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
          </div>

          <div class="flex justify-between items-center border-t pt-3 mt-auto">
            <button
              @click="editar(propuesta)"
              class="text-[#0070C0] hover:text-[#004D80] font-medium text-sm transition"
            >
              Editar
            </button>
            <button
              @click="abrirModalConfirmacion(propuesta.id)"
              class="text-red-500 hover:text-red-700 font-medium text-sm transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL CREAR / EDITAR -->
    <transition name="modal-fade">
      <div
        v-if="modalAbierto"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50"
      >
        <div
          class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn"
        >
          <h2 class="text-2xl font-bold text-[#002D5B] mb-5">
            {{ propuestaActual?.id ? 'Editar Propuesta' : 'Nueva Propuesta' }}
          </h2>

          <form @submit.prevent="guardarPropuesta" class="space-y-5">
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
                class="w-full border border-slate-300 rounded-lg p-2 h-28 resize-none focus:ring-2 focus:ring-[#00ADEF]"
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

            <div class="flex flex-wrap justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="cerrarModal"
                class="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#00ADEF] to-[#0084CA] text-white rounded-md shadow hover:scale-[1.03] hover:shadow-lg transition-all duration-200 text-sm"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- TOAST -->
    <div
      v-if="toast.mensaje"
      :class="[
        'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2 rounded-lg shadow-lg text-white font-medium transition text-sm sm:text-base',
        toast.tipo === 'error' ? 'bg-red-600' : 'bg-green-600',
      ]"
    >
      {{ toast.mensaje }}
    </div>

    <!-- CONFIRMACIÓN -->
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
import { useRouter } from 'vue-router'
import { usePropuestaStore } from '@/stores/propuestaStore'
import { useProyectoStore } from '@/stores/proyectoStore'
import { useLoaderStore } from '@/stores/loaderStore'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const router = useRouter()
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

const toast = ref({ mensaje: '', tipo: 'success' })
const mostrarToast = ({ mensaje, tipo = 'success', duracion = 2500 }) => {
  toast.value = { mensaje, tipo }
  setTimeout(() => (toast.value.mensaje = ''), duracion)
}

// 🔙 Volver atrás
const volverAtras = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'dashboard' })
}

// Carga inicial
onMounted(async () => {
  loader.mostrar()
  try {
    propuestas.value = await propuestaStore.fetchAll()
    proyectosDisponibles.value = await proyectoStore.fetchAll()
  } catch {
    mostrarToast({ tipo: 'error', mensaje: 'Error al cargar los datos iniciales' })
  } finally {
    loader.ocultar()
  }
})

const abrirModalNuevo = () => {
  propuestaActual.value = null
  form.value = { proyecto_id: '', descripcion: '', presupuesto: null, tiempo_estimado: null }
  modalAbierto.value = true
}
const cerrarModal = () => (modalAbierto.value = false)
const editar = (propuesta) => {
  propuestaActual.value = propuesta
  form.value = { ...propuesta }
  modalAbierto.value = true
}

const guardarPropuesta = async () => {
  try {
    loader.mostrar()
    if (propuestaActual.value?.id) {
      await propuestaStore.actualizar(propuestaActual.value.id, form.value)
      mostrarToast({ mensaje: 'Propuesta actualizada correctamente.' })
    } else {
      await propuestaStore.crear(form.value)
      mostrarToast({ mensaje: 'Propuesta creada correctamente.' })
    }
    propuestas.value = await propuestaStore.fetchAll()
    cerrarModal()
  } catch {
    mostrarToast({ tipo: 'error', mensaje: 'Error al guardar la propuesta.' })
  } finally {
    loader.ocultar()
  }
}

// Confirmación
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
    propuestas.value = propuestas.value.filter(p => p.id !== id)
    mostrarToast({ mensaje: 'Propuesta eliminada correctamente.' })
  } catch {
    mostrarToast({ tipo: 'error', mensaje: 'Error al eliminar la propuesta.' })
  } finally {
    loader.ocultar()
    cerrarModalConfirmacion()
  }
}

// Cálculos
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
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease;
}
</style>
