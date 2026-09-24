<script setup>
import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import ObjetivosAnuales from './secciones/ObjetivosAnuales.vue'
import HistoricoTrimestral from './secciones/HistoricoTrimestral.vue'
import InformacionDiaria from './secciones/InformacionDiaria.vue'
import RelacionBases from './secciones/RelacionBases.vue'
applyPlugin(jsPDF)

const dataTablaDispersion = ref(null)
const columnasTablaDispersion = ref(null)

const establecerDataTabla = function (e) {
  dataTablaDispersion.value = e
  columnasTablaDispersion.value = Object.keys(e[0])
}
/*function calcularAltura(altoOriginal, anchoOriginal, anchoMaximo) {
  return (altoOriginal * anchoMaximo) / anchoOriginal
}*/
const exportarPDF = async function () {
  const nombre_sugerido = 'reporte_temporal'
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
    console.error('No se encontró el gráfico de objetivos anuales')
    return
  } else if (!historicoTrimestral) {
    console.error('No se encontró el gráfico con información histórica por trimestre')
    return
  } else if (!graficosDiarios) {
    console.error('No se encontró el gráfico con información diaria')
    return
  } else if (!graficoDispersion) {
    console.error('No se encontró el gráfico de dispersion')
    return
  } else if (!tablaDispersion) {
    console.error('No se encontró el la tabla de dispersion')
    return
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

    // 6. Ahora agregamos la tabla
    /*doc.autoTable({
      startY: posicionY,
      head: [columnasTablaDispersion.value],
      body: [dataTablaDispersion.value],
      theme: 'striped',
      margin: { left: config.margins.left, right: config.margins.right },
    })*/
    doc.autoTable({
      startY: posicionY,
      html: '#tabla-dispersion',
      headStyles: { fillColor: [69, 59, 103] },
    })
    // Guardamos el documento
    doc.save(`${nombre_sugerido}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
</script>
<template>
  <div class="p-3">
    <div></div>
    <ObjetivosAnuales />
    <HistoricoTrimestral />
    <InformacionDiaria />
    <RelacionBases @tabla-construida="establecerDataTabla" />
    <div class="button-actions">
      <button class="boton-primario" @click="exportarPDF">Exportar como pdf</button>
    </div>
  </div>
</template>
