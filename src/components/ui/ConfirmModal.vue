<template>
  <transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        class="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up"
      >
        <div class="flex flex-col items-center text-center">
          <!-- Ícono -->
          <div
            class="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v4m0 4h.01M9.172 16.828A4 4 0 015 13V7a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4H9.172z"
              />
            </svg>
          </div>

          <!-- Texto -->
          <h3 class="text-lg font-semibold text-[#002D5B] mb-2">{{ title }}</h3>
          <p class="text-slate-600 text-sm mb-6 max-w-sm">
            {{ message }}
          </p>

          <!-- Botones -->
          <div class="flex gap-4">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-[1.03] transition-all duration-200 font-medium"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: '¿Estás seguro?' },
  message: { type: String, default: 'Esta acción no se puede deshacer.' },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@keyframes slide-up {
  0% {
    transform: translateY(25px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slide-up 0.35s ease-out;
}
</style>
