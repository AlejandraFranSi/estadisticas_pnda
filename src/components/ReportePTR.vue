<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import ObjetivosAnuales from './secciones/ObjetivosAnuales.vue'
import HistoricoTrimestral from './secciones/HistoricoTrimestral.vue'
import InformacionDiaria from './secciones/InformacionDiaria.vue'
import RelacionBases from './secciones/RelacionBases.vue'
import { useDataStore } from '@/stores/data.js'

applyPlugin(jsPDF)
const dataStore = useDataStore()
const dataTablaDispersion = ref(null)
const columnasTablaDispersion = ref(null)
const modalExportacion = ref(null)
const generandoReporte = ref(false)
const estatusGeneracionReporte = ref(null)
const fechaInicio = computed(() => dataStore.fechaInicio)
const fechaFinal = computed(() => dataStore.fechaFinal)

const nombreReporte = ref(`reporte_${fechaInicio.value}_${fechaFinal.value}`)

const establecerDataTabla = function (e) {
  dataTablaDispersion.value = e
  columnasTablaDispersion.value = Object.keys(e[0])
}

const generarReporte = async function () {
  const config = {
    page: {
      width: 210, // A4 width in mm
      height: 297,
      format: 'a4',
      unit: 'mm',
      orientation: 'portrait',
    },
    padding: 16,
    margins: { top: 20, left: 20, right: 20, bottom: 20 },
    fonts: { default: 12, small: 8, medium: 10, large: 16, title: 20 },
  }
  const anchoContenido = config.page.width - config.margins.left - config.margins.right

  // Identificamos los contenedores de gráficos que usaremos
  const objetivosAnuales = document.querySelector('div#contenedor-objetivos-anuales')
  const graficosDiarios = document.querySelector('div#contenedor-graficas-diarias')
  const historicoTrimestral = document.querySelector('div#contenedor-historico-trimestral')
  const graficoDispersion = document.querySelector('div#contenedor-grafico-dispersion')
  const tablaDispersion = document.querySelector('table#tabla-dispersion')
  // Revisamos que efectivamente existan
  if (!objetivosAnuales) {
    return 'Error: No se encontró el fráfico de objetivos'
  } else if (!historicoTrimestral) {
    return 'Error: No se encontró el fráfico de información histórica por trimestre'
  } else if (!graficosDiarios) {
    return 'Error: No se encontró el gráfico de información histórica por trimestre'
  } else if (!graficoDispersion) {
    return 'Error: No se encontró el gráfico de dispersión'
  } else if (!tablaDispersion) {
    return 'Error: No se encontró la tabla'
  }

  try {
    // Generamos el documento y una variable de seguimiento de altura
    const doc = new jsPDF()
    let posicionY = config.margins.top
    // Agregamos las secciones
    // 1. Agregamos la sección de objetivos diarios
    doc.getFontSize(config.fonts.large)
    doc.text('Objetivos anuales', config.margins.left, posicionY)
    posicionY += config.padding

    const canvasObjetivosAnuales = await html2canvas(objetivosAnuales, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgGraficoObjetivosAnuales = canvasObjetivosAnuales.toDataURL('image/png')
    const altoCanvasObjetivosAnuales =
      (canvasObjetivosAnuales.height * anchoContenido) / canvasObjetivosAnuales.width
    doc.addImage(
      imgGraficoObjetivosAnuales,
      'png',
      config.margins.left,
      posicionY,
      anchoContenido,
      altoCanvasObjetivosAnuales,
    )
    posicionY = posicionY + altoCanvasObjetivosAnuales + config.padding

    // 2. Agregamos la información histórica trimestral
    doc.getFontSize(config.fonts.large)
    doc.text('Histórico trimestral', config.margins.left, posicionY)
    posicionY += config.padding

    const canvasHistoricoTrimestral = await html2canvas(historicoTrimestral, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgGraficoHistoricoTrimestral = canvasHistoricoTrimestral.toDataURL('image/png')
    const altoCanvasHistoricoTrimestral =
      (canvasHistoricoTrimestral.height * anchoContenido) / canvasHistoricoTrimestral.width
    doc.addImage(
      imgGraficoHistoricoTrimestral,
      'png',
      config.margins.left,
      posicionY,
      anchoContenido,
      altoCanvasHistoricoTrimestral,
    )
    posicionY = posicionY + altoCanvasObjetivosAnuales + config.padding

    // 3. Agregamos la información diaria
    doc.getFontSize(config.fonts.large)
    doc.text('Información diaria', config.margins.left, posicionY)
    posicionY += config.padding

    const canvasDiarios = await html2canvas(graficosDiarios, {
      scale: 2, // 2x resolution for sharper output
      useCORS: true, // Enable cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgGraficoDiarios = canvasDiarios.toDataURL('image/png')
    const altoCanvasDiarios = (canvasDiarios.height * anchoContenido) / canvasDiarios.width
    doc.addImage(
      imgGraficoDiarios,
      'png',
      config.margins.left,
      posicionY,
      anchoContenido,
      altoCanvasDiarios,
    )
    posicionY = posicionY + altoCanvasDiarios + config.padding

    // 4. Agregamos la sección de dispersión
    doc.addPage(config.format, config.orientation)
    posicionY = config.margins.top
    doc.getFontSize(config.fonts.large)
    doc.text(
      'Relación entre publicación de recursos e interacciones con instituciones',
      config.margins.left,
      posicionY,
    )
    posicionY += config.padding
    const canvasDispersion = await html2canvas(graficoDispersion, {
      scale: 2, // 2x resolution for sharper output
      useCORS: true, // Enable cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgGraficoDispersion = canvasDispersion.toDataURL('image/png')
    const altoCanvasDispersion = (canvasDispersion.height * anchoContenido) / canvasDispersion.width
    doc.addImage(
      imgGraficoDispersion,
      'png',
      config.margins.left,
      posicionY,
      anchoContenido,
      altoCanvasDispersion,
    )
    posicionY = posicionY + altoCanvasDispersion + config.padding

    doc.autoTable({
      startY: posicionY,
      html: '#tabla-dispersion',
      headStyles: { fillColor: [69, 59, 103] },
    })
    // Guardamos el documento
    doc.save(`${nombreReporte.value}.pdf`)

    return 'Exito'
  } catch (error) {
    return `Error: ${error}`
  }
}

const exportar = async function () {
  generandoReporte.value = true
  estatusGeneracionReporte.value = await generarReporte()
  generandoReporte.value = false
}
</script>
<template>
  <div class="p-3">
    <ObjetivosAnuales />
    <HistoricoTrimestral />
    <InformacionDiaria />
    <RelacionBases @tabla-construida="establecerDataTabla" />
    <div class="button-actions">
      <button class="boton-primario" @click="modalExportacion?.abrirModal">
        Exportar como pdf
      </button>
    </div>
    <SisdaiModal ref="modalExportacion">
      <template #encabezado>
        <h5>Exportar Informe</h5>
      </template>
      <template #cuerpo>
        <div
          v-if="generandoReporte && estatusGeneracionReporte === null"
          class="flex flex-contenido-centrado"
        >
          <div class="flex-vertical-centrado">
            <img src="/loading.gif" id="spinner flex-vertical-centrado" />
            <p>Generando reporte</p>
          </div>
        </div>
        <div v-if="!generandoReporte && estatusGeneracionReporte === null">
          <SisdaiCampoBase
            etiqueta="Ingresa un nombre para el reporte generado"
            :es_obligatorio="true"
            :es_etiqueta_visible="true"
            v-model="nombreReporte"
            texto_ayuda="Nombre del reporte"
          />
        </div>
        <div
          v-if="!generandoReporte && estatusGeneracionReporte === 'Exito'"
          class="p-2 flex flex-contenido-centrado texto-color-confirmacion fondo-color-confirmacion borde borde-redondeado-8"
        >
          Reporte generado exitosamente.
        </div>
        <div
          v-if="
            !generandoReporte && estatusGeneracionReporte && estatusGeneracionReporte !== 'Exito'
          "
          class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
        >
          {{ estatusGeneracionReporte }}
        </div>
      </template>
      <template #pie>
        <div class="flex flex-contenido-separado">
          <button @click="exportar" class="boton-primario">Exportar</button>
          <button @click="modalExportacion?.cerrarModal">Cancelar</button>
        </div>
      </template>
    </SisdaiModal>
  </div>
</template>
<style scoped>
.boton-primario {
  background-color: var(--color-secundario-8);
  border-color: var(--color-secundario-8);
}

.boton-primario:hover {
  background-color: var(--color-secundario-7);
  border-color: var(--color-secundario-7);
}
</style>
