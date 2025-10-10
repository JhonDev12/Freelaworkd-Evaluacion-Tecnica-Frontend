<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between transition hover:shadow-md"
  >
    <div>
      <h3 class="text-sm font-semibold text-slate-500 mb-1">{{ titulo }}</h3>
      <p class="text-3xl font-bold text-slate-800">{{ valor }}</p>
    </div>
    <div
      class="h-1 mt-3 rounded-full bg-gradient-to-r"
      :class="color"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  titulo: String,
  valor: {
    type: [String, Number],
    default: 0
  },
  color: {
    type: String,
    default: 'from-blue-400 to-blue-600'
  }
})
</script>
