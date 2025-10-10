<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        class="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in"
      >
        <!-- Encabezado -->
        <header
          class="flex items-center justify-between px-6 py-4 border-b bg-slate-50"
        >
          <h3 class="text-lg font-semibold text-slate-800">
            Gestión de roles
          </h3>
          <button
            @click="$emit('close')"
            class="text-slate-500 text-sm hover:text-slate-700 transition"
          >
            Cerrar
          </button>
        </header>

        <!-- Contenido -->
        <section class="p-6 space-y-6">
          <!-- Formulario -->
          <form
            @submit.prevent="guardarRol"
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              v-model="form.nombre"
              placeholder="Nombre del rol"
              required
              class="px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none transition"
            />
            <input
              v-model="form.descripcion"
              placeholder="Descripción"
              class="px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none transition"
            />
            <button
              type="submit"
              class="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              {{ form.id ? 'Actualizar rol' : 'Crear rol' }}
            </button>
          </form>

          <!-- Lista de roles -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto"
          >
            <div
              v-for="r in roles"
              :key="r.id"
              class="border border-slate-200 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition flex justify-between items-start"
            >
              <div>
                <p class="font-medium text-slate-800 text-sm">
                  {{ r.nombre || r.name }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ r.descripcion || r.description || 'Sin descripción' }}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <button
                  @click="editarRol(r)"
                  class="px-3 py-1 text-xs rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Editar
                </button>
                <button
                  @click="confirmarEliminacion(r)"
                  class="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p
              v-if="!roles.length"
              class="text-center text-slate-500 text-sm col-span-full py-4"
            >
              No hay roles registrados.
            </p>
          </div>

          <p
            v-if="mensajeError"
            class="text-sm text-red-600 text-center bg-red-50 py-2 rounded-lg"
          >
            {{ mensajeError }}
          </p>
        </section>
      </div>

      <!-- Modal de confirmación -->
      <div
        v-if="rolAEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div
          class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm border border-slate-200"
        >
          <p class="text-slate-700 text-sm mb-5">
            ¿Seguro que deseas eliminar el rol
            <strong>{{ rolAEliminar.nombre || rolAEliminar.name }}</strong>?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="rolAEliminar = null"
              class="px-4 py-1.5 text-sm rounded-md border border-slate-300 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="eliminarRol"
              class="px-4 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import api from '@/api/axios'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'toast'])

const roles = ref([])
const form = reactive({ id: null, nombre: '', descripcion: '' })
const mensajeError = ref('')
const rolAEliminar = ref(null)

const cargarRoles = async () => {
  mensajeError.value = ''
  try {
    const res = await api.get('/roles')
    const data = res.data ?? {}
    roles.value = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : data.data ?? []
  } catch {
    mensajeError.value = 'No se pudieron cargar los roles.'
  }
}

const guardarRol = async () => {
  mensajeError.value = ''
  try {
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      name: form.nombre,
      description: form.descripcion,
    }

    if (form.id) {
      await api.patch(`/roles/${form.id}`, payload)
      emit('toast', {
        tipo: 'success',
        mensaje: 'Rol actualizado correctamente',
      })
    } else {
      await api.post('/roles', payload)
      emit('toast', {
        tipo: 'success',
        mensaje: 'Rol creado correctamente',
      })
    }

    form.id = null
    form.nombre = ''
    form.descripcion = ''
    await cargarRoles()
  } catch (err) {
    console.error(err.response?.data)
    mensajeError.value =
      err.response?.data?.message || 'Error al guardar el rol.'
    emit('toast', { tipo: 'error', mensaje: 'Error al guardar el rol.' })
  }
}

const editarRol = (rol) => {
  form.id = rol.id
  form.nombre = rol.nombre || rol.name
  form.descripcion = rol.descripcion || rol.description
}

const confirmarEliminacion = (rol) => {
  rolAEliminar.value = rol
}

const eliminarRol = async () => {
  try {
    await api.delete(`/roles/${rolAEliminar.value.id}`)
    emit('toast', {
      tipo: 'success',
      mensaje: 'Rol eliminado correctamente',
    })
    rolAEliminar.value = null
    await cargarRoles()
  } catch {
    emit('toast', { tipo: 'error', mensaje: 'No se pudo eliminar el rol.' })
  }
}

watch(
  () => props.open,
  (v) => v && cargarRoles()
)
onMounted(() => {
  if (props.open) cargarRoles()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fade-in 0.25s ease-in-out;
}
</style>
