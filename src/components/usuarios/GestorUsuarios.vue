<template>
  <div v-if="abierto" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden">
      <!-- Encabezado -->
      <header class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-slate-800">Gestión de usuarios</h2>
        <button @click="$emit('cerrar')" class="text-sm text-slate-500 hover:underline">
          Cerrar
        </button>
      </header>

      <!-- Formulario de creación -->
      <section class="p-6 border-b">
        <form @submit.prevent="crearUsuario" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <input
            v-model="form.name"
            placeholder="Nombre"
            required
            class="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <input
            v-model="form.email"
            placeholder="Correo electrónico"
            type="email"
            required
            class="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <input
            v-model="form.password"
            placeholder="Contraseña"
            type="password"
            required
            class="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            class="bg-[var(--primary)] text-white rounded-md py-2 text-sm font-medium hover:bg-[#004d73] transition"
          >
            Crear
          </button>
        </form>
        <p v-if="mensaje" class="text-sm text-red-600 mt-2">{{ mensaje }}</p>
      </section>

      <!-- Lista de usuarios -->
      <section class="p-6 overflow-y-auto max-h-[65vh]">
        <ul class="space-y-3">
          <li
            v-for="u in usuarios"
            :key="u.id"
            class="border rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex-1">
              <p class="font-medium text-slate-800">{{ u.name }}</p>
              <p class="text-xs text-slate-500">{{ u.email }}</p>

              <p class="text-xs text-slate-500 mt-1">
                Rol:
                <span class="font-medium">{{ mostrarRol(u) }}</span>
              </p>

              <p class="text-xs text-slate-500 mt-1">
                Habilidades:
                <span v-if="(u.habilidades && u.habilidades.length)" class="font-medium">
                  {{ u.habilidades.map(h => (h.nombre || h)).join(', ') }}
                </span>
                <span v-else class="font-medium text-slate-400">Sin habilidades</span>
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
              <select
                v-model="rolesAsignados[u.id]"
                @change="asignarRol(u)"
                class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option disabled value="">Seleccionar rol</option>
                <option
                  v-for="r in roles"
                  :key="r.id"
                  :value="String(r.id)"
                >
                  {{ r.nombre || r.name }}
                </option>
              </select>

              <button
                @click="abrirModalHabilidades(u)"
                class="border rounded px-3 py-1 text-sm hover:bg-slate-50 transition"
              >
                Habilidades
              </button>

              <button
                @click="abrirModalEditar(u)"
                class="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1 rounded-md"
              >
                Actualizar
              </button>

              <button
                @click="confirmarEliminacion(u)"
                class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md"
              >
                Eliminar
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Modal de habilidades -->
      <HabilidadModal
        v-if="modalHabilidadesAbierto"
        :abierto="modalHabilidadesAbierto"
        :usuario="usuarioSeleccionado"
        @cerrar="modalHabilidadesAbierto = false"
        @guardado="actualizarHabilidadesUsuario"
        @toast="reenviarToast"
      />

      <!-- Modal de edición -->
      <EditarUsuarioModal
        v-if="modalEditarAbierto"
        :usuario="usuarioParaEditar"
        @cerrar="modalEditarAbierto = false"
        @guardado="actualizarUsuarioEnLista"
        @toast="reenviarToast"
      />

      <!-- Modal de confirmación -->
      <ConfirmacionModal
        v-if="modalConfirmacionAbierto"
        :mensaje="`¿Seguro que deseas eliminar a ${usuarioAEliminar?.name}?`"
        @confirmar="eliminarUsuario"
        @cancelar="cerrarConfirmacion"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/api/axios'
import HabilidadModal from '@/components/usuarios/HabilidadModal.vue'
import EditarUsuarioModal from '@/components/usuarios/EditarUsuarioModal.vue'
import ConfirmacionModal from '@/components/ui/ConfirmacionModal.vue'

const props = defineProps({ abierto: Boolean })
const emit = defineEmits(['cerrar', 'toast'])

const usuarios = ref([])
const roles = ref([])
const rolesAsignados = ref({})
const mensaje = ref('')
const form = ref({ name: '', email: '', password: '' })

const modalHabilidadesAbierto = ref(false)
const usuarioSeleccionado = ref(null)

const modalEditarAbierto = ref(false)
const usuarioParaEditar = ref(null)

const modalConfirmacionAbierto = ref(false)
const usuarioAEliminar = ref(null)

onMounted(() => props.abierto && cargarDatos())
watch(() => props.abierto, (v) => v && cargarDatos())

const cargarDatos = async () => {
  mensaje.value = ''
  try {
    const [resUsuarios, resRoles] = await Promise.all([
      api.get('/usuarios'),
      api.get('/roles')
    ])

    const listaUsuarios = Array.isArray(resUsuarios.data) ? resUsuarios.data : (resUsuarios.data?.data || [])
    const listaRoles = Array.isArray(resRoles.data) ? resRoles.data : (resRoles.data?.data || [])

    usuarios.value = listaUsuarios.map(u => ({
      ...u,
      habilidades: Array.isArray(u.habilidades)
        ? u.habilidades.map(h => (typeof h === 'object' ? h : { id: h, nombre: String(h) }))
        : []
    }))

    roles.value = listaRoles
    usuarios.value.forEach(u => {
      rolesAsignados.value[u.id] = String(u.role_id ?? u.role?.id ?? '')
    })
  } catch (e) {
    console.error(e)
    mensaje.value = 'Error al cargar usuarios o roles.'
  }
}

const crearUsuario = async () => {
  mensaje.value = ''
  try {
    await api.post('/usuarios', form.value)
    emit('toast', { mensaje: 'Usuario creado correctamente', tipo: 'success' })
    form.value = { name: '', email: '', password: '' }
    await cargarDatos()
  } catch (e) {
    console.error(e)
    mensaje.value = e?.response?.data?.message || 'No se pudo crear el usuario.'
  }
}

const asignarRol = async (usuario) => {
  const roleId = rolesAsignados.value[usuario.id]
  if (!roleId) return
  try {
    const res = await api.patch(`/usuarios/${usuario.id}/rol`, { role_id: Number(roleId) })
    const actualizado = res.data?.data || res.data || {}
    usuario.role_id = Number(actualizado.role_id ?? roleId)
    const rol = roles.value.find(r => String(r.id) === String(usuario.role_id))
    usuario.role = rol ? { ...rol } : (actualizado.role || null)
    emit('toast', { mensaje: 'Rol asignado correctamente', tipo: 'success' })
  } catch (e) {
    console.error(e)
    emit('toast', { mensaje: 'Error al asignar rol', tipo: 'error' })
  }
}

/* ------- Actualizar (modal) ------- */
const abrirModalEditar = (u) => {
  usuarioParaEditar.value = { ...u } // copia para no mutar hasta guardar
  modalEditarAbierto.value = true
}
const actualizarUsuarioEnLista = (uActualizado) => {
  const idx = usuarios.value.findIndex(u => u.id === uActualizado.id)
  if (idx !== -1) {
    usuarios.value[idx] = {
      ...usuarios.value[idx],
      ...uActualizado,
      // asegurar estructura de habilidades
      habilidades: Array.isArray(uActualizado.habilidades)
        ? uActualizado.habilidades.map(h => (typeof h === 'object' ? h : { id: h, nombre: String(h) }))
        : (usuarios.value[idx].habilidades ?? [])
    }
  }
  modalEditarAbierto.value = false
  emit('toast', { mensaje: 'Usuario actualizado correctamente', tipo: 'success' })
}

/* ------- Eliminar (modal confirmación) ------- */
const confirmarEliminacion = (u) => {
  usuarioAEliminar.value = u
  modalConfirmacionAbierto.value = true
}
const cerrarConfirmacion = () => {
  usuarioAEliminar.value = null
  modalConfirmacionAbierto.value = false
}
const eliminarUsuario = async () => {
  if (!usuarioAEliminar.value) return
  try {
    await api.delete(`/usuarios/${usuarioAEliminar.value.id}`)
    usuarios.value = usuarios.value.filter(u => u.id !== usuarioAEliminar.value.id)
    emit('toast', { mensaje: 'Usuario eliminado correctamente', tipo: 'success' })
  } catch (e) {
    console.error(e)
    emit('toast', { mensaje: 'Error al eliminar usuario', tipo: 'error' })
  } finally {
    cerrarConfirmacion()
  }
}

/* ------- Habilidades ------- */
const mostrarRol = (u) => {
  if (u?.role?.nombre || u?.role?.name) return u.role.nombre ?? u.role.name
  if (u?.role_id) {
    const r = roles.value.find(x => String(x.id) === String(u.role_id))
    if (r) return r.nombre || r.name
  }
  return 'Sin rol'
}
const abrirModalHabilidades = (user) => {
  usuarioSeleccionado.value = user
  modalHabilidadesAbierto.value = true
}
const actualizarHabilidadesUsuario = (usuarioActualizado) => {
  const idx = usuarios.value.findIndex(u => u.id === usuarioActualizado.id)
  if (idx !== -1) {
    usuarios.value[idx].habilidades = (usuarioActualizado.habilidades || []).map(h =>
      typeof h === 'object' ? h : { id: h, nombre: String(h) }
    )
  }
  modalHabilidadesAbierto.value = false
  emit('toast', { mensaje: 'Habilidades asignadas correctamente', tipo: 'success' })
}

const reenviarToast = (payload) => emit('toast', payload)
</script>

<style>
/* sin @apply para evitar errores de Tailwind */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
</style>
