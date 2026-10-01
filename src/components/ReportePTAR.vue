<script setup>
import IconoError from './icons/IconoError.vue'
import IconoExpandir from './icons/IconoExpandir.vue'
import IconoContraer from './icons/IconoContraer.vue'
import { onMounted, ref } from 'vue'

const isLoading = ref(null)
const wasFetchigSuccesful = ref(null)
const conjuntos_x_institucion = ref(null)
const data = ref()
const columnasConjuntos = ['nombre_institucion', 'conjuntos_totales', 'conjunto_plan']
const dictColumnasConjuntos = {
  nombre_institucion: 'Instituciones',
  conjuntos_totales: 'Conjuntos Publicados',
  conjunto_plan: 'Conjuntos en Plan',
}

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const request_ptar = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/data_ptar?anio_param=2026`,
    )
    const response_ptar = await request_ptar.json()
    conjuntos_x_institucion.value = JSON.parse(response_ptar.conjuntos_por_institucion)
    const datum = {}
    conjuntos_x_institucion.value.forEach((d) => {
      if (!Object.keys(datum).includes(d.sector)) {
        datum[d.sector] = {
          nombre_institucion: 1,
          creados: Number(d.creados) ? Number(d.creados) : 0,
          actualizados: Number(d.actualizados) ? Number(d.actualizados) : 0,
          conjuntos_totales: Number(d.conjuntos_totales) ? Number(d.conjuntos_totales) : 0,
          conjunto_plan: Number(d.conjunto_plan) ? Number(d.conjunto_plan) : 0,
          tabla: [d],
          show: false,
        }
      } else {
        datum[d.sector]['nombre_institucion'] += 1
        datum[d.sector]['creados'] += Number(d.creados)
        datum[d.sector]['actualizados'] += Number(d.actualizados)
        datum[d.sector]['conjuntos_totales'] += Number(d.conjuntos_totales)
        datum[d.sector]['conjunto_plan'] = Number(d.conjunto_plan)
          ? datum[d.sector]['conjunto_plan'] + Number(d.conjunto_plan)
          : datum[d.sector]['conjunto_plan']
        datum[d.sector]['tabla'] = [...datum[d.sector]['tabla'], d]
      }
    })
    data.value = datum
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
</script>
<template>
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
  <div class="p-x-3" v-if="wasFetchigSuccesful && !isLoading">
    <h4>Sectores de los que se publicaron bases</h4>
    <div v-for="sector in Object.keys(data)" :key="`desplegable-${sector}`" class="m-y-2">
      <div class="flex flex-contenido-separado contenedor-sector">
        <h6 class="m-x-2">{{ sector }}</h6>
        <button v-if="!data[sector]['show']" @click="data[sector]['show'] = true">
          <IconoExpandir />
        </button>
        <button v-if="data[sector]['show']" @click="data[sector]['show'] = false">
          <IconoContraer />
        </button>
      </div>

      <table class="tabla-sectores" id="tabla-sectores">
        <thead class="header-tabla">
          <tr>
            <th v-for="columna of columnasConjuntos" :key="columna">
              {{ dictColumnasConjuntos[columna] }}:
              <span class="numeralia">{{ data[sector][columna] }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="data[sector]['show']">
          <tr v-for="fila of data[sector]['tabla']" :key="data[sector]['tabla'].indexOf(fila)">
            <td v-for="columna in columnasConjuntos" :key="`td-${fila.sector}-${columna}`">
              <div>{{ fila[columna] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.contenedor-sector {
  background-color: var(--color-secundario-7);
  color: white;
}
table {
  min-width: 100%;
}
thead {
  background-color: var(--color-secundario-1);
  /*color: var(--color-neutro-0);*/
}

h6 {
  font-weight: bold;
}
.numeralia {
  padding: 4px;
  border-radius: 16px;
  background-color: var(--color-primario-4);
  color: var(--color-neutro-1);
  font-size: larger;
}
button {
  color: white;
  background-color: var(--color-secundario-7);
  border: none;
}
</style>
