<script setup>
import * as d3 from 'd3'
import { ref, onMounted, computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'

const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const data = ref(null)
const trimestres = ref(null)
const maximo = ref(null)

const dataStore = useDataStore()
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)

watch(fechaFinal, async (nv) => {
  console.log('La nueva fecha final: ', nv)
  const request = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
  )
})
watch(fechaInicio, async () => {
  const request = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
  )
  console.log('La nueva fecha inicial: ', dataStore.fechaInicio)
})

onMounted(async () => {
  try {
    const request = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const response = await request.json()
    data.value = JSON.parse(response.interacciones)
    trimestres.value = data.value.map((d) => d.trimestre)
    maximo.value = d3.max(data.value.map((d) => d.interacciones))
    wasFetchigSuccesful.value = true
    isLoading.value = false
  } catch (error) {
    console.log(error)
  }
})
</script>
<template>
  <div class="p-3">
    <h4>Histórico trimestral</h4>
    <div v-if="isLoading">...Está cargando</div>
    <div v-if="!isLoading && !wasFetchigSuccesful">No se pudo recuperar la información</div>
    <div v-if="!isLoading && wasFetchigSuccesful">Aqui va un fráfico de barras</div>
  </div>
</template>
