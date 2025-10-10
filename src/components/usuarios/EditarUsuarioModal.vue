<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4 border-b">
        <h3 class="text-lg font-semibold text-gray-800">Actualizar usuario</h3>
        <button @click="$emit('cerrar')" class="text-sm text-gray-500 hover:underline">Cerrar</button>
      </header>

      <!-- Form -->
      <section class="p-6 space-y-3">
        <div class="grid grid-cols-1 gap-3">
          <label class="text-sm text-gray-700">
            Nombre
            <input
              v-model="form.name"
              class="mt-1 border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre"
            />
          </label>

          <label class="text-sm text-gray-700">
            Correo
            <input
              v-model="form.email"
              type="email"
              class="mt-1 border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="correo@dominio.com"
            />
          </label>

          <label class="text-sm text-gray-700">
            Contraseña (opcional)
            <input
              v-model="form.password"
              type="password"
              class="mt-1 border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dejar en blanco para no cambiar"
            />
          </label>
        </div>

        <p v-if="mensaje" class="text-sm text-red-600">{{ mensaje }}</p>
      </section>

      <!-- Footer -->
      <footer class="px-6 py-4 border-t flex justify-end gap-3">
        <button
          @click="$emit('cerrar')"
          class="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          class="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 transition"
        >
          Guardar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api/axios'

const props = defineProps({
  usuario: { type: Object, required: true }
})
const emit = defineEmits(['cerrar', 'guardado', 'toast'])

const form = ref({ name: '', email: '', password: '' })
const mensaje = ref('')

const cargar = () => {
  form.value = {
    name: props.usuario?.name || '',
    email: props.usuario?.email || '',
    password: ''
  }
}

onMounted(cargar)
watch(() => props.usuario, cargar, { deep: true })

const guardar = async () => {
  mensaje.value = ''
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email
    }
    if (form.value.password && form.value.password.trim().length > 0) {
      payload.password = form.value.password
    }

    const res = await api.put(`/usuarios/${props.usuario.id}`, payload)
    const actualizado = res.data?.data || res.data

    emit('guardado', actualizado)
    emit('toast', { mensaje: 'Usuario actualizado correctamente', tipo: 'success' })
  } catch (e) {
    console.error(e)
    mensaje.value = e?.response?.data?.mensaje || e?.response?.data?.message || 'Error al actualizar usuario'
    emit('toast', { mensaje: 'Error al actualizar usuario', tipo: 'error' })
  }
}
</script>
