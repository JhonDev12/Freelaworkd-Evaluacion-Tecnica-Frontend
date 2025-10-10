<template>
  <div v-if="abierto" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-lg">
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800">Gestión de habilidades</h3>
        <button @click="$emit('cerrar')" class="text-sm text-slate-500 hover:underline">Cerrar</button>
      </div>

      <div class="p-5 space-y-5">
        <!-- Crear nueva habilidad -->
        <form @submit.prevent="crearHabilidad" class="flex gap-2">
          <input
            v-model="nuevaHabilidad"
            placeholder="Nombre de la habilidad"
            class="border border-slate-300 rounded-md flex-1 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            required
          />
          <button
            type="submit"
            class="bg-[var(--primary)] hover:bg-[#004d73] text-white text-sm px-4 py-2 rounded-md transition"
          >
            Crear
          </button>
        </form>

        <!-- Listado -->
        <div v-if="habilidades.length" class="max-h-64 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-md">
          <div
            v-for="h in habilidades"
            :key="h.id"
            class="flex items-center justify-between px-4 py-2 hover:bg-slate-50"
          >
            <span class="text-sm text-slate-800">{{ h.nombre }}</span>
            <button
              @click="eliminarHabilidad(h.id)"
              class="text-xs text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>

        <p v-else class="text-sm text-slate-500 text-center py-4">
          No hay habilidades registradas.
        </p>

        <p v-if="mensaje" class="text-sm text-red-600">{{ mensaje }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/api/axios'

const props = defineProps({
  abierto: Boolean
})

const emit = defineEmits(['cerrar', 'toast'])

const habilidades = ref([])
const nuevaHabilidad = ref('')
const mensaje = ref('')

watch(() => props.abierto, (val) => {
  if (val) cargarHabilidades()
})

const cargarHabilidades = async () => {
  try {
    const res = await api.get('/habilidades')
    habilidades.value = res.data?.data ?? res.data ?? []
  } catch {
    mensaje.value = 'Error al cargar las habilidades.'
  }
}

const crearHabilidad = async () => {
  if (!nuevaHabilidad.value.trim()) return
  try {
    const res = await api.post('/habilidades', { nombre: nuevaHabilidad.value })
    const creada = res.data?.data ?? res.data
    habilidades.value.unshift(creada)
    emit('toast', { mensaje: 'Habilidad creada correctamente.', tipo: 'success' })
    nuevaHabilidad.value = ''
  } catch {
    mensaje.value = 'No se pudo crear la habilidad.'
  }
}

const eliminarHabilidad = async (id) => {
  try {
    await api.delete(`/habilidades/${id}`)
    habilidades.value = habilidades.value.filter((h) => h.id !== id)
    emit('toast', { mensaje: 'Habilidad eliminada.', tipo: 'success' })
  } catch {
    mensaje.value = 'No se pudo eliminar la habilidad.'
  }
}
</script>
