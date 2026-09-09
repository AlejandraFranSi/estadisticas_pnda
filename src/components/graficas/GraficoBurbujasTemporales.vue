<script setup>
import * as d3 from 'd3'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const institucionSeleccionada = computed(() => dataStore.institucionSeleccionada)
const recursos = computed(() => dataStore.dataRecursos)

const error = ref(false)
const estaCargando = ref(null)
const fechasSinParsear = ref([])
const fechasParseadas = ref([])
const recursosInstitucionales = ref(null)
const intervaloTemporal = ref()

const dimensiones = ref({
  altoContenedor: 100,
  altoGrafica: 0,
  anchoContenedor: 0,
  anchoGrafica: 0,
})
const margenes = ref({
  derecha: 10,
  izquierda: 75,
  arriba: 10,
  abajo: 10,
})
const lado = 15
const colorCirc = '#2b204c'
const colorRect = '#9674e1'
const contenedorSVG = ref(null)
const svg = ref(null)
const ejeTemporal = ref()
const escalaCategorias = ref()
const ejeCategorias = ref()
const escalaTemporal = ref()
const grupoRecursos = ref()
const grupoPlan = ref()
const tooltip = ref()
const recursoHovereado = ref({ nombre: '', fecha: '' })

/**
 * Esta función solicita un dataframe con el contenido de los planes de apertura}
 * vinculados a la institución seleccionada
 */
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
  } else {
    error.value = true
    fechasSinParsear.value = []
    fechasParseadas.value = []
  }
  estaCargando.value = false
}

/**
 * A partir de la data del plan de apertura y la data de los recursos publicados
 * se obtiene la fecha más antigua y la más reciente
 */
function calcularRangoTemporal() {
  const temporalidadRecursos = recursosInstitucionales.value.map(
    (d) => new Date(d.creacion_recurso),
  )
  const temporalidadPlan = fechasParseadas.value.map((d) => new Date(d.fecha_formateada))
  const temporalidades = [...temporalidadRecursos, ...temporalidadPlan].sort((a, b) => a - b)
  intervaloTemporal.value = [temporalidades[0], temporalidades[temporalidades.length - 1]]
  console.log(intervaloTemporal.value)
}

/**
 * Calcula las dimensiones del gráfico a partir del ancho de la pantalla
 */
const calcularDimensiones = function () {
  dimensiones.value.anchoContenedor = contenedorSVG.value.clientWidth
  dimensiones.value.anchoGrafica = dimensiones.value.anchoContenedor
  dimensiones.value.altoGrafica = dimensiones.value.altoContenedor
}

/**
 * Crea las escalas, los ejes, los círuclos y los rectángulos de la data.
 */
