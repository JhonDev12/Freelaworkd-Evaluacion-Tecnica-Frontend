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
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
  return (
    u.role?.nombre ||
    u.role?.name ||
    (u.role_id === 1 ? 'Super Admin' : 'Usuario')
  )
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

/** Normaliza los toasts de todos los modales */
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

const abrirModalPerfil = () => {
  perfilAbierto.value = true
}

const actualizarUsuario = (nuevoUsuario) => {
  auth.user = nuevoUsuario
}

const cerrarSesion = async () => {
  await auth.logout()
  router.replace({ name: 'login' })
}

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

    conteos.value.proyectos = proyectos.length
    conteos.value.propuestas = propuestas.length
    conteos.value.proyectosAbiertos = proyectos.filter((p) => p.estado === 'abierto').length
    conteos.value.roles = roles.length
  } catch (e) {
    console.error('Error al cargar dashboard:', e)
  }
}

onMounted(async () => {
  try {
    if (!auth.user && auth.isAuthenticated) {
      await auth.fetchUser()
    }
    await cargarDatos()
  } catch (e) {
    console.warn('Error inicializando dashboard:', e)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
