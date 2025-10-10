<template>
  <RouterView />
  <LoaderOverlay />
</template>

<script setup>
import LoaderOverlay from '@/components/ui/LoaderOverlay.vue'
</script>

<style>
/* Limpieza total de los estilos por defecto */
#app {
  all: unset;
}
</style>
