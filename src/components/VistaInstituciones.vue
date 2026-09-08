<script setup>
//import * as d3 from 'd3'
//import * as dfd from 'danfojs'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'
import TarjetaNumeralia from './TarjetaNumeralia.vue'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const totalBases = computed(() => dataStore.totalRecursos)
const columnas = ref(null)
const fechas_sin_parsear = ref(null)
const fechas_parseadas = ref(null)

async function solicitarPlanes() {
  estaCargando.value = true
  const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/planes_apertura`)
  if (request.ok) {
    const respuesta = await request.json()
    fechas_sin_parsear.value = JSON.parse(respuesta.fechas_sin_parsear)
    fechas_parseadas.value = JSON.parse(respuesta.fechas_parseadas)
    columnas.value = Object.keys(fechas_sin_parsear.value[0])
    columnas.value = [
      'conjunto_datos',
      'fecha_publicacion',
      'fecha_alternativa',
      'fecha_formateada',
    ]
    console.log(columnas.value.sort((a, b) => a.localeCompare(b)))
  }
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
  <div class="contenedor-instituciones">
    <div>
      El objetivo de esta sección es evaluar el cumplimiento del plan que entregan las instituciones
      1. ¿Cuáles son las intituciones que más datos abiertos tienen publicados? 2. ¿Cumplen con el
      plan que envían? 3. ¿Incliuyen los metadatos? 4. ¿Envían su diccionario de datos? 5. ¿Envían
      sus metodologías?
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
    <div class="contenido" v-if="columnas">
      <div class="flex">
        <TarjetaNumeralia
          :titulo="'Total de registros con fecha rara'"
          :valor="String(fechas_sin_parsear.length)"
        />
        <TarjetaNumeralia
          :titulo="'Total de registros con fecha parseada'"
          :valor="String(fechas_parseadas.length)"
        />
      </div>

      <table>
        <thead class="header-tabla">
          <tr>
            <th v-for="columna in columnas" :key="columna">
              {{ columna }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in fechas_parseadas" :key="fila.index">
            <td v-for="columna in columnas" :key="`td-${fila.index}-${columna}`">
              {{ fila[columna] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.contenedor-instituciones {
  margin: 10px;
  overflow: auto;
}
.contenido {
  width: 80%;
  height: 70vh;
}
</style>
