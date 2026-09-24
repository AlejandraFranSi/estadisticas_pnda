<script setup>
import GraficoDona from '../graficas/GraficoDona.vue'
import IconoError from '../icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const recursos = computed(() => dataStore.dataRecursos)
const objetivoRecursos = ref(10000)
const objetivoInstituciones = ref(200)
const totalRecursos = computed(() => parseInt(dataStore.totalRecursos.replace(',', '')))
const totalInstituciones = ref(null)

onMounted(async () => {
  estaCargando.value = true
  if (totalRecursos.value == 0) {
    await dataStore.armarData()
  }
  const instituciones = Array.from(new Set(recursos.value.map((d) => d.nombre_institucion)))
  totalInstituciones.value = instituciones.length
  estaCargando.value = false
})
</script>
<template>
  <div>
    <h4>Objetivos anuales</h4>
    <div class="flex flex-contenido-centrado" id="spinner-01">
      <div v-if="estaCargando" id="spinner flex-vertical-centrado">
        <img src="/loading.gif" />
        <p>Solictando datos</p>
      </div>
      <div
        v-if="!estaCargando && error"
        id="error-01"
        class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
      >
        <IconoError />
        {error}
      </div>
    </div>
    <div v-if="!estaCargando && totalRecursos" class="flex" id="contenedor-objetivos-anuales">
      <GraficoDona
        class="columna-4"
        :titulo="'Bases de datos publicadas'"
        :estatus="totalRecursos"
        :objetivo="objetivoRecursos"
        :ancho="170"
        :etiqueta="'recursos'"
      />
      <GraficoDona
        class="columna-3"
        :titulo="'Instituciones con publicaciones'"
        :estatus="totalInstituciones"
        :objetivo="objetivoInstituciones"
        :ancho="170"
        :etiqueta="'instituciones'"
      />
      <GraficoDona
        class="columna-3"
        :titulo="'Datálogo: Segunda versión de bases'"
        :estatus="40"
        :objetivo="100"
        :ancho="170"
        :etiqueta="'bases_datalogo'"
      />
      <GraficoDona
        class="columna-3"
        :titulo="'Estrategia Nacional de Datos Abiertos'"
        :estatus="60"
        :objetivo="100"
        :ancho="170"
        :etiqueta="'estrategia'"
      />
      <GraficoDona
        class="columna-3"
        :titulo="'Manual Operativo'"
        :estatus="90"
        :objetivo="100"
        :ancho="170"
        :etiqueta="'manual'"
      />
    </div>
  </div>
</template>
<style scoped></style>
