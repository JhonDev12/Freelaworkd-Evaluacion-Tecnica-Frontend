<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e8f1f9] via-white to-[#f0f6fc] p-6">
    <!-- Encabezado -->
    <header class="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 class="text-3xl font-extrabold text-[#002D5B] tracking-tight">
        Gestión de Proyectos
      </h1>

      <button
        @click="abrirModalNuevo"
        class="mt-4 sm:mt-0 bg-[#00ADEF] hover:bg-[#0095CE] text-white font-medium px-4 py-2 rounded-lg shadow transition"
      >
        + Nuevo Proyecto
      </button>
    </header>

    <!-- Tabla de proyectos -->
    <section class="bg-white shadow-md rounded-2xl overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-[#002D5B] text-white text-left">
          <tr>
            <th class="p-3 font-semibold">Título</th>
            <th class="p-3 font-semibold">Descripción</th>
            <th class="p-3 font-semibold">Presupuesto</th>
            <th class="p-3 font-semibold">Estado</th>
            <th class="p-3 font-semibold text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="proyecto in proyectos"
            :key="proyecto.id"
            class="border-b hover:bg-slate-50 transition"
          >
            <td class="p-3">{{ proyecto.titulo }}</td>
            <td class="p-3 truncate max-w-xs">{{ proyecto.descripcion }}</td>
            <td class="p-3">
              {{ proyecto.presupuesto ? `$${Number(proyecto.presupuesto).toLocaleString()}` : '—' }}
            </td>
            <td class="p-3 capitalize">
              <span
                :class="estadoClase(proyecto.estado)"
                class="px-2 py-1 text-xs rounded-md font-semibold"
              >
                {{ proyecto.estado }}
              </span>
            </td>
            <td class="p-3 text-center space-x-2">
              <button
                @click="editar(proyecto)"
                class="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Editar
              </button>
              <button
                @click="confirmarEliminar(proyecto.id)"
                class="text-red-600 hover:text-red-800 font-medium transition"
              >
                Eliminar
              </button>
            </td>
          </tr>

          <tr v-if="!proyectos.length">
            <td colspan="5" class="p-6 text-center text-slate-500 italic">
              No hay proyectos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Modal de creación/edición -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-xl font-semibold text-[#002D5B] mb-4">
          {{ proyectoActual?.id ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
        </h2>

        <form @submit.prevent="guardarProyecto" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Título</label>
            <input
              v-model.trim="form.titulo"
              type="text"
              required
              maxlength="255"
              placeholder="Ej. Plataforma Freelaworkd"
              class="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              v-model.trim="form.descripcion"
              required
              placeholder="Describe brevemente el proyecto..."
              class="mt-1 w-full border border-slate-300 rounded-lg p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
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
                class="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#00ADEF]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700">Estado</label>
              <select
                v-model="form.estado"
                class="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#00ADEF]"
              >
                <option value="abierto">Abierto</option>
                <option value="en progreso">En progreso</option>
                <option value="finalizado">Finalizado</option>
              </select>
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
              class="px-4 py-2 bg-[#00ADEF] text-white rounded-md hover:bg-[#0095CE] transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast notificación -->
    <div
      v-if="toast.mensaje"
      :class="[
        'fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white font-medium transition',
        toast.tipo === 'error' ? 'bg-red-600' : 'bg-green-600'
      ]"
    >
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProyectoStore } from '@/stores/proyectoStore'
import { useLoaderStore } from '@/stores/loaderStore'

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

// Sistema de notificaciones tipo toast
const toast = ref({ mensaje: '', tipo: 'success' })
const mostrarToast = ({ mensaje, tipo = 'success', duracion = 2500 }) => {
  toast.value = { mensaje, tipo }
  setTimeout(() => (toast.value.mensaje = ''), duracion)
}

// Carga inicial
onMounted(async () => {
  loader.mostrar()
  try {
    proyectos.value = await proyectoStore.fetchAll()
  } catch (err) {
    console.error('Error al cargar proyectos:', err)
    mostrarToast({ tipo: 'error', mensaje: 'Error al cargar proyectos' })
  } finally {
    loader.ocultar()
  }
})

// Crear o actualizar proyecto
const guardarProyecto = async () => {
  try {
    loader.mostrar()
    if (proyectoActual.value?.id) {
      await proyectoStore.actualizar(proyectoActual.value.id, form.value)
      mostrarToast({ tipo: 'success', mensaje: 'Proyecto actualizado correctamente' })
    } else {
      await proyectoStore.crear({ ...form.value })
      mostrarToast({ tipo: 'success', mensaje: 'Proyecto creado correctamente' })
    }
    proyectos.value = await proyectoStore.fetchAll()
    cerrarModal()
  } catch (e) {
    console.error('Error al guardar proyecto:', e)
    mostrarToast({ tipo: 'error', mensaje: e.message || 'Error al guardar proyecto' })
  } finally {
    loader.ocultar()
  }
}

// Eliminar proyecto
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este proyecto?')) {
    try {
      loader.mostrar()
      await proyectoStore.eliminar(id)
      proyectos.value = proyectos.value.filter(p => p.id !== id)
      mostrarToast({ tipo: 'success', mensaje: 'Proyecto eliminado correctamente' })
    } catch (e) {
      console.error('Error al eliminar proyecto:', e)
      mostrarToast({ tipo: 'error', mensaje: 'Error al eliminar proyecto' })
    } finally {
      loader.ocultar()
    }
  }
}

// Abrir modal
const abrirModalNuevo = () => {
  proyectoActual.value = null
  form.value = { titulo: '', descripcion: '', presupuesto: null, estado: 'abierto' }
  modalAbierto.value = true
}

// Editar modal
const editar = (proyecto) => {
  proyectoActual.value = proyecto
  form.value = { ...proyecto }
  modalAbierto.value = true
}

// Cerrar modal
const cerrarModal = () => (modalAbierto.value = false)

// Clases de estado
const estadoClase = (estado) => ({
  abierto: 'bg-green-100 text-green-700',
  'en progreso': 'bg-yellow-100 text-yellow-700',
  finalizado: 'bg-slate-200 text-slate-600',
}[estado] || 'bg-gray-100 text-gray-700')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
