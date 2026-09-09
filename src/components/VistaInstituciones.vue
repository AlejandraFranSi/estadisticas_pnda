<script setup>
import IconoError from './icons/IconoError.vue'
import GraficoBurbujasTemporales from './graficas/GraficoBurbujasTemporales.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const recursos = computed(() => dataStore.dataRecursos)
const totalBases = computed(() => dataStore.totalRecursos)
const instituciones = ref(null)
const totalesInstitucionales = ref(null)
const columnasInstituciones = ref(null)
const institucionSeleccionada = ref(null)

const obtenerInstituciones = async function () {
  if (recursos.value.length > 0) {
    const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recursos_x_institucion`)
    if (request.ok) {
      const res = await request.json()
      totalesInstitucionales.value = JSON.parse(res.datum)
      //columnasInstituciones.value = Object.keys(totalesInstitucionales.value[0])
      columnasInstituciones.value = ['index', 'nombre_institucion', 'bases_publicadas']
      instituciones.value = totalesInstitucionales.value
        .map((d) => d.institucion)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    } else {
      console.error('Falló la petición de instituciones:', request.error)
    }
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
  dataStore.actualizarInstitucion(nv)
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
    <GraficoBurbujasTemporales v-if="institucionSeleccionada" />

    <div class="m-3">
      ¿Incliuyen los metadatos? ¿Envían su diccionario de datos? ¿Envían sus metodologías?
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
