<!-- LoaderLogo.vue -->
<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div class="relative animate-float will-change-transform">
        <!-- Ícono PNG centrado y girando -->
        <img
          :src="logoUrl"
          alt="Freelaworkd"
          class="w-28 h-28 select-none pointer-events-none animate-spin-smooth origin-center"
          draggable="false"
        />
        <!-- Halo de brillo cian (opcional) -->
        <span
          class="pointer-events-none absolute inset-0 rounded-full animate-glow"
          aria-hidden="true"
        ></span>
      </div>

      <p class="mt-6 text-sm font-medium text-[#0B2A45] tracking-wide">
        Cargando Freelaworkd...
      </p>
    </div>
  </transition>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '@/stores/loaderStore'
import logoUrl from '@/assets/imagenes/logo.png'

const { visible } = storeToRefs(useLoaderStore())
</script>

<style scoped>
/* Fade entrada/salida */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

/* Giro continuo perfectamente centrado */
@keyframes spin-smooth {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-smooth {
  animation: spin-smooth 6s linear infinite;
  transform-origin: center center; 
}

/* Flotación vertical sutil */
@keyframes floatY {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-float {
  animation: floatY 3.6s ease-in-out infinite;
  will-change: transform;
}

/* Brillo cian pulsante */
@keyframes glowPulse {
  0%,100% { box-shadow: 0 0 0 rgba(0,173,239,0); }
  50% { box-shadow: 0 0 22px rgba(0,173,239,0.45); }
}
.animate-glow { animation: glowPulse 2.8s ease-in-out infinite; }

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .animate-spin-smooth, .animate-float, .animate-glow { animation: none !important; }
}
</style>
