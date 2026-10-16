<script setup>
import * as d3 from 'd3'
import { ref, onMounted, onUnmounted } from 'vue'

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
  categorias: {
    default: () => [],
    type: Array,
  },
  nota: {
    default: '',
    type: String,
  },
})
const datum = ref(null)
const categoriasX = ref(null)
const max = ref(null)
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
const colorList = ['#611232', '#9b2247']

const contenedorGrafico = ref(null)
const svgGrafico = ref(null)
const grupoBarras = ref(null)
const ejeX = ref()
const ejeY = ref()
const escalaX = ref()
const escalaY = ref()
const textoX = ref(null)
const textoY = ref(null)
const textoTitulo = ref(null)
const escalaColor = ref()
const tooltip = ref()
const valoresTooltip = ref({})

const solicitarData = function () {
  max.value = d3.max(props.data.map((d) => d.creados + d.actualizados))
  categoriasX.value = props.data.map((d) => d[props.xVarName])
  datum.value = d3.stack().keys(props.categorias)(props.data)
  for (let categoria of props.categorias) {
    valoresTooltip.value[categoria] = ''
  }
}

const calcularDimensiones = function () {
  dimensiones.value.anchoContenedor = contenedorGrafico.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  escalaColor.value = d3.scaleOrdinal().domain(props.categorias).range(colorList)

  escalaX.value = d3
    .scaleBand()
    .domain(categoriasX.value)
    .range([0, dimensiones.value.anchoGrafica - margenes.value.derecha - margenes.value.izquierda])
    .paddingInner(0.05)

  escalaY.value = d3
    .scaleLinear()
    .domain([0, max.value])
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
}

const dibujarBarras = function () {
  grupoBarras.value
    .selectAll('g.grupo-categoria')
    .selectAll('rect')
    .data((d) => d)
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('x', (d) => escalaX.value(d.data[props.xVarName]))
          .attr('y', (d) => escalaY.value(d[1]))
          .attr('height', (d) => escalaY.value(d[0]) - escalaY.value(d[1]))
          .attr('width', escalaX.value.bandwidth())
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (update) => {
        update
          .attr('x', (d) => escalaX.value(d.data[props.xVarName]))
          .attr('y', (d) => escalaY.value(d[1]))
          .attr('height', (d) => escalaY.value(d[0]) - escalaY.value(d[1]))
          .attr('width', escalaX.value.bandwidth())
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (exit) => {
        exit.remove()
      },
    )
}

function abrirTooltip(event, target) {
  for (let categoria of Object.keys(valoresTooltip.value)) {
    valoresTooltip.value[categoria] = d3.format(',')(target.data[categoria])
  }
  tooltip.value.style('visibility', 'visible').selectAll('text')
}

function ajustarPosicionTooltip(event) {
  const leftMargin = document.getElementById('side-bar')?.clientWidth
  const pointer = d3.pointer(event, document.body)
  const xPosition = pointer[0] - leftMargin + 10
  const yPosition = pointer[1] - 80
  tooltip.value.style('left', xPosition + 'px').style('top', yPosition + 'px')
}

function cerrarTooltip() {
  tooltip.value.style('visibility', 'hidden')
}

const redimensionar = function () {
  calcularDimensiones()
  dibujarBarras()
}
onMounted(async () => {
  contenedorGrafico.value = document.getElementById('contenedor-barras-agrupadas')
  svgGrafico.value = d3.select('svg.svg-barras-agrupadas')
  grupoBarras.value = svgGrafico.value.select('g.grupo-barras')
  ejeX.value = svgGrafico.value.select('g.eje-x')
  ejeY.value = svgGrafico.value.select('g.eje-y')
  textoTitulo.value = svgGrafico.value.append('text').attr('text-anchor', 'center')
  textoX.value = svgGrafico.value.append('text').attr('text-anchor', 'center')
  textoY.value = svgGrafico.value.append('text').attr('text-anchor', 'center')
  tooltip.value = d3.select(`div.tooltip-areas-${props.xVarName}`)
  tooltip.value.style('visibility', 'hidden')
  solicitarData()
  calcularDimensiones()
  grupoBarras.value
    .selectAll('g')
    .data(datum.value)
    .enter()
    .append('g')
    .attr('class', 'grupo-categoria')
    .attr('fill', (d) => escalaColor.value(d.key))

  dibujarBarras()

  window.addEventListener('resize', redimensionar)
})

onUnmounted(() => {
  window.removeEventListener('resize', redimensionar)
})
</script>
<template>
  <div id="contenedor-barras-agrupadas">
    <div :class="`tooltip-areas-${props.xVarName} tooltip`">
      <p class="contenido-tooltip" v-for="categoria in props.categorias" :key="categoria">
        <span class="resaltar">{{ categoria }}</span
        >: {{ valoresTooltip[categoria] }}
      </p>
    </div>
    <svg
      class="svg-barras-agrupadas"
      :width="dimensiones.anchoGrafica"
      :height="dimensiones.altoContenedor"
    >
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
    <div class="nota-pie p-x-2">
      {{ props.nota }}
    </div>
  </div>
</template>
<style scoped>
.nota-pie {
  font-size: 10px;
}
.tooltip {
  position: absolute;
  z-index: 2;
  background-color: #252323;
  color: white;
  opacity: 0.93;
  height: auto;
  width: 150px;
  font-size: 14px;
  padding: 5px;
}

.contenido-tooltip {
  margin: 0px;
}

.resaltar {
  font-weight: bold;
}
</style>
