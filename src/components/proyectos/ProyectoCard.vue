<template>
  <Teleport to="body">
    <div
      v-if="abierto"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div
        class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        <!-- Encabezado -->
        <header
          class="flex items-center justify-between px-6 py-4 border-b bg-slate-50"
        >
          <h3 class="text-xl font-semibold text-[#0B2A45]">
            {{ proyecto.id ? 'Editar proyecto' : 'Nuevo proyecto' }}
          </h3>
          <button
            @click="$emit('cerrar')"
            class="text-slate-500 hover:text-slate-700 text-sm"
          >
            Cerrar ✕
          </button>
        </header>

        <!-- Formulario -->
        <form @submit.prevent="guardar" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Título
            </label>
            <input
              v-model="proyecto.titulo"
              type="text"
              class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00ADEF] outline-none"
              placeholder="Ej. Plataforma de gestión de tareas"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              v-model="proyecto.descripcion"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00ADEF] outline-none resize-none"
              placeholder="Describe brevemente el objetivo del proyecto"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Presupuesto (opcional)
              </label>
              <input
                v-model="proyecto.presupuesto"
                type="number"
                step="0.01"
                class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00ADEF] outline-none"
                placeholder="Ej. 2500.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Estado
              </label>
              <select
                v-model="proyecto.estado"
                class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00ADEF] outline-none"
              >
                <option value="abierto">Abierto</option>
                <option value="en progreso">En progreso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          <div v-if="errorMsg" class="text-sm text-red-600">
            {{ errorMsg }}
          </div>

          <div class="flex justify-end mt-6 gap-3">
            <button
              type="button"
              @click="$emit('cerrar')"
              class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-[#00ADEF] text-white rounded-lg font-medium hover:bg-[#0098cf] transition"
            >
              {{ proyecto.id ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useProyectoStore } from '@/stores/proyectoStore'

const props = defineProps({
  abierto: Boolean,
  proyectoEditar: { type: Object, default: null },
})
const emit = defineEmits(['cerrar', 'guardado', 'toast'])

const store = useProyectoStore()
const proyecto = reactive({
  id: null,
  titulo: '',
  descripcion: '',
  presupuesto: '',
  estado: 'abierto',
})
const errorMsg = ref('')

watch(
  () => props.proyectoEditar,
  (val) => {
    if (val) Object.assign(proyecto, val)
  }
)

const limpiar = () => {
  proyecto.id = null
  proyecto.titulo = ''
  proyecto.descripcion = ''
  proyecto.presupuesto = ''
  proyecto.estado = 'abierto'
}

const guardar = async () => {
  try {
    errorMsg.value = ''
    if (proyecto.id) {
      await store.actualizar(proyecto)
      emit('toast', { tipo: 'success', mensaje: 'Proyecto actualizado correctamente' })
    } else {
      await store.crear(proyecto)
      emit('toast', { tipo: 'success', mensaje: 'Proyecto creado correctamente' })
    }
    limpiar()
    emit('guardado')
    emit('cerrar')
  } catch (error) {
    console.error(error)
    errorMsg.value = error.response?.data?.message || 'Error al guardar el proyecto'
    emit('toast', { tipo: 'error', mensaje: 'Error al guardar el proyecto' })
  }
}
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
