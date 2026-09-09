<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  titulo: {
    default: 'sin-titulo',
    type: String,
  },
  data: {
    default: () => [],
    type: Array,
  },
  xDomain: {
    default: () => [],
    type: Array,
  },
  yMax: {
    default: null,
    type: Number,
  },
})
const contenedorSVG = ref(null)
const svgBarras = ref(null)
const svg = ref(null)
const ejeX = ref()
const ejeY = ref()
const escalaX = ref()
const escalaY = ref()
const grupoBarras = ref()
const colorPrimario = `${import.meta.env.VITE_PRIMARY_COLOR}`
const dimensiones = ref({
  altoContenedor: 70,
  altoGrafica: 0,
  anchoContenedor: 0,
  anchoGrafica: 0,
})
const margenes = ref({
  derecha: 10,
  izquierda: 20,
  arriba: 5,
  abajo: 10,
})

const calcularDimensiones = function () {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  escalaX.value = d3
    .scaleBand()
    .domain(props.xDomain)
    .range([0, dimensiones.value.anchoGrafica - margenes.value.derecha - margenes.value.izquierda])
    .paddingInner(0.05)
  escalaY.value = d3
    .scaleLinear()
    .domain([0, props.yMax])
    .range([dimensiones.value.altoGrafica - margenes.value.arriba, 0])

  ejeX.value
    .call(d3.axisBottom(escalaX.value))
    .selectAll('text')
    .attr('text-anchor', 'center')
    //.attr('transform', 'rotate(13)')
    .attr('font-size', '6px')
  ejeY.value.call(d3.axisLeft(escalaY.value)).selectAll('text').attr('font-size', '6px')

  // Add a rect for each bar.
  grupoBarras.value
    .selectAll('rect')
    .data(props.data[1])
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('x', (d) => escalaX.value(d.fecha))
          .attr('y', (d) => escalaY.value(d.reps_sum))
          .attr('height', (d) => escalaY.value(0) - escalaY.value(d.reps_sum))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', colorPrimario)
      },
      (update) => {
        update
          .attr('x', (d) => escalaX.value(d.fecha))
          .attr('y', (d) => escalaY.value(d.reps_sum))
          .attr('height', (d) => escalaY.value(0) - escalaY.value(d.reps_sum))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', colorPrimario)
      },
      (exit) => {
        exit.remove()
      },
    )
}
onMounted(() => {
  svg.value = d3.select(svgBarras.value)
  grupoBarras.value = svg.value.select('g.grupo-barras')
  ejeX.value = svg.value.select('g.eje-x')
  ejeY.value = svg.value.select('g.eje-y')

  calcularDimensiones()
  window.addEventListener('resize', calcularDimensiones)
})
onUnmounted(() => {
  window.removeEventListener('resize', calcularDimensiones)
})
</script>

<template>
  <div class="flex grafico-barras">
    <div class="columna-2 contenedor-titulo">{{ titulo }}</div>
    <div ref="contenedorSVG" class="columna-14">
      <svg ref="svgBarras" :width="dimensiones.anchoGrafica" :height="dimensiones.altoContenedor">
        <g
          class="eje-x"
          :transform="`translate(${margenes.izquierda},${dimensiones.altoGrafica})`"
        ></g>
        <g class="eje-y" :transform="`translate(${margenes.izquierda},${margenes.arriba})`"></g>
        <g
          class="grupo-barras"
          :transform="`translate(${margenes.izquierda},${margenes.arriba})`"
        ></g>
      </svg>
    </div>
  </div>
</template>
<style scoped>
.contenedor-titulo {
  font-size: 14px;
  align-self: center;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
