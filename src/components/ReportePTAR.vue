<script setup>
import * as d3 from 'd3'

import IconoError from './icons/IconoError.vue'
import IconoExpandir from './icons/IconoExpandir.vue'
import IconoContraer from './icons/IconoContraer.vue'
import IconoCarga from './icons/IconoCarga.vue'
import { onMounted, ref } from 'vue'

const isLoading = ref(null)
const wasFetchigSuccesful = ref(null)
const conjuntos_x_institucion = ref(null)
const data = ref()
const listaSectores = ref([])
const numeralias = ref({
  Instituciones: 0,
  'Conjuntos en plan': 0,
  'Conjuntos publicados': 0,
  'Recursos en plan': 0,
  'Recursos publicados': 0,
})
const columnasConjuntos = [
  'nombre_institucion',
  'conjuntos_plan',
  'conjuntos_subidos',
  'conjuntos_actualizados',
  'recursos_plan',
  'recursos_subidos',
  'recursos_actualizados',
]
const dictColumnasConjuntos = {
  nombre_institucion: 'Institución',
  conjuntos_plan: 'Conjuntos en plan',
  conjuntos_subidos: 'Conjuntos creados',
  conjuntos_actualizados: 'Conjuntos actualizados',
  recursos_plan: 'Recursos en plan',
  recursos_subidos: 'Recursos creados',
  recursos_actualizados: 'Recursos actualizados',
}

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const request_ptar = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/data_ptar?anio_param=2026`,
    )
    const response_ptar = await request_ptar.json()
    numeralias.value['Instituciones'] = response_ptar.instituciones
    numeralias.value['Conjuntos en plan'] = response_ptar.conjuntos_plan
    numeralias.value['Conjuntos publicados'] = response_ptar.total_conjuntos
    numeralias.value['Recursos en plan'] = response_ptar.recursos_plan
    numeralias.value['Recursos publicados'] = response_ptar.total_recursos

    conjuntos_x_institucion.value = JSON.parse(response_ptar.resultados)
    const datum = {}
    conjuntos_x_institucion.value.forEach((d) => {
      const nombre = `${d.clave_sector}-${d.sector}`

      if (!Object.keys(datum).includes(nombre)) {
        datum[nombre] = {
          clave_sector: d.clave_sector,
          nombre_institucion: 1,
          conjuntos_plan: Number(d.conjuntos_plan) ? Number(d.conjuntos_plan) : 0,
          conjuntos_subidos: Number(d.conjuntos_subidos) ? Number(d.conjuntos_subidos) : 0,
          conjuntos_actualizados: Number(d.conjuntos_actualizados)
            ? Number(d.conjuntos_actualizados)
            : 0,
          recursos_plan: Number(d.recursos_plan) ? Number(d.recursos_plan) : 0,
          recursos_subidos: Number(d.recursos_subidos) ? Number(d.recursos_subidos) : 0,
          recursos_actualizados: Number(d.recursos_actualizados)
            ? Number(d.recursos_actualizados)
            : 0,
          tabla: [d],
          show: false,
        }
      } else {
        datum[nombre]['nombre_institucion'] += 1
        datum[nombre]['conjuntos_plan'] = Number(d.conjuntos_plan)
          ? datum[nombre]['conjuntos_plan'] + Number(d.conjuntos_plan)
          : datum[nombre]['conjuntos_plan']
        datum[nombre]['conjuntos_subidos'] = Number(d.conjuntos_subidos)
          ? datum[nombre]['conjuntos_subidos'] + Number(d.conjuntos_subidos)
          : datum[nombre]['conjuntos_subidos']
        datum[nombre]['conjuntos_actualizados'] = Number(d.conjuntos_actualizados)
          ? datum[nombre]['conjuntos_actualizados'] + Number(d.conjuntos_actualizados)
          : datum[nombre]['conjuntos_actualizados']
        datum[nombre]['recursos_plan'] = Number(d.recursos_plan)
          ? datum[nombre]['recursos_plan'] + Number(d.recursos_plan)
          : datum[nombre]['recursos_plan']
        datum[nombre]['recursos_subidos'] = Number(d.recursos_subidos)
          ? datum[nombre]['recursos_subidos'] + Number(d.recursos_subidos)
          : datum[nombre]['recursos_subidos']
        datum[nombre]['recursos_actualizados'] = Number(d.recursos_actualizados)
          ? datum[nombre]['recursos_actualizados'] + Number(d.recursos_actualizados)
          : datum[nombre]['recursos_actualizados']
        datum[nombre]['tabla'] = [...datum[nombre]['tabla'], d].sort((a, b) =>
          a['nombre_institucion'].localeCompare(b['nombre_institucion']),
        )
      }
    })
    listaSectores.value = Object.keys(datum).sort((a, b) => a.localeCompare(b))
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
    <div v-if="isLoading" id="spinner flex-vertical-centrado" class="m-y-8">
      <IconoCarga />
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
    <h1>Plataforma Nacional de Datos Abiertos</h1>
    <h2>Estadísticas</h2>
    <h3>Publicación de datos por sector</h3>

    <div class="m-y-5 contenedor-numeralias flex flex-contenido-centrado">
      <div v-for="opcion of Object.keys(numeralias)" :key="opcion" class="tarjeta columna-3">
        <div class="tarjeta-cuerpo p-y-0">
          <div class="numeralia m-y-0 p-y-0">{{ d3.format(',')(numeralias[opcion]) }}</div>
          <div class="etiqueta-numeralia m-y-0 p-y-0">{{ opcion }}</div>
        </div>
      </div>
    </div>

    <div v-for="sector of listaSectores" :key="`desplegable-${sector}`" class="m-y-4 m-x-3">
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
              <span class="total-tabla">{{ data[sector][columna] }}</span>
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
h1,
h2,
h3 {
  color: var(--color-encabezados);
}
.tarjeta {
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.25) !important;
}
.numeralia {
  font-size: 55px;
  font-weight: 700;
  text-align: center;
  color: var(--color-encabezados);
}

.etiqueta-numeralia {
  border-radius: 8px;
  padding: 8px;
  background-color: var(--color-secundario-11);
  color: white;
  font-weight: 500;
  font-size: 16px;
  text-align: center;
}
.contenedor-sector {
  background-color: var(--color-secundario-11);
  color: white;
}

h6 {
  font-weight: bold;
  font-family: Patria, 'noso Sans', Helvetica, Arial, sans-serif;
  font-size: larger;
}

button {
  color: white;
  background-color: var(--color-secundario-11);
  border: none;
}

table {
  min-width: 100%;
  border: 1px solid var(--color-neutro-4);
  border-radius: 8px;
  color: var(--color-encabezados);
}
thead {
  background-color: var(--color-neutro-1);
}

td {
  background-color: var(--color-neutro-1);
  border-bottom: 1px solid var(--color-neutro-2);
}

.total-tabla {
  padding: 4px;
  border-radius: 8px;
  /*border: 2px solid var(--color-secundario-7);
  color: var(--color-secundario-7) !important;*/
  background-color: var(--color-secundario-7);
  color: white;
  text-align: center;
  margin-left: 4px;
}
</style>
