<template>
  <transition name="toast" mode="out-in">
    <div
      v-if="visible"
      :class="[
        'fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg text-white text-sm font-medium z-50',
        tipo === 'success'
          ? 'bg-emerald-600'
          : tipo === 'error'
          ? 'bg-red-600'
          : 'bg-slate-700'
      ]"
    >
      {{ mensaje }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  mensaje: String,
  tipo: {
    type: String,
    default: 'info', // puede ser "success", "error" o "info"
  },
  duracion: {
    type: Number,
    default: 2500, // 2.5 segundos
  },
})

const visible = ref(false)

watch(
  () => props.mensaje,
  (nuevo) => {
    if (nuevo) {
      visible.value = true
      setTimeout(() => {
        visible.value = false
      }, props.duracion)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
