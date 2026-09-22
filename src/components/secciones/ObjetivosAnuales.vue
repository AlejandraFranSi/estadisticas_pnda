<script setup>
import GraficoDona from '../graficas/GraficoDona.vue'
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
    <div v-if="estaCargando">...Cargando</div>
    <div v-if="!estaCargando && error !== null">Ocurrió un error {{ error }}</div>
    <div v-if="!estaCargando && totalRecursos" class="flex">
      <GraficoDona
        class="columna-7"
        :titulo="'Bases de datos publicadas'"
        :estatus="totalRecursos"
        :objetivo="objetivoRecursos"
        :ancho="170"
        :etiqueta="'recursos'"
      />
      <GraficoDona
        class="columna-7"
        :titulo="'Instituciones con publicaciones'"
        :estatus="totalInstituciones"
        :objetivo="objetivoInstituciones"
        :ancho="170"
        :etiqueta="'instituciones'"
      />
    </div>
  </div>
</template>
<style scoped></style>
