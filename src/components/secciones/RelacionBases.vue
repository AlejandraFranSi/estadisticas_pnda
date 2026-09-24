<script setup>
import GraficoDispersion from '../graficas/GraficoDispersion.vue'
import IconoError from '../icons/IconoError.vue'
import { onMounted, computed, ref, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'

const emit = defineEmits(['tablaConstruida'])

const dataStore = useDataStore()
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)

const isLoading = ref(null)
const wasFetchigSuccesful = ref(null)
const datum = ref(null)
const dataTabla = ref(null)
const variablesTabla = ref(null)

const solicitarDatos = async function () {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const request = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recursos_x_interaccion?inicio=${fechaInicio.value}&fin=${fechaFinal.value}`,
    )
    const response = await request.json()
    datum.value = JSON.parse(response.result)
    datum.value.forEach(
      (d) =>
        (d['categorias'] = Array.from(new Set(d['categorias'].split(', ')))
          .filter((d) => d.length > 0)
          .join(', ')),
    )
    dataTabla.value = datum.value.slice(0, 11)

    variablesTabla.value = Object.keys(dataTabla.value[0])
    emit('tablaConstruida', dataTabla.value)
    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
}

onMounted(async () => {
  solicitarDatos()
})

watch([fechaInicio, fechaFinal], async () => {
  await solicitarDatos()
})
</script>
<template>
  <div>
    <h4>Relación entre publicación de recursos e interacciones con instituciones</h4>
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
    <div v-if="wasFetchigSuccesful && !isLoading" id="contenedor-grafico-dispersion">
      <GraficoDispersion
        :titulo="'Recursos por institucion'"
        :data="datum"
        :y-var-name="'num_recursos'"
        :x-var-name="'num_interacciones'"
        :y-axis-title="'Número de recursos'"
        :x-axis-title="'Número de interacciones'"
        :leyenda-y="'Número de Recursos'"
        :leyenda-x="'Número de interacciones'"
      />
    </div>
    <div v-if="wasFetchigSuccesful && !isLoading">
      <h5>
        Las 10 instituciones con más bases subidas de
        {{ fechaInicio }}
        a
        {{ fechaFinal }}
      </h5>
      <table class="tabla-instituciones" id="tabla-dispersion">
        <thead class="header-tabla">
          <tr>
            <th v-for="columna of variablesTabla" :key="columna">
              {{ columna }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="institucion of dataTabla" :key="institucion.nombre_institucion">
            <td
              v-for="columna in variablesTabla"
              :key="`td-${institucion.nombre_institucion}-${columna}`"
            >
              <div>{{ institucion[columna] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped></style>
