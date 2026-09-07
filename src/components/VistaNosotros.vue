<script setup>
import * as d3 from 'd3'
import * as dfd from 'danfojs'
import TarjetaNumeralia from './TarjetaNumeralia.vue'
import GraficoCalendario from './graficas/GraficoCalendario.vue'
import GraficoBarras from './graficas/GraficoBarras.vue'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const recursos = computed(() => dataStore.dataRecursos)
const totalConjuntos = computed(() => dataStore.totalConjuntos)
const totalBases = computed(() => dataStore.totalRecursos)
const totalCategorias = computed(() => dataStore.totalCategorias)
const totalEtiquetas = computed(() => dataStore.totalEtiquetas)

const promedio = ref(null)
const varianza = ref(null)
const desviacion = ref(null)
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

const agruparXCategoria = function () {
  const datum = recursos.value.map((d) => {
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

async function calcularPromedio() {
  const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/promedio_semanal`)
  if (request.ok) {
    const respuesta = await request.json()
    promedio.value = String(respuesta.promedio)
    varianza.value = String(respuesta.varianza)
    desviacion.value = String(respuesta.desviacion)
  }
}
onMounted(async () => {
  estaCargando.value = true

  if (totalBases.value == 0) {
    await dataStore.armarData()
  }
  agruparXCategoria()
  await calcularPromedio()
  estaCargando.value = false
})
</script>

<template>
  <div class="contenedor-nosotros m-2" id="estadisticas-nosotros">
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

    <div v-if="!estaCargando && recursos.length > 0" id="contenedor-estadisticas">
      <h3>Numeralias generales:</h3>
      <div class="flex flex-contenido-centrado" id="numeralias-grales">
        <TarjetaNumeralia :titulo="'Conjuntos de Datos'" :valor="totalConjuntos" />
        <TarjetaNumeralia :titulo="'Bases de Datos'" :valor="totalBases" />
        <TarjetaNumeralia :titulo="'Categorías Registradas'" :valor="totalCategorias" />
        <TarjetaNumeralia :titulo="'Etiquetas Empleadas'" :valor="totalEtiquetas" />
      </div>
      <h3>Frecuencia de publicación</h3>
      <GraficoCalendario :data="recursos" />
      <div class="flex flex-contenido-centrado" id="numeralias-grales">
        <TarjetaNumeralia :titulo="'Promedio Semanal de Recursos Subidos'" :valor="promedio" />
        <TarjetaNumeralia :titulo="'Varianza'" :valor="varianza" />
        <TarjetaNumeralia :titulo="'Desviación Estándar'" :valor="desviacion" />
      </div>

      <h3>Publicacion por categoría</h3>
      <div v-if="dataAgrupada && promedio">
        <GraficoBarras
          v-for="categoria in dataAgrupada"
          :key="categoria[0]"
          :titulo="categoria[0]"
          :data="categoria"
          :x-domain="timeDomain"
          :y-max="maximoXcategoria"
        />
      </div>

      <!--<h3>Etiquetas más usadas</h3>
       <NubePalabras /> -->
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
