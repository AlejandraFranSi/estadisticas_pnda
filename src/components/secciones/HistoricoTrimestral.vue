<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'
import BarrasReutilizables from '../graficas/BarrasReutilizables.vue'
const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const dataInteracciones = ref(null)
const dataRecursos = ref(null)

const dataStore = useDataStore()
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const requestInteracciones = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const responseInteracciones = await requestInteracciones.json()
    dataInteracciones.value = JSON.parse(responseInteracciones.interacciones)

    const requestRecursos = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/bases_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const responseRecursos = await requestRecursos.json()
    dataRecursos.value = JSON.parse(responseRecursos.recursos)
    console.log(dataRecursos.value)
    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
}

watch([fechaInicio, fechaFinal], async () => {
  await solicitarDatos()
})

onMounted(async () => {
  await solicitarDatos()
})
</script>
<template>
  <div>
    <h4>Histórico trimestral</h4>
    <div v-if="isLoading">...Está cargando</div>
    <div v-if="!isLoading && wasFetchigSuccesful === false">
      No se pudo recuperar la información
    </div>
    <div v-if="!isLoading && wasFetchigSuccesful">
      <BarrasReutilizables
        :data="dataInteracciones"
        :titulo="'Interacciones con instituciones'"
        :x-axis-title="'Trimestre'"
        :-y-axis-title="'No. Interacciones'"
        :x-var-name="'trimestre'"
        :y-var-name="'interacciones'"
        :alto="200"
      />
      <BarrasReutilizables
        :data="dataRecursos"
        :titulo="'Recursos subidos'"
        :x-axis-title="'Trimestre'"
        :-y-axis-title="'No. Recursos'"
        :x-var-name="'trimestre'"
        :y-var-name="'recursos'"
        :alto="200"
      />
    </div>
  </div>
</template>
