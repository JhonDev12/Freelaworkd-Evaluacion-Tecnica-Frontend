<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      <!-- Encabezado -->
      <header class="flex items-center justify-between px-5 py-3 bg-[#002D5B] text-white">
        <h3 class="text-base font-semibold">Editar perfil</h3>
        <button @click="$emit('cerrar')" class="hover:text-gray-200 text-sm">✕</button>
      </header>

      <!-- Formulario -->
      <form @submit.prevent="actualizarPerfil" class="p-5 space-y-4">
        <div>
          <label class="text-sm text-slate-600 font-medium">Nombre</label>
          <input
            v-model="form.name"
            required
            placeholder="Tu nombre completo"
            class="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00ADEF] focus:border-[#00ADEF] transition"
          />
        </div>

        <div>
          <label class="text-sm text-slate-600 font-medium">Correo electrónico</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="tu@correo.com"
            class="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00ADEF] focus:border-[#00ADEF] transition"
          />
        </div>

        <div>
          <label class="text-sm text-slate-600 font-medium">Nueva contraseña (opcional)</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Dejar en blanco para no cambiar"
            class="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#00ADEF] focus:border-[#00ADEF] transition"
          />
          <p class="text-xs text-slate-500 mt-1">
            Debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('cerrar')"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 text-sm bg-[#00ADEF] hover:bg-[#0095CE] text-white font-medium rounded-md transition"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const props = defineProps({ usuario: Object })
const emit = defineEmits(['cerrar', 'actualizado', 'toast'])

const form = ref({
  name: props.usuario?.name || '',
  email: props.usuario?.email || '',
  password: '',
})

const actualizarPerfil = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password // no enviar si está vacío

    const res = await api.put(`/usuarios/${props.usuario.id}`, payload)

    emit('actualizado', res.data?.data || res.data)
    emit('toast', { mensaje: 'Perfil actualizado correctamente ', tipo: 'success' })
    emit('cerrar')
  } catch (e) {
    console.error(e)
    emit('toast', {
      mensaje:
        e?.response?.data?.message || 'Error al actualizar el perfil ',
      tipo: 'error',
    })
  }
}
</script>
