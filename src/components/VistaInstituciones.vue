<script setup>
import * as d3 from 'd3'
import * as dfd from 'danfojs'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const totalBases = computed(() => dataStore.totalRecursos)

async function solicitarPlanes() {
  estaCargando.value = true
  const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/planes_apertura`)
  console.log(request)
  estaCargando.value = false
}
onMounted(async () => {
  if (totalBases.value == 0) {
    estaCargando.value = true
    await dataStore.armarData()
    estaCargando.value = false
  }
  solicitarPlanes()
})
</script>

<template>
  <div>
    El objetivo de esta sección es evaluar el cumplimiento del plan que entregan las instituciones
    1. ¿Cuáles son las intituciones que más datos abiertos tienen publicados? 2. ¿Cumplen con el
    plan que envían? 3. ¿Incliuyen los metadatos? 4. ¿Envían su diccionario de datos? 5. ¿Envían sus
    metodologías?
  </div>
  <div class="flex flex-contenido-centrado" id="spinner-01">
    <div v-if="estaCargando" id="spinner flex-vertical-centrado">
      <img src="/loading.gif" />
      <p>Solictando datos</p>
    </div>
    <div
      v-if="error"
      id="error-01"
      class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
    >
      <IconoError />
      Ocurrió un error
    </div>
  </div>
</template>
