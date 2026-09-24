<script setup>
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  titulo: {
    default: 'sin-titulo',
    type: String,
  },
  data: {
    default: () => [],
    type: Array,
  },
  xVarName: {
    default: 'x-var',
    type: String,
  },
  yVarName: {
    default: 'y-var',
    type: String,
  },
  xAxisTitle: {
    default: 'Titulo del eje X',
    type: String,
  },
  yAxisTitle: {
    default: 'Titulo del eje Y',
    type: String,
  },
  alto: {
    default: 300,
    type: Number,
  },
})
const dimensiones = ref({
  altoContenedor: props.alto,
  altoGrafica: 0,
  anchoContenedor: 0,
  anchoGrafica: 0,
})
const margenes = ref({
  derecha: 10,
  izquierda: 45,
  arriba: 25,
  abajo: 35,
})

const tooltip = ref()
const contenedorSVG = ref(null)
const svgBarras = ref(null)
const svg = ref(null)
const ejeX = ref()
const ejeY = ref()
const escalaX = ref()
const escalaY = ref()
const grupoBarras = ref()
const textoX = ref(null)
const textoY = ref(null)
const textoTitulo = ref(null)
const colorPrimario = `${import.meta.env.VITE_PRIMARY_COLOR}`
const noInteracciones = ref(null)

function graficarBarras() {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  const xDomain = Array.from(new Set(props.data.map((d) => d[props.xVarName])))
  const yMax = d3.max(props.data.map((d) => d[props.yVarName]))

  escalaX.value = d3
    .scaleBand()
    .domain(xDomain)
    .range([0, dimensiones.value.anchoGrafica - margenes.value.derecha - margenes.value.izquierda])
    .paddingInner(0.05)
  escalaY.value = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([dimensiones.value.altoGrafica - margenes.value.arriba, 0])

  ejeX.value
    .call(d3.axisBottom(escalaX.value))
    .selectAll('text')
    .attr('text-anchor', 'center')
    .attr('font-size', '6px')

  ejeY.value.call(d3.axisLeft(escalaY.value)).selectAll('text').attr('font-size', '6px')

  textoTitulo.value
    .text(props.titulo)
    .attr('x', dimensiones.value.anchoGrafica / 2 + margenes.value.izquierda)
    .attr('y', margenes.value.arriba - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')

  textoX.value
    .text(props.xAxisTitle)
    .attr('x', dimensiones.value.anchoGrafica / 2 + margenes.value.izquierda)
    .attr('y', dimensiones.value.altoGrafica + margenes.value.arriba + margenes.value.abajo - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 600)

  textoY.value
    .text(props.yAxisTitle)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('y', 13)
    .attr('x', -dimensiones.value.altoGrafica / 2)
    .attr('font-size', '14px')
    .attr('font-weight', 600)

  grupoBarras.value
    .selectAll('rect')
    .data(props.data)
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('x', (d) => escalaX.value(d[props.xVarName]))
          .attr('y', (d) => escalaY.value(d[props.yVarName]))
          .attr('height', (d) => escalaY.value(0) - escalaY.value(d[props.yVarName]))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', colorPrimario)
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (update) => {
        update
          .attr('x', (d) => escalaX.value(d[props.xVarName]))
          .attr('y', (d) => escalaY.value(d[props.yVarName]))
          .attr('height', (d) => escalaY.value(0) - escalaY.value(d[props.yVarName]))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', colorPrimario)
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (exit) => {
        exit.remove()
      },
    )
}

const abrirTooltip = function (_event, target) {
  noInteracciones.value = target.interacciones
  tooltip.value.style('visibility', 'visible').selectAll('text')
}

const ajustarPosicionTooltip = function (event) {
  const pointer = d3.pointer(event, document.body)
  const xPosition = pointer[0]
  const yPosition = pointer[1]
  tooltip.value.style('left', xPosition + 'px').style('top', yPosition + 'px')
}

const cerrarTooltip = function () {
  tooltip.value.style('visibility', 'hidden')
}

onMounted(() => {
  svg.value = d3.select(svgBarras.value)
  grupoBarras.value = svg.value.select('g.grupo-barras')
  ejeX.value = svg.value.select('g.eje-x')
  ejeY.value = svg.value.select('g.eje-y')
  textoTitulo.value = svg.value.append('text').attr('text-anchor', 'end')
  textoX.value = svg.value.append('text').attr('text-anchor', 'end')
  textoY.value = svg.value.append('text').attr('text-anchor', 'end')
  tooltip.value = d3.select(`div.tooltip-barras-${props.yVarName}`)
  tooltip.value.style('visibility', 'hidden')
  graficarBarras()
  window.addEventListener('resize', graficarBarras)
})
onUnmounted(() => {
  window.removeEventListener('resize', graficarBarras)
})
</script>
<template>
  <div>
    <div ref="contenedorSVG">
      <div :class="`tooltip-barras-${props.yVarName} tooltip`" data-html2canvas-ignore>
        <span>{{ noInteracciones }}</span>
      </div>
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
.tooltip {
  position: absolute;
  z-index: 2;
  background-color: #252323;
  color: white;
  opacity: 0.93;
  height: auto;
  width: 180px;
  font-size: 14px;
  padding: 5px;
}
span {
  font-weight: bold;
}
</style>
