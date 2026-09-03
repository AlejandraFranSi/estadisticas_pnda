<script setup>
import * as d3 from 'd3'
import * as dfd from 'danfojs'
import GraficoCalendario from './graficas/GraficoCalendario.vue'
import GraficoRidgeline from './graficas/GraficoRidgeline.vue'
import NubePalabras from './graficas/NubePalabras.vue'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const data = computed(() => dataStore.dataRecursos)
const totalBases = computed(() => dataStore.totalRecursos)
const totalCategorias = computed(() => dataStore.totalCategorias)
const totalEtiquetas = computed(() => dataStore.totalEtiquetas)

const armarBase = async function () {
  estaCargando.value = true
  await dataStore.armarData()
  console.log(dataStore.categorias)
  estaCargando.value = false
}

// Esto es para las categorias
const dataAgrupada = ref(null)
const maximoXcategoria = ref(null)
const timeDomain = [
  '03/2025',
  '04/2025',
  '05/2025',
  '06/2025',
  '07/2025',
  '08/2025',
  '09/2025',
  '10/2025',
  '11/2025',
  '12/2025',
  '01/2026',
  '02/2026',
  '03/2026',
  '04/2026',
  '05/2026',
  '06/2026',
  '07/2026',
  '08/2026',
  '09/2026',
]

const prepararData = function () {
  const datum = data.value.map((d) => {
    return {
      categoria: d.nombre_categoria,
      fecha: d3.timeFormat('%m/%Y')(new Date(d.creacion_recurso.slice(0, 23))),
      reps: 1,
    }
  })

  let df = new dfd.DataFrame(datum)
  df = df.groupby(['categoria', 'fecha']).sum()
  maximoXcategoria.value = df['reps_sum'].max()
  dataAgrupada.value = d3.groups(dfd.toJSON(df), (d) => d.categoria)
  dataAgrupada.value.forEach((d) => {
    let entradasOrdenadas = []
    for (let mes of timeDomain) {
      let prueba = d[1].find((d) => d.fecha === mes)
      if (!prueba) {
        entradasOrdenadas.push({ categoria: d[0], fecha: mes, reps_sum: 0 })
      } else {
        entradasOrdenadas.push(prueba)
      }
    }
    d[1] = entradasOrdenadas
  })

  dataAgrupada.value = dataAgrupada.value.sort((a, b) => a[0].localeCompare(b[0]))
}
onMounted(async () => {
  estaCargando.value = true
  await dataStore.armarData()
  prepararData()
  estaCargando.value = false
})
</script>

<template>
  <div class="contenedor-nosotros m-2" id="estadisticas-nosotros">
    <div class="flex flex-contenido-centrado" id="spinner-01">
      <div v-if="estaCargando" id="spinner flex-vertical-centrado">
        <img src="../../public/loading.gif" />
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

    <div v-if="!estaCargando && data.length > 0" id="contenedor-estadisticas">
      <h3>Numeralias generales:</h3>
      <div class="flex flex-contenido-centrado" id="numeralias-grales">
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Total de bases de datos:
          <button clasS="boton-primario boton-chico">{{ totalBases }}</button>
        </div>
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Categorías registradas:
          <button clasS="boton-primario boton-chico">
            {{ totalCategorias }}
          </button>
        </div>
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Etiquetas empleadas:
          <button clasS="boton-primario boton-chico">
            {{ totalEtiquetas }}
          </button>
        </div>
      </div>
      <h3>Frecuencia de publicación</h3>
      <GraficoCalendario :data="data" />

      <h3>Publicacion por categoría</h3>
      <div v-if="dataAgrupada">
        <GraficoRidgeline
          v-for="categoria in dataAgrupada"
          :titulo="categoria[0]"
          :data="categoria"
          :x-domain="timeDomain"
          :y-max="maximoXcategoria"
        />
      </div>

      <h3>Etiquetas más usadas</h3>
      <NubePalabras />
    </div>
  </div>
</template>
<style scoped>
ol,
li {
  margin: 4px;
}

.numerico {
  background-color: var(--color-secundario-3);
}
</style>
