<script setup>
//import * as d3 from 'd3'
//import * as dfd from 'danfojs'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'
import TarjetaNumeralia from './TarjetaNumeralia.vue'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const recursos = computed(() => dataStore.dataRecursos)
const totalBases = computed(() => dataStore.totalRecursos)
const columnas = ref(null)
const fechasSinParsear = ref([])
const fechasParseadas = ref([])
const instituciones = ref(null)
const totalesInstitucionales = ref(null)
const columnasInstituciones = ref(null)
const institucionSeleccionada = ref(null)
const recursosInstitucionales = ref(null)
const cargandoInstituciones = ref(false)
const fetchingFailed = ref(null)

const obtenerInstituciones = async function () {
  if (recursos.value.length > 0) {
    const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recursos_x_institucion`)
    if (request.ok) {
      const res = await request.json()
      totalesInstitucionales.value = JSON.parse(res.datum)
      columnasInstituciones.value = Object.keys(totalesInstitucionales.value[0])
      instituciones.value = totalesInstitucionales.value
        .map((d) => d.institucion)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      console.log('La respuesta de instituciones:', totalesInstitucionales.value)
    } else {
      console.log('Falló la petición de instituciones:', request.error)
    }
  }
}

async function solicitarPlanes(inst) {
  const request = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/planes_apertura/?institucion=${inst}`,
  )
  if (request.ok) {
    fetchingFailed.value = false
    const respuesta = await request.json()
    fechasSinParsear.value = JSON.parse(respuesta.fechas_sin_parsear)
    fechasParseadas.value = JSON.parse(respuesta.fechas_parseadas)
    //columnas.value = Object.keys(fechasSinParsear.value[0])
    columnas.value = [
      'conjunto_datos',
      'fecha_publicacion',
      //'fecha_alternativa',
      'fecha_formateada',
    ]
    //console.log(columnas.value.sort((a, b) => a.localeCompare(b)))
    console.log('Las fechas parseadas:', fechasParseadas.value)
    console.log('Las fechas sin parsear:', fechasSinParsear.value)
  } else {
    console.error(request)
    fetchingFailed.value = true
  }
}
onMounted(async () => {
  estaCargando.value = true
  if (totalBases.value == 0) {
    await dataStore.armarData()
  }
  await obtenerInstituciones()
  estaCargando.value = false
})

watch(institucionSeleccionada, async (nv) => {
  cargandoInstituciones.value = true
  recursosInstitucionales.value = recursos.value.filter((d) => d.nombre_institucion === nv)
  await solicitarPlanes(nv)
  console.log(recursosInstitucionales.value.length)
  cargandoInstituciones.value = false
})
</script>

<template>
  <div class="contenedor-instituciones">
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
    <div class="tabla-totales-institucionales" v-if="!estaCargando">
      <h4>El número de bases de datos publicadas por institución es:</h4>
      <table class="tabla-instituciones">
        <thead class="header-tabla">
          <tr>
            <th v-for="columna in columnasInstituciones" :key="columna">
              {{ columna }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in totalesInstitucionales" :key="fila.nombre_institucion">
            <td
              v-for="columna in columnasInstituciones"
              :key="`td-${fila.nombre_institucion}-${columna}`"
            >
              <div v-if="columna === 'nombre_institucion'" class="boton-radio">
                <input
                  type="radio"
                  :id="fila[columna]"
                  name="lista_instituciones"
                  :value="fila[columna]"
                  v-model="institucionSeleccionada"
                />
                <label :for="fila[columna]">{{ fila[columna] }}</label>
              </div>
              <div v-else>{{ fila[columna] }}</div>
            </td>
          </tr>
        </tbody>
        -
      </table>
    </div>

    <div v-if="fetchingFailed">Hubo un error</div>
    <div
      class="contenedor-detalles-institucionales"
      v-if="!cargandoInstituciones && fetchingFailed === false > 0"
    >
      <div class="flex">
        <TarjetaNumeralia
          :titulo="'Total de registros con fecha rara'"
          :valor="String(fechasSinParsear.length)"
        />
        <TarjetaNumeralia
          :titulo="'Total de registros con fecha parseada'"
          :valor="String(fechasParseadas.length)"
        />
      </div>
    </div>

    <!-- <table class="tabla-fechas">
        <thead class="header-tabla">
          <tr>
            <th v-for="columna in columnas" :key="columna">
              {{ columna }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in fechasSinParsear" :key="fila.index">
            <td v-for="columna in columnas" :key="`td-${fila.index}-${columna}`">
              {{ fila[columna] }}
            </td>
          </tr>
        </tbody>
      </table>-->

    <div class="m-3">
      2. ¿Cumplen con el plan que envían? 3. ¿Incliuyen los metadatos? 4. ¿Envían su diccionario de
      datos? 5. ¿Envían sus metodologías?
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
  /* height: 70vh;*/
}
.tabla-totales-institucionales {
  max-height: 400px;
  overflow-y: scroll;
}

.tabla-instituciones {
  height: 100%;
}

.table {
  display: inline-block;
}
th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--color-secundario-8);
  color: var(--color-neutro-0);
}

input {
  color: black;
  width: 20px;
  height: 20px;
}
</style>
