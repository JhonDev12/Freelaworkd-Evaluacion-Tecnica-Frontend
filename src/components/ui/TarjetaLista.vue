<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition hover:shadow-md">
    <h2 class="font-semibold text-lg mb-4 text-slate-800">{{ titulo }}</h2>

    <ul v-if="elementos && elementos.length > 0" class="divide-y divide-slate-200">
      <li
        v-for="item in elementos"
        :key="item.id"
        class="py-3 flex justify-between items-start"
      >
        <div class="flex-1">
          <p class="font-medium text-sm text-slate-800">
            {{ obtenerTitulo(item) }}
          </p>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">
            {{ item.descripcion }}
          </p>
          <p v-if="tipo === 'propuesta'" class="text-xs text-slate-400 mt-2">
            Presupuesto: <span class="font-medium">{{ formatearMoneda(item.presupuesto) }}</span> •
            Tiempo estimado: <span class="font-medium">{{ item.tiempo_estimado }} días</span>
          </p>
          <p v-else class="text-xs text-slate-400 mt-2">
            Presupuesto: <span class="font-medium">{{ formatearMoneda(item.presupuesto) }}</span> •
            Estado: <span class="font-medium capitalize">{{ item.estado }}</span>
          </p>
        </div>
        <span class="text-xs text-slate-400 whitespace-nowrap ml-4">
          {{ formatearFecha(item.created_at) }}
        </span>
      </li>
    </ul>

    <p v-else class="text-sm text-slate-500">No hay elementos disponibles.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  titulo: String,
  elementos: Array,
  tipo: String
})

const formatearFecha = (s) =>
  s ? new Date(s).toLocaleString() : ''

const formatearMoneda = (v) =>
  v == null ? '-' : Number(v).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

const obtenerTitulo = (item) => {
  if (props.tipo === 'propuesta') {
    if (item.proyecto?.titulo) return item.proyecto.titulo
    if (item.proyecto_titulo) return item.proyecto_titulo
    return `Proyecto #${item.proyecto_id ?? '?'}`
  }
  return item.titulo
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
