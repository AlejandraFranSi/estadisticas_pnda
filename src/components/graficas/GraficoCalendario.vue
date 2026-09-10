<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue'
import * as dfd from 'danfojs'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    default: () => [],
    type: Array,
  },
})

const contenedorSVG = ref(null)
const svg = ref(null)
const tooltip = ref()
const gruposAnios = ref()
const grupoDias = ref()
const etiquetasMeses = ref()
const etiquetasDias = ref()
const padding = 8
const dimensiones = ref({
  altoContenedor: 650,
  altoGrafica: 0,
  anchoContenedor: 0,
  anchoGrafica: 0,
})
const margenes = ref({
  derecha: 10,
  izquierda: 10,
  arriba: 30,
  abajo: 20,
})
//const minSize = 12
const cellSize = ref(16) // Alto del rectángulo-día
const altoAnio = ref(cellSize.value * 9) // Alto de una semana, es decir, alto del año (7 days + padding)
const escalaColor = ref(null)
const minColor = '#E9E9E9'
const maxColor = `${import.meta.env.VITE_PRIMARY_COLOR}`
const dataAnual = ref(null)
const hoyEs = new Date()
const masAntiguo = ref(null)
const maximoSubidos = ref(null)
// Cuenta cuantas semanas hay a partir del inicio del año hasta la fecha indicada
const timeWeek = d3.timeMonday
const countDay = (i) => (i + 6) % 7
const formatDay = (i) => 'DLMMJVS'[i]
const formatMonth = d3.timeFormat('%b')
const selectedDate = ref(null)
const selectedReps = ref(null)

/**
 * Esta función genera una lista con entradas tipo
 * { fecha: dateTime, reps: int }
 * donde se cuenta el numero de bases de datos subidas por día desde el primer dia que se subio una base
 */
const prepararData = function () {
  const fechas = props.data.map((d) => {
    return {
      //fecha_og: d.creacion_recurso,
      fecha_parseada: d3.timeFormat('%Y %m %d')(new Date(d.creacion_recurso.slice(0, 23))),
      reps: 1,
    }
  })
  let df = new dfd.DataFrame(fechas)
  df = df.groupby(['fecha_parseada']).sum()
  let frecuencias = dfd
    .toJSON(df)
    .map((d) => {
      return { fecha: d3.timeParse('%Y %m %d')(d.fecha_parseada), reps: d.reps_sum }
    })
    .sort((a, b) => a.fecha - b.fecha)
  masAntiguo.value = new Date(frecuencias[0]['fecha'])
  maximoSubidos.value = d3.max(frecuencias.map((d) => d.reps))

  let serie_anual = []
  for (let d = new Date(masAntiguo.value); d <= hoyEs; d.setDate(d.getDate() + 1)) {
    let prueba = frecuencias.find(
      (n) => d3.timeFormat('%Y %m %d')(n.fecha) === d3.timeFormat('%Y %m %d')(d),
    )
    if (prueba) {
      serie_anual.push(prueba)
    } else {
      serie_anual.push({ fecha: new Date(d), reps: 0 })
    }
  }
  dataAnual.value = d3.groups(serie_anual, (d) => d.fecha.getFullYear())
}

/**
 * Crea una estructura html agregando grupos para distintos elementos
 */
const agregarEstructura = function () {
  gruposAnios.value = svg.value
    .selectAll('g')
    .data(dataAnual.value)
    .join('g')
    .attr('class', 'grupo-anual')

  grupoDias.value = gruposAnios.value.append('g').attr('class', 'rect-dias')
  etiquetasMeses.value = gruposAnios.value.append('g').attr('class', 'etiquetas-meses')
  etiquetasDias.value = gruposAnios.value
    .append('g')
    .attr('text-anchor', 'end')
    .attr('class', 'etiquetas-dias')
}
/**
 * Esta función calcula las dimensiones del gráfico y crea las escalas necesarias
 * */
function calcularDimensiones() {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda

  let proporcion =
    (dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda) / 57
  //cellSize.value = proporcion > minSize ? proporcion : minSize
  cellSize.value = proporcion
  altoAnio.value = cellSize.value * 8

  dimensiones.value.altoContenedor =
    altoAnio.value * dataAnual.value.length + padding + margenes.value.arriba + margenes.value.abajo
  dimensiones.value.altoGrafica = dimensiones.value.altoContenedor

  // Armamos la escala de color
  escalaColor.value = d3.scaleSqrt().domain([0, maximoSubidos.value]).range([minColor, maxColor])
}
/**
 * Esta función se encarga de ajustar las posiciones y tamaños
 * de todos los textos y los rectángulos que representan los días
 */
