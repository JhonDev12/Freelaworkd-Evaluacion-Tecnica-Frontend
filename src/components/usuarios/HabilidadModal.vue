<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">
          Habilidades de {{ usuario?.name }}
        </h3>
        <button
          @click="$emit('cerrar')"
          class="text-xl text-gray-400 hover:text-gray-600 transition"
          aria-label="Cerrar"
        >
          ×
        </button>
      </header>

      <!-- Contenido -->
      <section class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Selecciona habilidades
          </label>

          <div v-if="cargando" class="text-sm text-gray-500">Cargando habilidades…</div>

          <div
            v-else-if="habilidades.length"
            class="flex flex-wrap gap-2 max-h-48 overflow-y-auto"
          >
            <button
              v-for="h in habilidades"
              :key="h.id"
              @click="toggleHabilidad(h.id)"
              :class="[
                'px-3 py-1.5 rounded-full border text-sm transition select-none',
                seleccion.includes(h.id)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ h.nombre }}
            </button>
          </div>

          <p v-else class="text-gray-500 text-sm italic">
            No hay habilidades registradas aún.
          </p>
        </div>

        <!-- Crear nueva habilidad -->
        <div class="pt-2 border-t border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-1">Agregar nueva habilidad</label>
          <div class="flex gap-2">
            <input
              v-model="nuevaHabilidad"
              placeholder="Ejemplo: Laravel, UX Design, Vue..."
              class="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              @click="crearHabilidad"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Crear
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          @click="$emit('cerrar')"
          class="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          @click="guardarHabilidades"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          Guardar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/api/axios'

const props = defineProps({
  abierto: Boolean,
  usuario: { type: Object, required: true }
})
const emit = defineEmits(['cerrar', 'guardado', 'toast'])

const habilidades = ref([])
const seleccion = ref([]) // array de ids
const nuevaHabilidad = ref('')
const cargando = ref(false)

const cargarHabilidades = async () => {
  try {
    cargando.value = true
    const res = await api.get('/habilidades')
    const lista = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    habilidades.value = lista.map(h => ({
      id: h.id,
      nombre: h.nombre
    }))
  } catch (e) {
    console.error(e)
    emit('toast', { mensaje: 'Error al cargar habilidades', tipo: 'error' })
  } finally {
    cargando.value = false
  }
}

const hidratarSeleccion = () => {
  // El usuario podría venir con habilidades como [{id,nombre}] o [ids]
  seleccion.value = Array.isArray(props.usuario?.habilidades)
    ? props.usuario.habilidades.map(h => (typeof h === 'object' ? h.id : h))
    : []
}

onMounted(async () => {
  await cargarHabilidades()
  hidratarSeleccion()
})

watch(() => props.abierto, async (v) => {
  if (v) {
    await cargarHabilidades()
    hidratarSeleccion()
  }
})

const toggleHabilidad = (id) => {
  const i = seleccion.value.indexOf(id)
  if (i === -1) seleccion.value.push(id)
  else seleccion.value.splice(i, 1)
}

const crearHabilidad = async () => {
  if (!nuevaHabilidad.value.trim()) return
  try {
    const res = await api.post('/habilidades', { nombre: nuevaHabilidad.value.trim() })
    const habilidad = res.data?.data || res.data
    // asegura {id,nombre}
    const hObj = { id: habilidad.id, nombre: habilidad.nombre }
    habilidades.value.unshift(hObj)
    if (!seleccion.value.includes(hObj.id)) seleccion.value.push(hObj.id)
    nuevaHabilidad.value = ''
    emit('toast', { mensaje: 'Habilidad creada', tipo: 'success' })
  } catch (e) {
    console.error(e)
    emit('toast', { mensaje: 'Error al crear habilidad', tipo: 'error' })
  }
}

const guardarHabilidades = async () => {
  try {
    const res = await api.patch(`/usuarios/${props.usuario.id}/habilidades`, {
      habilidades: seleccion.value
    })
    const usuarioActualizado = res.data?.data || res.data
    emit('guardado', usuarioActualizado)
  } catch (e) {
    console.error(e)
    emit('toast', { mensaje: 'Error al guardar habilidades', tipo: 'error' })
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.18s ease-out; }
</style>
