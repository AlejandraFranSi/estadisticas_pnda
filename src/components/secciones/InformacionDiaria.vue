<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'
import AreasApiladas from '../graficas/AreasApiladas.vue'
import IconoError from '../icons/IconoError.vue'

const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const dataStore = useDataStore()
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)
const datosRecursos = ref(null)
const categoriasRecursos = ref(null)
const maximoRecursos = ref(null)
const datosInteracciones = ref(null)
const categoriasInteracciones = ref(null)
const maximoInteracciones = ref(null)

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const requestRecursos = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/categorias_bases_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const responseRecursos = await requestRecursos.json()
    datosRecursos.value = JSON.parse(responseRecursos.data)
    categoriasRecursos.value = [...responseRecursos.top_categorias, 'Otra']
    maximoRecursos.value = responseRecursos.maximo

    const requestInteracciones = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/motivo_interacciones_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const responseInteracciones = await requestInteracciones.json()
    datosInteracciones.value = JSON.parse(responseInteracciones.data)
    categoriasInteracciones.value = [...responseInteracciones.tipo_interacciones]
    maximoInteracciones.value = responseInteracciones.maximo

    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
}
onMounted(async () => {
  await solicitarDatos()
})
watch([fechaInicio, fechaFinal], async () => {
  await solicitarDatos()
})
</script>
<template>
  <div>
    <h4>Información diaria</h4>
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
    <div v-if="wasFetchigSuccesful && !isLoading">
      <AreasApiladas
        :etiqueta="'recursos'"
        :titulo="'Información diaria de recursos'"
        :data="datosRecursos"
        :categorias="categoriasRecursos"
        :x-var="'fecha'"
        :y-max="maximoRecursos"
        :leyenda-x="'Fecha'"
        :leyenda-y="'Bases subidas'"
      />
      <AreasApiladas
        :etiqueta="'interacciones'"
        :titulo="'Información diaria de interacciones'"
        :data="datosInteracciones"
        :categorias="categoriasInteracciones"
        :x-var="'fecha_evento'"
        :y-max="maximoInteracciones"
        :leyenda-x="'Fecha'"
        :leyenda-y="'Interacciones tenidas'"
      />
    </div>
  </div>
</template>
<style scoped></style>
