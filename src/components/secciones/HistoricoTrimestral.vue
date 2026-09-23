<script setup>
import BarrasReutilizables from '../graficas/BarrasReutilizables.vue'
import IconoError from '../icons/IconoError.vue'
import { ref, onMounted } from 'vue'
//import { useDataStore } from '@/stores/data.js'
const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const dataInteracciones = ref(null)
const dataRecursos = ref(null)

// const dataStore = useDataStore()
//const fechaInicio = computed(() => dataStore.fechaInicio)
//const fechaFinal = computed(() => dataStore.fechaFinal)

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    // `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`
    const requestInteracciones = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/correos_trimestrales`,
    )
    const responseInteracciones = await requestInteracciones.json()
    dataInteracciones.value = JSON.parse(responseInteracciones.interacciones)

    const requestRecursos = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/bases_trimestrales`,
    )
    const responseRecursos = await requestRecursos.json()
    dataRecursos.value = JSON.parse(responseRecursos.recursos)
    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
}

/*watch([fechaInicio, fechaFinal], async () => {
  await solicitarDatos()
})*/

onMounted(async () => {
  await solicitarDatos()
})
</script>
<template>
  <div>
    <h4>Histórico trimestral</h4>
    <div class="flex flex-contenido-centrado" id="spinner-01">
      <div v-if="isLoading" id="spinner flex-vertical-centrado">
        <img src="/loading.gif" />
        <p>Solictando datos</p>
      </div>
      <div
        v-if="wasFetchigSuccesful === false && !isLoading"
        id="error-01"
        class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
      >
        <IconoError />
        Ocurrió un error
      </div>
    </div>
    <div v-if="!isLoading && wasFetchigSuccesful" class="flex">
      <BarrasReutilizables
        class="columna-8"
        :data="dataInteracciones"
        :titulo="'Interacciones con instituciones'"
        :x-axis-title="'Trimestre'"
        :y-axis-title="'No. Interacciones'"
        :x-var-name="'trimestre'"
        :y-var-name="'interacciones'"
        :alto="300"
      />
      <BarrasReutilizables
        class="columna-8"
        :data="dataRecursos"
        :titulo="'Recursos subidos'"
        :x-axis-title="'Trimestre'"
        :y-axis-title="'No. Recursos'"
        :x-var-name="'trimestre'"
        :y-var-name="'recursos'"
        :alto="300"
      />
    </div>
  </div>
</template>
