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
  leyendaX: {
    default: 'Titulo X',
    type: String,
  },
  leyendaY: {
    default: 'Titulo Y',
    type: String,
  },
})

const dimensiones = ref({
  altoContenedor: 300,
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
const contenedorSVG = ref(null)
const svgBurbujas = ref(null)
const grupoBurbujas = ref(null)
const ejeX = ref(null)
const ejeY = ref(null)
const escalaX = ref(null)
const escalaY = ref(null)
const textoTitulo = ref(null)
const textoX = ref(null)
const textoY = ref(null)
const radio = 5
const colorPrimario = `${import.meta.env.VITE_PRIMARY_COLOR}`

function dimensionarGrafica() {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  escalaX.value = d3
    .scaleLinear()
    .domain(d3.extent(props.data.map((d) => new Date(d[props.xVarName]))))
    .range([0, dimensiones.value.anchoGrafica])

  escalaY.value = d3
    .scaleLinear()
    .domain(d3.extent(props.data.map((d) => new Date(d[props.yVarName]))))
    .range([dimensiones.value.altoGrafica - margenes.value.arriba, 0])

  ejeY.value.call(d3.axisLeft(escalaY.value).tickFormat((d) => d + '.'))
  ejeX.value.call(d3.axisBottom(escalaX.value)).selectAll('text').attr('font-size', 9)

  textoTitulo.value
    .text(props.titulo)
    .attr('x', dimensiones.value.anchoGrafica / 2 + margenes.value.izquierda)
    .attr('y', margenes.value.arriba - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')

  textoX.value
    .text(props.leyendaX)
    .attr('x', dimensiones.value.anchoGrafica / 2 + margenes.value.izquierda)
    .attr('y', dimensiones.value.altoGrafica + margenes.value.arriba + margenes.value.abajo - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 600)

  textoY.value
    .text(props.leyendaY)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('y', 13)
    .attr('x', -dimensiones.value.altoGrafica / 2)
    .attr('font-size', '14px')
    .attr('font-weight', 600)
}

function dibujarGrafica() {
  grupoBurbujas.value
    .selectAll('circle')
    .data(props.data)
    .join(
      (enter) => {
        enter
          .append('circle')
          .attr('cx', (d) => escalaX.value(d[props.xVarName]))
          .attr('cy', (d) => escalaY.value(d[props.yVarName]))
          .attr('r', radio)
          .attr('fill', colorPrimario)
      },
      (update) => {
        update
          .attr('cx', (d) => escalaX.value(d[props.xVarName]))
          .attr('cy', (d) => escalaY.value(d[props.yVarName]))
          .attr('r', radio)
          .attr('fill', colorPrimario)
      },
      (exit) => {
        exit.remove()
      },
    )
}

const redimensionar = function () {
  dimensionarGrafica()
  dibujarGrafica()
}

onMounted(() => {
  contenedorSVG.value = document.getElementById(`contenedor-dispersion`)
  svgBurbujas.value = d3.select(`svg#svg-dispersion`)
  ejeX.value = svgBurbujas.value.select('g.eje-x')
  ejeY.value = svgBurbujas.value.select('g.eje-y')
  grupoBurbujas.value = svgBurbujas.value.select('g.grupo-burbujas')
  textoTitulo.value = svgBurbujas.value.append('text').attr('text-anchor', 'center')
  textoX.value = svgBurbujas.value.append('text').attr('text-anchor', 'center')
  textoY.value = svgBurbujas.value.append('text').attr('text-anchor', 'center')
  dimensionarGrafica()
  dibujarGrafica()
  window.addEventListener('resize', redimensionar)
})

onUnmounted(() => {
  window.removeEventListener('resize', redimensionar)
})
</script>
<template>
  <div id="contenedor-dispersion">
    <svg id="svg-dispersion" :width="dimensiones.anchoGrafica" :height="dimensiones.altoContenedor">
      <g
        class="eje-x"
        :transform="`translate(${margenes.izquierda},${dimensiones.altoGrafica})`"
      ></g>
      <g class="eje-y" :transform="`translate(${margenes.izquierda},${margenes.arriba})`"></g>
      <g
        class="grupo-burbujas"
        :transform="`translate(${margenes.izquierda},${margenes.arriba})`"
      ></g>
    </svg>
  </div>
</template>
<style></style>
