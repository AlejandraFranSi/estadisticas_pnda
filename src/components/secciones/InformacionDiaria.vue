<script setup>
import * as d3 from 'd3'
import { ref, onMounted, computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'
import AreasApiladas from '../graficas/AreasApiladas.vue'
import TarjetaNumeralia from '../TarjetaNumeralia.vue'
import IconoError from '../icons/IconoError.vue'

const dataStore = useDataStore()
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)
const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const datosRecursos = ref(null)
const categoriasRecursos = ref(null)
const maximoRecursos = ref(null)
const promedioRecursos = ref(null)
const varianzaRecursos = ref(null)
const desviacionRecursos = ref(null)
const datosInteracciones = ref(null)
const categoriasInteracciones = ref(null)
const maximoInteracciones = ref(null)
const promedioInteracciones = ref(null)
const varianzaInteracciones = ref(null)
const desviacionInteracciones = ref(null)

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
    promedioRecursos.value = d3.format('.2f')(responseRecursos.promedio)
    desviacionRecursos.value = d3.format('.2f')(responseRecursos.desviacion)
    varianzaRecursos.value = d3.format('.2f')(responseRecursos.varianza)

    const requestInteracciones = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/motivo_interacciones_trimestrales?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const responseInteracciones = await requestInteracciones.json()
    datosInteracciones.value = JSON.parse(responseInteracciones.data)
    categoriasInteracciones.value = [...responseInteracciones.tipo_interacciones]
    maximoInteracciones.value = responseInteracciones.maximo
    promedioInteracciones.value = d3.format('.2f')(responseInteracciones.promedio)
    desviacionInteracciones.value = d3.format('.2f')(responseInteracciones.desviacion)
    varianzaInteracciones.value = d3.format('.2f')(responseInteracciones.varianza)

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
    <div v-if="wasFetchigSuccesful && !isLoading" id="contenedor-graficas-diarias">
      <div class="flex">
        <div class="contenedor-numeralias columna-3">
          <TarjetaNumeralia :titulo="'Promedio Diario'" :valor="promedioRecursos" />
          <TarjetaNumeralia :titulo="'Varianza'" :valor="varianzaRecursos" />
          <TarjetaNumeralia :titulo="'Desviación Estándar'" :valor="desviacionRecursos" />
        </div>
        <div class="areas-apiladas columna-13">
          <AreasApiladas
            :etiqueta="'recursos'"
            :titulo="'Recursos subidos por día'"
            :data="datosRecursos"
            :categorias="categoriasRecursos"
            :x-var="'fecha'"
            :y-max="maximoRecursos"
            :leyenda-x="'Fecha'"
            :leyenda-y="'Bases subidas'"
          />
        </div>
      </div>
      <div class="flex">
        <div class="areas-apiladas columna-13">
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
        <div class="contenedor-numeralias columna-3">
          <TarjetaNumeralia :titulo="'Promedio Diario'" :valor="promedioInteracciones" />
          <TarjetaNumeralia :titulo="'Varianza'" :valor="varianzaInteracciones" />
          <TarjetaNumeralia :titulo="'Desviación Estándar'" :valor="desviacionInteracciones" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@media (max-width: 900px) {
  .areas-apiladas {
    max-width: 100%!;
  }
  .contenedor-numeralias {
    max-width: 100%;
    display: flex;
  }
}
</style>