const crearLineaTemporal = function () {
  escalaTemporal.value = d3
    .scaleTime()
    .domain(intervaloTemporal.value)
    .range([0, dimensiones.value.anchoGrafica - margenes.value.derecha - margenes.value.izquierda])

  escalaCategorias.value = d3
    .scaleBand()
    .domain(['En plan de Apertura', 'Recursos publicados'])
    .range([0, dimensiones.value.altoGrafica - margenes.value.arriba - 2 * margenes.value.abajo])

  ejeTemporal.value
    .call(d3.axisBottom(escalaTemporal.value))
    .selectAll('text')
    .attr('text-anchor', 'center')
    .attr('font-size', '6px')

  ejeCategorias.value
    .call(d3.axisLeft(escalaCategorias.value))
    .selectAll('text')
    .attr('text-anchor', 'center')
    .attr('font-size', '6px')

  // Agregamos un circulo por cada elemento del plan de apertura
  grupoRecursos.value
    .selectAll('rect')
    .data(recursosInstitucionales.value)
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('x', (d) => escalaTemporal.value(new Date(d.creacion_recurso)))
          .attr('y', escalaCategorias.value('Recursos publicados'))
          .attr('height', lado)
          .attr('width', lado)
          .attr('fill', colorRect)
          .attr('opacity', '0.4')
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (update) => {
        update
          .attr('x', (d) => escalaTemporal.value(new Date(d.creacion_recurso)))
          .attr('y', escalaCategorias.value('Recursos publicados'))
          .attr('height', lado)
          .attr('width', lado)
          .attr('fill', colorRect)
          .attr('opacity', '0.4')
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (exit) => {
        exit.remove()
      },
    )

  // Agregamos un círculo por cada recurso subido
  grupoPlan.value
    .selectAll('circle')
    .data(fechasParseadas.value)
    .join(
      (enter) => {
        enter
          .append('circle')
          .attr('cx', (d) => escalaTemporal.value(new Date(d.fecha_formateada)))
          .attr('cy', escalaCategorias.value('En plan de Apertura'))
          .attr('r', lado / 2)
          .attr('fill', colorCirc)
          .attr('opacity', '0.6')
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (update) => {
        update
          .attr('cx', (d) => escalaTemporal.value(new Date(d.fecha_formateada)))
          .attr('cy', escalaCategorias.value('En plan de Apertura'))
          .attr('r', lado / 2)
          .attr('fill', colorCirc)
          .attr('opacity', '0.6')
          .on('mouseenter', abrirTooltip)
          .on('mousemove', ajustarPosicionTooltip)
          .on('mouseleave', cerrarTooltip)
      },
      (exit) => {
        exit.remove()
      },
    )
}

/**
 * Ajusta dimensiones y escalas
 */
const redimensionar = function () {
  calcularDimensiones()
  crearLineaTemporal()
}

/**
 * Muestra la información del rectángulo o elemento seleccionado en un tooltip
 * @param target Recupera la información del elemento selecconado
 */
const abrirTooltip = function (_event, target) {
  recursoHovereado.value = {
    nombre: target.nombre_paquete || target.recurso_datos,
    fecha: target.creacion_recurso?.slice(0, 10) || target.fecha_formateada,
  }
  tooltip.value.style('visibility', 'visible').selectAll('text')
}

/**
 * Ajusta la posición del tooltip según la posición del mouse
 * @param event El evento de mousemove
 */
const ajustarPosicionTooltip = function (event) {
  const pointer = d3.pointer(event, document.body)
  let xPosition = pointer[0] + 20
  if (xPosition + 100 > dimensiones.value.anchoContenedor) {
    xPosition = pointer[0] - 190
  }
  const yPosition = pointer[1] - 70
  tooltip.value.style('left', xPosition + 'px').style('top', yPosition + 'px')
}

/**
 * Oculta el tooltip
 */
const cerrarTooltip = function () {
  tooltip.value.style('visibility', 'hidden')
}

onMounted(async () => {
  contenedorSVG.value = document.querySelector(`.contenedor-linea-temporal`)
  svg.value = d3.select('svg.svg-linea-temporal')
  grupoRecursos.value = svg.value.select('g.grupo-recursos')
  grupoPlan.value = svg.value.select('g.grupo-plan')
  ejeTemporal.value = svg.value.select('g.eje-temporal')
  ejeCategorias.value = svg.value.select('g.eje-categorias')
  tooltip.value = d3.select('div.tooltip-tiempo')
  tooltip.value.style('visibility', 'hidden')

  recursosInstitucionales.value = recursos.value.filter(
    (d) => d.nombre_institucion === institucionSeleccionada.value,
  )
  await solicitarPlanes(institucionSeleccionada.value)
  calcularDimensiones()
  calcularRangoTemporal()
  crearLineaTemporal()
  window.addEventListener('resize', redimensionar)
})
onUnmounted(() => {
  window.removeEventListener('resize', redimensionar)
})

watch(institucionSeleccionada, async (nv) => {
  recursosInstitucionales.value = recursos.value.filter((d) => d.nombre_institucion === nv)
  await solicitarPlanes(nv)
  calcularRangoTemporal()
  crearLineaTemporal()
})
</script>

<template>
  <div>
    <h4>¿{{ institucionSeleccionada }} cumple con el Plan de Apertura que envían?</h4>
    <div
      class="flex flex-contenido-centrado m-y-4"
      v-if="estaCargando || error || fechasSinParsear.length > 0"
    >
      <div v-if="estaCargando" id="spinner flex-vertical-centrado">
        <img src="/loading.gif" />
        <p>Solictando datos</p>
      </div>
      <div
        v-if="fechasSinParsear.length > 0"
        class="p-2 flex flex-contenido-centrado texto-color-informacion fondo-color-informacion borde borde-redondeado-8"
      >
        No se pudieron graficar {{ fechasSinParsear.length }} recursos listados en el plan debido al
        formato de las fechas.
      </div>
      <div
        v-if="error"
        id="error-01"
        class="p-2 flex flex-contenido-centrado texto-color-informacion fondo-color-informacion borde borde-redondeado-8"
      >
        Esta institución no tiene Plan de Apertura
      </div>
    </div>
    <div class="contenedor-linea-temporal">
      <div class="tooltip-tiempo">
        <span>Recurso</span> {{ recursoHovereado.nombre }}<br />
        <span>Fecha de Publicación</span>: {{ recursoHovereado.fecha }}
      </div>
      <svg
        class="svg-linea-temporal"
        :width="dimensiones.anchoGrafica"
        :height="dimensiones.altoGrafica"
        :transform="`translate(${0},${0})`"
      >
        <g
          class="eje-temporal"
          :transform="`translate(${margenes.izquierda},${dimensiones.altoGrafica - margenes.arriba - margenes.abajo})`"
        ></g>
        <g
          class="eje-categorias"
          :transform="`translate(${margenes.izquierda},${margenes.arriba})`"
        ></g>
        <g
          class="grupo-recursos"
          :transform="`translate(${margenes.izquierda},${2 * margenes.arriba})`"
        ></g>
        <g
          class="grupo-plan"
          :transform="`translate(${margenes.izquierda},${2 * margenes.arriba})`"
        ></g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.tooltip-tiempo {
  position: absolute;
  z-index: 2;
  background-color: #252323;
  color: white;
  opacity: 0.93;
  height: auto;
  width: 175px;
  font-size: 14px;
  padding: 5px;
  overflow-wrap: break-word;
  white-space: normal;
}
span {
  font-weight: bold;
}
</style>
