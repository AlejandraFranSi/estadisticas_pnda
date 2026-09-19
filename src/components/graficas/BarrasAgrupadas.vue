<script setup>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'

const datum = ref(null)

onMounted(async () => {
  const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/correos_intitucionales`)
  if (request.status === 200) {
    const response = await request.json()
    const data = JSON.parse(response.data_agrupada)
    const categorias = Array.from(new Set(data.map((d) => d.objetivo_interaccion)))
    const fechas = Array.from(new Set(data.map((d) => d.mes_anio)))
    for (let categoria of categorias) {
      for (let fecha of fechas) {
        const opcion = data.find(
          (d) => d.mes_anio === fecha && d.objetivo_interaccion === categoria,
        )
        if (!opcion) {
          data.push({ objetivo_interaccion: categoria, interacciones: 0, mes_anio: fecha })
        }
      }
    }
    console.log('La data:', data)
    datum.value = d3.stack().keys(categorias)(data)

    console.log(datum.value)
  }
})
</script>
<template>
  <div>Las barras agrupadas</div>
</template>
