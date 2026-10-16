<script setup>
import BarrasReutilizables from '../graficas/BarrasReutilizables.vue'
import BarrasApiladas from '../graficas/BarrasApiladas.vue'
import IconoError from '../icons/IconoError.vue'
import IconoCarga from '../icons/IconoCarga.vue'
import { ref, onMounted } from 'vue'
const isLoading = ref(true)
const wasFetchigSuccesful = ref(null)
const dataInteracciones = ref(null)
const dataRecursos = ref(null)
const notaInteracciones = ref(
  'Las interacciones cuentan los correos recibidos de todas las instituciones.',
)
const notaRecursos = ref(
  'La información de actualización de recursos se obtiene del Sistema de Información, a partir de los registros de sobreescritura.',
)

async function solicitarDatos() {
  isLoading.value = true
  wasFetchigSuccesful.value = null
  try {
    const requestInteracciones = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/vinculacion_trimestral`,
    )
    const responseInteracciones = await requestInteracciones.json()
    dataInteracciones.value = JSON.parse(responseInteracciones.interacciones)

    const requestRecursos = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recursos_trimestral`,
    )
    const responseRecursos = await requestRecursos.json()
    dataRecursos.value = JSON.parse(responseRecursos.recursos)
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
  <div>
    <h4>Histórico trimestral</h4>
    <div class="flex flex-contenido-centrado" id="spinner-01">
      <div v-if="isLoading" id="spinner flex-vertical-centrado">
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
    <div v-if="!isLoading && wasFetchigSuccesful" class="flex" id="contenedor-historico-trimestral">
      <BarrasReutilizables
        class="columna-8"
        :data="dataInteracciones"
        :titulo="'Vinculación'"
        :x-axis-title="'Trimestre'"
        :y-axis-title="'No. Interacciones'"
        :x-var-name="'trimestre'"
        :y-var-name="'interacciones'"
        :alto="300"
        :nota="notaInteracciones"
      />
      <BarrasApiladas
        class="columna-8"
        :data="dataRecursos"
        :titulo="'Publicación de recursos'"
        :x-axis-title="'Trimestre'"
        :y-axis-title="'Recursos publicados'"
        :x-var-name="'trimestre'"
        :alto="300"
        :categorias="['creados', 'actualizados']"
        :nota="notaRecursos"
      />
    </div>
  </div>
</template>
