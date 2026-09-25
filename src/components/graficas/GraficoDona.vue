<script setup>
import IconoEditar from '../icons/IconoEditar.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  titulo: {
    default: 'sin-titulo',
    type: String,
  },
  objetivo: {
    default: null,
    type: Number,
  },
  estatus: {
    default: null,
    type: Number,
  },
  ancho: {
    default: 150,
    type: Number,
  },
  etiqueta: {
    default: 'sin-titulo',
    type: String,
  },
  editable: {
    default: true,
    type: Boolean,
  },
})
const dimensiones = ref({
  altoContenedor: props.ancho,
  altoGrafica: props.ancho,
  anchoContenedor: props.ancho,
  anchoGrafica: props.ancho,
})
const margenes = ref({
  derecha: 10,
  izquierda: 10,
  arriba: 10,
  abajo: 0,
})

const contenedorSVG = ref()
const svg = ref()
const grupo_dona = ref()
const grupo_porcentaje = ref()
const grupo_valores = ref()
const radio = ref(0)
const arco = ref()
const pie = ref()
const datosGraficados = ref(null)
const porcentaje = ref(null)
const colorPrimario = `${import.meta.env.VITE_PRIMARY_COLOR_2}`
const colorSecundario = `${import.meta.env.VITE_SECONDARY_COLOR_2}`
const sisdaiModal = ref(null)
const campoEdicion = ref(String(props.estatus))

function constuirDataArray(estadoActual) {
  datosGraficados.value = [
    { name: 'total', value: props.objetivo - Number(estadoActual) },
    { name: 'estatus', value: props.estatus },
  ]

  porcentaje.value = d3.format('.2f')((estadoActual / props.objetivo) * 100)
}

function obtenerDimensiones() {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  radio.value =
    d3.min([
      dimensiones.value.anchoGrafica,
      props.ancho - margenes.value.arriba - margenes.value.abajo,
    ]) / 2

  arco.value = d3
    .arc()
    .innerRadius(radio.value * 0.67)
    .outerRadius(radio.value - 1)

  pie.value = d3
    .pie()
    .padAngle(1 / radio.value)
    .sort(null)
    .value((d) => d.value)

  grupo_porcentaje.value.attr('font-family', 'Giorgio').attr('text-anchor', 'middle')
  grupo_valores.value
    .attr('font-family', 'Giorgio')
    .attr('text-anchor', 'middle')
    .attr('font-size', '10')
}

function dibujarDona() {
  grupo_dona.value.selectAll('path').remove()

  grupo_dona.value
    .selectAll()
    .data(pie.value(datosGraficados.value))
    .join('path')
    .attr('fill', (d) => {
      if (d.data.name == 'total') {
        return colorSecundario
      } else {
        return colorPrimario
      }
    })
    .attr('d', arco.value)
}

function reescalar() {
  obtenerDimensiones()
  dibujarDona()
}

function editarEstado() {
  sisdaiModal.value?.abrirModal()
}
function confirmar() {
  constuirDataArray(campoEdicion.value)
  reescalar()
  sisdaiModal.value?.cerrarModal()
}
onMounted(() => {
  contenedorSVG.value = document.getElementById(`contenedor-dona-${props.etiqueta}`)
  svg.value = d3.select(`svg#svg-dona-${props.etiqueta}`)
  grupo_dona.value = svg.value.select('g.grupo-dona')
  grupo_porcentaje.value = svg.value.select('g.grupo-porcentaje')
  grupo_valores.value = svg.value.select('g.grupo-valores-reales')
  constuirDataArray(props.estatus)
  obtenerDimensiones()
  dibujarDona()
  window.addEventListener('resize', reescalar)
})
onUnmounted(() => {
  window.removeEventListener('resize', reescalar)
})
</script>
<template>
  <div class="contenedor-dona" :id="`contenedor-dona-${props.etiqueta}`">
    <button
      class="boton-editar"
      @click="editarEstado"
      :disabled="!editable"
      data-html2canvas-ignore
    >
      <IconoEditar :style="{ opacity: props.editable ? '1' : '0.6' }" />
    </button>

    <svg
      :id="`svg-dona-${props.etiqueta}`"
      class="svg-dona"
      :width="dimensiones.anchoGrafica"
      :height="dimensiones.altoContenedor"
    >
      <g
        class="grupo-dona"
        :transform="`translate(${dimensiones.anchoGrafica / 2},${dimensiones.altoGrafica / 2})`"
      ></g>
      <g
        class="grupo-porcentaje"
        :transform="`translate(${dimensiones.anchoGrafica / 2},${dimensiones.altoGrafica / 2})`"
      >
        <text>{{ porcentaje }} %</text>
      </g>
      <g
        class="grupo-valores-reales"
        :transform="`translate(${dimensiones.anchoGrafica / 2},${dimensiones.altoGrafica / 2 + 20})`"
      >
        <text>{{ campoEdicion }} / {{ props.objetivo }}</text>
      </g>
    </svg>
    <p class="m-0">{{ props.titulo }}</p>
    <SisdaiModal ref="sisdaiModal" data-html2canvas-ignore>
      <template #encabezado><h5>Edición de valores</h5></template>
      <template #cuerpo
        ><div>
          <SisdaiCampoBase
            :etiqueta="`Ingresa el nuevo valor para el objetivo ${props.title}`"
            :es_obligatorio="false"
            :es_etiqueta_visible="true"
            v-model="campoEdicion"
            texto_ayuda="El nuevo número entero a partir del cual se obtendrá el porcentaje"
          /></div
      ></template>
      <template #pie>
        <div class="flex flex-contenido-centrado">
          <button class="boton-primario" @click="confirmar">Confirmar</button>
          <button @click="sisdaiModal?.cerrarModal">Cancelar</button>
        </div>
      </template>
    </SisdaiModal>
  </div>
</template>
<style scoped>
p {
  font-weight: bold;
  text-align: center;
}

.boton-editar {
  position: relative;
  top: 0x;
  left: 70%;
  padding: 8px;
}

button {
  background-color: var(--color-secundario-6);
}

button:hover {
  background-color: var(--color-secundario-5);
}

button:disabled {
  background-color: var(--color-neutro-4);
  opacity: 0.4;
}
</style>
