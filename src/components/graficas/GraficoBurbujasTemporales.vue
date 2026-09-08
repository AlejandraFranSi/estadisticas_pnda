<script>
import { computed, onMounted, ref, watch } from 'vue'
const error = ref(null)
const estaCargando = ref(null)
const fechasSinParsear = ref([])
const fechasParseadas = ref([])

async function solicitarPlanes(inst) {
  estaCargando.value = true
  const request = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/planes_apertura/?institucion=${inst}`,
  )
  if (request.ok) {
    error.value = false
    const respuesta = await request.json()
    fechasSinParsear.value = JSON.parse(respuesta.fechas_sin_parsear)
    fechasParseadas.value = JSON.parse(respuesta.fechas_parseadas)
    console.log('Las fechas parseadas:', fechasParseadas.value)
    console.log('Las fechas sin parsear:', fechasSinParsear.value)
  } else {
    console.error(request)
    error.value = true
  }
  estaCargando.value = false
}
</script>

<template>
  <div>
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
  </div>
</template>
