<script setup>
import * as d3 from 'd3'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  titulo: {
    default: 'sin-titulo',
    type: String,
  },
  etiqueta: {
    default: 'sin-titulo',
    type: String,
  },
  data: {
    default: () => [],
    type: Array,
  },
  categorias: {
    default: () => [],
    type: Array,
  },
  xVar: {
    default: 'sin-titulo',
    type: String,
  },
  yMax: {
    default: 0,
    type: Number,
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
  izquierda: 50,
  arriba: 25,
  abajo: 25,
})

const contenedorSVG = ref(null)
const svg = ref(null)
const ejeX = ref(null)
const ejeY = ref(null)
const textoX = ref(null)
const textoY = ref(null)
const textoTitulo = ref(null)
const grupoAreas = ref(null)
const escalaX = ref(null)
const escalaY = ref(null)
const escalaColor = ref(null)
const stackedData = ref(null)
const colorList = ['#D2AB99', '#8DB38B', '#56876D', '#484D6D']

function dimensionarGrafica() {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  escalaX.value = d3
    .scaleTime()
    .domain(d3.extent(props.data.map((d) => new Date(d[props.xVar]))))
    .range([0, dimensiones.value.anchoGrafica])

  escalaY.value = d3
    .scaleLinear()
    .domain([0, props.yMax])
    .range([dimensiones.value.altoGrafica - margenes.value.arriba, 0])

  escalaColor.value = d3.scaleOrdinal().domain(props.categorias).range(colorList)

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

function dibujarAreas() {
  grupoAreas.value
    .selectAll('path')
    .data(stackedData.value)
    .join(
      (enter) => {
        enter
          .append('path')
          .attr('fill', (d) => escalaColor.value(d.key))
          .attr('opacity', 0.8)
          .attr('d', (d) => {
            return d3
              .area()
              .x((dd) => escalaX.value(new Date(dd.data[props.xVar])))
              .y0((dd) => escalaY.value(dd[0]))
              .y1((dd) => escalaY.value(dd[1]))(d)
          })
      },
      (update) => {
        update
          .attr('fill', (d) => escalaColor.value(d.key))
          .attr('opacity', 0.8)
          .attr('d', (d) => {
            return d3
              .area()
              .x((dd) => escalaX.value(new Date(dd.data[props.xVar])))
              .y0((dd) => escalaY.value(dd[0]))
              .y1((dd) => escalaY.value(dd[1]))(d)
          })
      },
      (exit) => {
        exit.remove()
      },
    )
}

function reescalar() {
  dimensionarGrafica()
  dibujarAreas()
}

onMounted(() => {
  contenedorSVG.value = document.getElementById(`contenedor-areas-${props.etiqueta}`)
  svg.value = d3.select(`svg#svg-areas-${props.etiqueta}`)
  ejeX.value = svg.value.select('g.eje-x')
  ejeY.value = svg.value.select('g.eje-y')
  grupoAreas.value = svg.value.select('g.areas')
  textoTitulo.value = svg.value.append('text').attr('text-anchor', 'center')
  textoX.value = svg.value.append('text').attr('text-anchor', 'center')
  textoY.value = svg.value.append('text').attr('text-anchor', 'center')
  stackedData.value = d3.stack().keys(props.categorias)(props.data)
  dimensionarGrafica()
  dibujarAreas()
  window.addEventListener('resize', reescalar)
})

onUnmounted(() => {
  window.removeEventListener('resize', reescalar)
})
</script>
<template>
  <div :id="`contenedor-areas-${props.etiqueta}`">
    <svg
      :id="`svg-areas-${props.etiqueta}`"
      :width="dimensiones.anchoGrafica"
      :height="dimensiones.altoContenedor"
    >
      <g
        class="eje-x"
        :transform="`translate(${margenes.izquierda},${dimensiones.altoGrafica})`"
      ></g>
      <g class="eje-y" :transform="`translate(${margenes.izquierda},${margenes.arriba})`"></g>
      <g class="areas" :transform="`translate(${margenes.izquierda},${margenes.arriba})`"></g>
    </svg>
  </div>
</template>
