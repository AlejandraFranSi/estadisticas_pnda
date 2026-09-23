<script setup>
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

function constuirDataArray() {
  datosGraficados.value = [
    { name: 'total', value: props.objetivo - props.estatus },
    { name: 'estatus', value: props.estatus },
  ]

  porcentaje.value = d3.format('.2f')((props.estatus / props.objetivo) * 100)
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
onMounted(() => {
  contenedorSVG.value = document.getElementById(`contenedor-dona-${props.etiqueta}`)
  svg.value = d3.select(`svg#svg-dona-${props.etiqueta}`)
  grupo_dona.value = svg.value.select('g.grupo-dona')
  grupo_porcentaje.value = svg.value.select('g.grupo-porcentaje')
  grupo_valores.value = svg.value.select('g.grupo-valores-reales')
  constuirDataArray()
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
        <text>{{ props.estatus }} / {{ props.objetivo }}</text>
      </g>
    </svg>
    <p class="m-0">{{ props.titulo }}</p>
  </div>
</template>
<style scoped>
p {
  font-weight: bold;
  text-align: center;
}
</style>
