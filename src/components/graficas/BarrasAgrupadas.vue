<script setup>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'

const data = ref(null)
const datum = ref(null)
const fechas = ref(null)
const categorias = ref(null)
const max = ref(null)
const dimensiones = ref({
  altoContenedor: 250,
  altoGrafica: 0,
  anchoContenedor: 0,
  anchoGrafica: 0,
})
const margenes = ref({
  derecha: 10,
  izquierda: 20,
  arriba: 5,
  abajo: 15,
})

const contenedorGrafico = ref(null)
const svgGrafico = ref(null)
const grupoBarras = ref(null)
const ejeX = ref()
const ejeY = ref()
const escalaX = ref()
const escalaY = ref()
const colorDict = {
  otros: '#978CB7',
  publicación: '#453B67',
  atención: '#6E6380',
}

const solicitarData = async function () {
  const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/correos_intitucionales`)
  if (request.status === 200) {
    const response = await request.json()
    data.value = JSON.parse(response.data_agrupada)
    max.value = d3.max(data.value.map((d) => d.interacciones))
    categorias.value = Array.from(new Set(data.value.map((d) => d.objetivo_interaccion)))
    fechas.value = Array.from(new Set(data.value.map((d) => d.mes_anio))).sort(
      (a, b) => new Date(`01-${a}`) - new Date(`01-${b}`),
    )
    const dataIndexada = []
    for (let fecha of fechas.value) {
      let data_anio = data.value.filter((d) => d.mes_anio === fecha)
      let categorias_fecha = Array.from(new Set(data_anio.map((d) => d.objetivo_interaccion)))
      let dictFecha = {}
      let dictCat = {}
      for (let categoria of categorias_fecha) {
        let data_categoria = data_anio.filter((d) => d.objetivo_interaccion === categoria)
        if (data_categoria.length > 0) {
          dictCat[categoria] = data_categoria
        }
      }
      dictFecha[fecha] = dictCat
      dataIndexada.push(dictFecha)
    }

    datum.value = d3
      .stack()
      .keys(categorias.value)
      .value((obj, key) => {
        let llave = Object.keys(obj)[0]
        let valor = obj[llave][key]?.[0]?.['interacciones'] || 0
        return valor
      })(dataIndexada)
  }
}

const calcularDimensiones = function () {
  dimensiones.value.anchoContenedor = contenedorGrafico.value.clientWidth
  dimensiones.value.anchoGrafica =
    dimensiones.value.anchoContenedor - margenes.value.derecha - margenes.value.izquierda
  dimensiones.value.altoGrafica =
    dimensiones.value.altoContenedor - margenes.value.arriba - margenes.value.abajo

  escalaX.value = d3
    .scaleBand()
    .domain(fechas.value)
    .range([0, dimensiones.value.anchoGrafica])
    .paddingInner(0.05)

  escalaY.value = d3.scaleLinear().domain([0, max.value]).range([dimensiones.value.altoGrafica, 0])

  ejeX.value
    .call(d3.axisBottom(escalaX.value))
    .selectAll('text')
    .attr('text-anchor', 'center')
    .attr('font-size', '6px')

  ejeY.value.call(d3.axisLeft(escalaY.value)).selectAll('text').attr('font-size', '6px')
}

const dibujarBarras = function () {
  grupoBarras.value
    .selectAll('g.grupo-categoria')
    .selectAll('rect')
    .data((D) => {
      return D.map((d) => ((d.key = D.key), d))
    })
    .join(
      (enter) => {
        enter
          .append('rect')
          .attr('x', (d) => {
            let fecha = Object.keys(d.data)[0]
            return escalaX.value(fecha)
          })
          .attr('y', (d) => escalaY.value(d[1]))
          .attr('height', (d) => escalaY.value(d[0]) - escalaY.value(d[1]))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', (d) => colorDict[d.key])
      },
      (update) => {
        update
          .attr('x', (d) => {
            let fecha = Object.keys(d.data)[0]
            return escalaX.value(fecha)
          })
          .attr('y', (d) => escalaY.value(d[1]))
          .attr('height', (d) => escalaY.value(d[0]) - escalaY.value(d[1]))
          .attr('width', escalaX.value.bandwidth())
          .attr('fill', (d) => colorDict[d.key])
      },
      (exit) => {
        exit.remove()
      },
    )
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
  await solicitarData()
  calcularDimensiones()
  grupoBarras.value
    .selectAll('g')
    .data(datum.value)
    .enter()
    .append('g')
    .attr('class', 'grupo-categoria')
  dibujarBarras()

  window.addEventListener('resize', redimensionar)
})
</script>
<template>
  <div id="contenedor-barras-agrupadas">
    <svg
      class="svg-barras-agrupadas"
      :width="dimensiones.anchoGrafica"
      :height="dimensiones.altoContenedor"
    >
      <g
        class="eje-x"
        :transform="`translate(${margenes.izquierda},${dimensiones.altoGrafica + margenes.arriba})`"
      ></g>
      <g class="eje-y" :transform="`translate(${margenes.izquierda},${margenes.arriba})`"></g>
      <g
        class="grupo-barras"
        :transform="`translate(${margenes.izquierda},${margenes.arriba})`"
      ></g>
    </svg>
  </div>
</template>
