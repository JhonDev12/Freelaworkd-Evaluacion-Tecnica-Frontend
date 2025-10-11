<template>
  <div class="min-h-screen bg-gradient-to-br from-[#e8f1f9] via-white to-[#f0f6fc] p-6">
    <!-- Encabezado -->
    <header class="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <h1 class="text-3xl font-extrabold text-[#002D5B] tracking-tight drop-shadow-sm">
        Panel de Control
      </h1>

      <div class="flex items-center gap-4">
        <div v-if="usuario" class="text-sm text-slate-700">
          Hola, <b class="text-[#002D5B]">{{ usuario.name }}</b>
          <span v-if="rolUsuario" class="text-xs text-slate-500">({{ rolUsuario }})</span>
        </div>

        <button
          @click="abrirModalPerfil"
          class="text-sm bg-[#00ADEF]/10 border border-[#00ADEF]/30 text-[#00ADEF] px-3 py-1.5 rounded-md hover:bg-[#00ADEF]/20 transition"
        >
          Editar perfil
        </button>
        <button
          @click="irAProyectos"
          class="text-sm bg-[#00ADEF] text-white px-3 py-1.5 rounded-md shadow hover:bg-[#0095CE] transition"
        >
          Crear proyectos
        </button>
        <button
          @click="irAPropuestas"
          class="text-sm bg-gradient-to-r from-[#93e60e] to-[#3b82f6] text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
        >
          Crear propuestas
        </button>

        <button
          @click="cerrarSesion"
          class="text-sm bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </header>

    <!-- Tarjetas KPI -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <TarjetaKpi titulo="Proyectos" :valor="conteos.proyectos" color="from-blue-500 to-blue-700" />
      <TarjetaKpi titulo="Propuestas" :valor="conteos.propuestas" color="from-emerald-500 to-emerald-700" />
      <TarjetaKpi titulo="Abiertos" :valor="conteos.proyectosAbiertos" color="from-indigo-500 to-indigo-700" />
      <TarjetaKpi
        v-if="esSuperAdmin"
        titulo="Roles"
        :valor="conteos.roles"
        color="from-cyan-500 to-cyan-700"
      />
    </section>

    <!-- Listas recientes -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <TarjetaLista
        titulo="Proyectos recientes"
        :elementos="proyectosRecientes"
        tipo="proyecto"
      />
      <TarjetaLista
        titulo="Propuestas recientes"
        :elementos="propuestasRecientes"
        tipo="propuesta"
      />
    </section>

    <!-- MIS HABILIDADES (solo usuario normal) -->
    <section
      v-if="!esAdmin && !esSuperAdmin"
      class="mt-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-[#002D5B] flex items-center gap-2">
          🧠 Mis habilidades
        </h2>
      </div>

      <!-- Habilidades actuales -->
      <div v-if="habilidadesUsuario.length" class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="h in habilidadesUsuario"
          :key="h.id"
          class="bg-[#E0F2FE] text-[#0369A1] px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
        >
          {{ h.nombre }}
          <button
            @click="eliminarHabilidad(h.id)"
            class="text-red-500 hover:text-red-700 font-bold"
            title="Eliminar habilidad"
          >
            ✕
          </button>
        </span>
      </div>

      <div v-else class="text-slate-500 italic mb-6">
        No tienes habilidades registradas aún. ¡Agrega una nueva!
      </div>

      <!-- Agregar habilidad -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <select
          v-model="habilidadSeleccionada"
          class="border border-slate-300 rounded-lg p-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-[#00ADEF]"
        >
          <option value="">Selecciona una habilidad...</option>
          <option v-for="h in todasHabilidades" :key="h.id" :value="h.id">
            {{ h.nombre }}
          </option>
        </select>

        <button
          @click="agregarHabilidad"
          class="bg-[#00ADEF] text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-[#0095CE] transition text-sm"
        >
          Agregar
        </button>
      </div>
    </section>

    <!-- Botones flotantes -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        v-if="esSuperAdmin"
        @click="usuariosAbierto = true"
        class="bg-[#002D5B] hover:bg-[#001E40] text-white font-medium px-4 py-2 rounded-full shadow-md transition"
      >
        Gestionar usuarios
      </button>

      <button
        v-if="esSuperAdmin"
        @click="rolesAbierto = true"
        class="bg-[#00ADEF] hover:bg-[#0095CE] text-white font-medium px-4 py-2 rounded-full shadow-md transition"
      >
        Gestionar roles
      </button>

      <button
        v-if="esAdmin"
        @click="habilidadesAbierto = true"
        class="bg-[#00B8A9] hover:bg-[#009E92] text-white font-medium px-4 py-2 rounded-full shadow-md transition"
      >
        Habilidades
      </button>
    </div>

    <!-- Modales -->
    <GestorUsuarios
      :abierto="usuariosAbierto"
      @cerrar="usuariosAbierto = false"
      @toast="pushToast"
    />
    <GestorHabilidades
      :abierto="habilidadesAbierto"
      @cerrar="habilidadesAbierto = false"
      @toast="pushToast"
    />
    <GestionarRoles
      :open="rolesAbierto"
      @close="rolesAbierto = false"
      @toast="pushToast"
    />
    <EditarPerfilModal
      v-if="perfilAbierto"
      :usuario="usuario"
      @cerrar="perfilAbierto = false"
      @actualizado="actualizarUsuario"
      @toast="pushToast"
    />

    <!-- Toasts -->
    <NotificacionToast
      v-for="(t, i) in toasts"
      :key="t.id || i"
      :mensaje="t.mensaje"
      :tipo="t.tipo"
      :duracion="t.duracion || 2400"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProyectoStore } from '@/stores/proyectoStore'