function dibujarCalendario() {
  // Ajustamos la posicion de los grupos de año
  gruposAnios.value.attr('transform', (d, i) => {
    return `translate(${cellSize.value * 3},${margenes.value.arriba + altoAnio.value * i + cellSize.value * 2 * i})`
  })
  // Agregamos las etiquetas del año
  gruposAnios.value
    .selectAll('text')
    .data(([key]) => [key])
    .join(
      (enter) => {
        enter
          .append('text')
          .attr('class', 'etiqueta_anio')
          .attr('x', -5)
          .attr('y', -5)
          .attr('font-weight', 'bold')
          .attr('text-anchor', 'end')
          .attr('font-size', cellSize.value)
          .text((d) => d)
      },
      (update) => {
        update
          .attr('x', -5)
          .attr('y', -5)
          .attr('font-weight', 'bold')
          .attr('text-anchor', 'end')
          .attr('font-size', cellSize.value)
          .text((d) => d)
      },
      (exit) => {
        exit.remove()
      },
    )

  // Agregamos las etiquetas de los días
  etiquetasDias.value
    .selectAll()
    .data(d3.range(0, 7))
    .join(
      (enter) => {
        enter
          .append('text')
          .attr('x', -5)
          .attr('y', (i) => (countDay(i) + 0.5) * cellSize.value)
          .attr('dy', '0.31em')
          .attr('font-size', cellSize.value)
          .text(formatDay)
      },
      (update) => {
        update
          .attr('x', -5)
          .attr('y', (i) => (countDay(i) + 0.5) * cellSize.value)
          .attr('dy', '0.31em')
          .attr('font-size', cellSize.value)
          .text(formatDay)
      },
      (exit) => {
        exit.remove()
      },
    )

  // Agregamos las etiquetas de los meses
  etiquetasMeses.value
    .selectAll('g.etiquetas-meses')
    .data(([, values]) => d3.timeMonths(d3.timeMonth(values[0].fecha), values.at(-1).fecha))
    .join(
      (enter) => {
        enter
          .append('text')
          .attr('x', (d) => timeWeek.count(d3.timeYear(d), timeWeek.ceil(d)) * cellSize.value + 2)
          .attr('y', -5)
          .attr('font-size', cellSize.value)
          .text(formatMonth)
      },
      (update) => {
        update
          .attr('x', (d) => timeWeek.count(d3.timeYear(d), timeWeek.ceil(d)) * cellSize.value + 2)
          .attr('y', -5)
          .attr('font-size', cellSize.value)
          .text(formatMonth)
      },
      (exit) => {
        exit.remove()
      },
    )

  // Agregamos los rectángulos correspondientes a los días
  grupoDias.value
    .selectAll('rect')
    .data(([anio, registros]) => registros)
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('width', cellSize.value - 1)
          .attr('height', cellSize.value - 1)
          .attr('x', (d) => timeWeek.count(d3.timeYear(d.fecha), d.fecha) * cellSize.value + 0.5)
          .attr('y', (d) => countDay(d.fecha.getDay()) * cellSize.value + 0.5)
          .attr('fill', (d) => escalaColor.value(d.reps))
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (update) => {
        update
          .attr('width', cellSize.value - 1)
          .attr('height', cellSize.value - 1)
          .attr('x', (d) => timeWeek.count(d3.timeYear(d.fecha), d.fecha) * cellSize.value + 0.5)
          .attr('y', (d) => countDay(d.fecha.getDay()) * cellSize.value + 0.5)
          .attr('fill', (d) => escalaColor.value(d.reps))
      },
      (exit) => {
        exit.remove()
      },
    )
}
/**
 * Ajusta las medidas del gráfico al cambiar el tamaño de la pantalla
 */
const ajustarEscala = function () {
  calcularDimensiones()
  dibujarCalendario()
}
/**
 * Hace visible un contenedor con información adicional
 */
const abrirTooltip = function (_event, target) {
  selectedDate.value = d3.timeFormat('%d/%m/%Y')(target.fecha)
  selectedReps.value = target.reps
  tooltip.value.style('visibility', 'visible').selectAll('text')
}
/**
 * Ajusta la posición del contenedor de información según el puntero
 * @param event
 */
const ajustarPosicionTooltip = function (event) {
  const pointer = d3.pointer(event, document.body)
  let xPosition = pointer[0] + 10
  if (xPosition + 100 > dimensiones.value.anchoContenedor) {
    xPosition = pointer[0] - 160
  }
  const yPosition = pointer[1] - 65
  tooltip.value.style('left', xPosition + 'px').style('top', yPosition + 'px')
}
/**
 * Oculta el contenedor de información adicional
 */
const cerrarTooltip = function () {
  tooltip.value.style('visibility', 'hidden')
}

onMounted(() => {
  contenedorSVG.value = document.querySelector('.contenedor-calendario')
  svg.value = d3.select('svg.svg-calendario')
  tooltip.value = d3.select('div.tooltip-calendario')
  tooltip.value.style('visibility', 'hidden')
  prepararData()
  agregarEstructura()
  calcularDimensiones()
  dibujarCalendario()
  window.addEventListener('resize', ajustarEscala)
})
onUnmounted(() => {
  window.removeEventListener('resize', ajustarEscala)
})
</script>
<template>
  <div class="contenedor-calendario">
    <div class="tooltip-calendario">
      El día <span>{{ selectedDate }}</span> se subieron <span>{{ selectedReps }}</span> bases de
      datos.
    </div>
    <svg
      class="svg-calendario"
      :height="dimensiones.altoGrafica"
      :width="dimensiones.anchoGrafica"
      :transform="`translate(${margenes.izquierda},${0})`"
    ></svg>
  </div>
</template>
<style scoped>
.contenedor-calendario {
  width: 100%;
}

.tooltip-calendario {
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
span {
  font-weight: bold;
}
</style>
