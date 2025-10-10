<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Confirmar acción</h3>
      <p class="text-sm text-gray-600 mb-6">{{ mensaje }}</p>

      <div class="flex justify-end gap-3">
        <button
          @click="$emit('cancelar')"
          class="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          @click="$emit('confirmar')"
          class="bg-red-600 text-white rounded-md px-4 py-2 text-sm hover:bg-red-700 transition"
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mensaje: { type: String, required: true }
})
defineEmits(['confirmar', 'cancelar'])
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