import { usePropuestaStore } from '@/stores/propuestaStore'
import api from '@/api/axios'

import TarjetaKpi from '@/components/ui/TarjetaKpi.vue'
import TarjetaLista from '@/components/ui/TarjetaLista.vue'
import GestorUsuarios from '@/components/usuarios/GestorUsuarios.vue'
import GestorHabilidades from '@/components/habilidades/GestorHabilidades.vue'
import GestionarRoles from '@/components/roles/GestionarRoles.vue'
import EditarPerfilModal from '@/components/ui/EditarPerfilModal.vue'
import NotificacionToast from '@/components/ui/NotificacionToast.vue'

const router = useRouter()
const auth = useAuthStore()
const proyectosStore = useProyectoStore()
const propuestasStore = usePropuestaStore()

const usuario = computed(() => auth.user)
const rolUsuario = computed(() => {
  const u = usuario.value
  if (!u) return ''
  return u.role?.nombre || u.role?.name || (u.role_id === 1 ? 'Super Admin' : 'Usuario')
})

const esSuperAdmin = computed(() => rolUsuario.value?.toLowerCase().includes('super'))
const esAdmin = computed(() => rolUsuario.value?.toLowerCase().includes('admin'))

const conteos = ref({ proyectos: 0, propuestas: 0, proyectosAbiertos: 0, roles: 0 })
const proyectosRecientes = ref([])
const propuestasRecientes = ref([])
const usuariosAbierto = ref(false)
const habilidadesAbierto = ref(false)
const rolesAbierto = ref(false)
const perfilAbierto = ref(false)
const toasts = ref([])

// Habilidades personales
const habilidadesUsuario = ref([])
const todasHabilidades = ref([])
const habilidadSeleccionada = ref('')

/** Sistema de notificaciones (toast) */
const pushToast = (raw) => {
  const payload = {
    mensaje: raw?.mensaje ?? raw?.message ?? '',
    tipo: raw?.tipo ?? raw?.type ?? 'info',
    duracion: raw?.duracion,
    id: Math.random().toString(36).slice(2),
  }
  toasts.value.push(payload)
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== payload.id)
  }, payload.duracion || 2400)
}

const abrirModalPerfil = () => (perfilAbierto.value = true)
const actualizarUsuario = (nuevoUsuario) => (auth.user = nuevoUsuario)
const cerrarSesion = async () => {
  await auth.logout()
  router.replace({ name: 'login' })
}

/** Cargar datos del dashboard */
const cargarDatos = async () => {
  try {
    const [proyectos, propuestas] = await Promise.all([
      proyectosStore.fetchAll(),
      propuestasStore.fetchAll(),
    ])
    const rolesResp = esSuperAdmin.value ? await api.get('/roles') : { data: [] }
    const roles = rolesResp.data?.data ?? rolesResp.data ?? []

    proyectosRecientes.value = proyectos.slice(0, 5)
    propuestasRecientes.value = propuestas.slice(0, 5)
    conteos.value = {
      proyectos: proyectos.length,
      propuestas: propuestas.length,
      proyectosAbiertos: proyectos.filter(p => p.estado === 'abierto').length,
      roles: roles.length,
    }

    // Habilidades del usuario normal
    if (!esAdmin.value && !esSuperAdmin.value) {
      const res = await api.get(`/usuarios/${auth.user.id}`)
      habilidadesUsuario.value =
        res.data?.habilidades ||
        res.data?.user?.habilidades ||
        res.data?.data?.habilidades ||
        []
      const all = await api.get('/habilidades')
      todasHabilidades.value = all.data?.data || all.data || []
    }
  } catch (e) {
    console.error('Error al cargar dashboard:', e)
  }
}

/** Agregar nueva habilidad */
const agregarHabilidad = async () => {
  if (!habilidadSeleccionada.value) return
  try {
    await api.patch(`/usuarios/${auth.user.id}/habilidades`, {
      habilidades: [...habilidadesUsuario.value.map(h => h.id), habilidadSeleccionada.value],
    })
    pushToast({ mensaje: 'Habilidad agregada correctamente.', tipo: 'success' })
    await cargarDatos()
    habilidadSeleccionada.value = ''
  } catch (e) {
    pushToast({ mensaje: 'Error al agregar habilidad.', tipo: 'error' })
  }
}

/** Eliminar habilidad */
const eliminarHabilidad = async (id) => {
  try {
    const nuevas = habilidadesUsuario.value.filter(h => h.id !== id).map(h => h.id)
    await api.patch(`/usuarios/${auth.user.id}/habilidades`, { habilidades: nuevas })
    pushToast({ mensaje: 'Habilidad eliminada.', tipo: 'success' })
    await cargarDatos()
  } catch (e) {
    pushToast({ mensaje: 'Error al eliminar habilidad.', tipo: 'error' })
  }
}

onMounted(async () => {
  try {
    if (!auth.user && auth.isAuthenticated) await auth.fetchUser()
    await cargarDatos()
  } catch (e) {
    console.warn('Error inicializando dashboard:', e)
  }
})

const irAProyectos = () => router.push({ name: 'proyectos' })
const irAPropuestas = () => router.push({ name: 'propuestas' })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
