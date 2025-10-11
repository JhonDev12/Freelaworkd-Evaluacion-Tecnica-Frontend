<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[#eef5fb] via-white to-[#f3f8fd] p-4 sm:p-8">

    <!-- ENCABEZADO -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
      <!-- Izquierda: botón volver + título -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
        <!-- Botón volver -->
        <button
          @click="volverAtras"
          class="order-2 sm:order-1 w-full sm:w-auto bg-[#00ADEF]/10 hover:bg-[#00ADEF]/20 border border-[#00ADEF]/30 text-[#00ADEF] font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          ← Volver
        </button>

        <!-- Título -->
        <div class="order-1 sm:order-2 text-center sm:text-left w-full sm:w-auto">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#002D5B] tracking-tight mb-1">
            Gestión de Proyectos
          </h1>
          <p class="text-slate-600 text-sm sm:text-base">
            Crea, administra y visualiza todos tus proyectos de forma ágil y moderna.
          </p>
        </div>
      </div>

      <!-- Botón principal -->
      <button
        @click="abrirModalNuevo"
        class="w-full sm:w-auto bg-gradient-to-r from-[#00ADEF] to-[#0084CA] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.04] hover:shadow-lg transition-all duration-300"
      >
        + Nuevo Proyecto
      </button>
    </header>

    <!-- GRID DE PROYECTOS -->
    <section>
      <div v-if="!proyectos.length" class="text-center py-16 text-slate-500 italic text-lg font-medium">
        No hay proyectos registrados todavía.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        <div
          v-for="proyecto in proyectos"
          :key="proyecto.id"
          class="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div class="p-6 flex flex-col gap-3 flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-[#002D5B] truncate">
              {{ proyecto.titulo }}
            </h2>
            <p class="text-sm text-slate-500 line-clamp-3">
              {{ proyecto.descripcion || 'Sin descripción' }}
            </p>

            <div class="mt-2 text-sm">
              <p class="text-slate-400 uppercase text-[11px]">Presupuesto</p>
              <p class="font-semibold text-[#00ADEF]">
                {{ proyecto.presupuesto ? `$${Number(proyecto.presupuesto).toLocaleString('es-CO')}` : '—' }}
              </p>
            </div>

            <div class="mt-1 text-sm">
              <p class="text-slate-400 uppercase text-[11px]">Estado</p>
              <span
                :class="estadoClase(proyecto.estado)"
                class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold"
              >
                {{ proyecto.estado }}
              </span>
            </div>
          </div>

          <div class="flex justify-between items-center border-t p-4">
            <button
              @click="editar(proyecto)"
              class="text-[#0070C0] hover:text-[#004D80] font-medium text-sm transition"
            >
              Editar
            </button>
            <button
              @click="confirmarEliminar(proyecto.id)"
              class="text-red-500 hover:text-red-700 font-medium text-sm transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL -->
    <transition name="modal-fade">
      <div
        v-if="modalAbierto"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50"
      >
        <div
          class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn"
        >
          <h2 class="text-2xl font-bold text-[#002D5B] mb-5">
            {{ proyectoActual?.id ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
          </h2>

          <form @submit.prevent="guardarProyecto" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700">Título</label>
              <input
                v-model.trim="form.titulo"
                type="text"
                required
                maxlength="255"
                placeholder="Ej. Plataforma Freelaworkd"
                class="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00ADEF]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                v-model.trim="form.descripcion"
                required
                placeholder="Describe brevemente el proyecto..."
                class="mt-1 w-full border border-slate-300 rounded-lg p-2 h-28 text-sm resize-none focus:ring-2 focus:ring-[#00ADEF]"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700">Presupuesto</label>
                <input
                  v-model.number="form.presupuesto"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej. 25000"
                  class="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00ADEF]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700">Estado</label>
                <select
                  v-model="form.estado"
                  class="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00ADEF]"
                >
                  <option value="abierto">Abierto</option>
                  <option value="en progreso">En progreso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProyectoStore } from '@/stores/proyectoStore'
import { useLoaderStore } from '@/stores/loaderStore'

const router = useRouter()
const proyectoStore = useProyectoStore()
const loader = useLoaderStore()

const proyectos = ref([])
const modalAbierto = ref(false)
const proyectoActual = ref(null)

const form = ref({
  titulo: '',
  descripcion: '',
  presupuesto: null,
  estado: 'abierto',
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

// Cargar proyectos
onMounted(async () => {
  loader.mostrar()
  try {
    proyectos.value = await proyectoStore.fetchAll()
  } catch {
    mostrarToast({ tipo: 'error', mensaje: 'Error al cargar proyectos' })
  } finally {
    loader.ocultar()
  }
})

// Guardar proyecto
const guardarProyecto = async () => {
  try {
    loader.mostrar()
    if (proyectoActual.value?.id) {
      await proyectoStore.actualizar(proyectoActual.value.id, form.value)
      mostrarToast({ mensaje: 'Proyecto actualizado correctamente' })
    } else {
      await proyectoStore.crear(form.value)
      mostrarToast({ mensaje: 'Proyecto creado correctamente' })
    }
    proyectos.value = await proyectoStore.fetchAll()
    cerrarModal()
  } catch {
    mostrarToast({ tipo: 'error', mensaje: 'Error al guardar proyecto' })
  } finally {
    loader.ocultar()
  }
}

// Eliminar
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este proyecto?')) {
    try {
      loader.mostrar()
      await proyectoStore.eliminar(id)
      proyectos.value = proyectos.value.filter(p => p.id !== id)
      mostrarToast({ mensaje: 'Proyecto eliminado correctamente' })
    } catch {
      mostrarToast({ tipo: 'error', mensaje: 'Error al eliminar proyecto' })
    } finally {
      loader.ocultar()
    }
  }
}

// Modal
const abrirModalNuevo = () => {
  proyectoActual.value = null
  form.value = { titulo: '', descripcion: '', presupuesto: null, estado: 'abierto' }
  modalAbierto.value = true
}
const editar = (proyecto) => {
  proyectoActual.value = proyecto
  form.value = { ...proyecto }
  modalAbierto.value = true
}
const cerrarModal = () => (modalAbierto.value = false)

// Clases visuales
const estadoClase = (estado) => ({
  abierto: 'bg-green-100 text-green-700',
  'en progreso': 'bg-yellow-100 text-yellow-700',
  finalizado: 'bg-slate-200 text-slate-600',
}[estado] || 'bg-gray-100 text-gray-700')
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
