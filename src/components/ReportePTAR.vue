<script setup>
import * as d3 from 'd3'
import unidecode from 'unidecode'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import IconoError from './icons/IconoError.vue'
import IconoExpandir from './icons/IconoExpandir.vue'
import IconoContraer from './icons/IconoContraer.vue'
import IconoCarga from './icons/IconoCarga.vue'
import { onMounted, ref, computed } from 'vue'
import notoRegular from '../assets/Noto_Sans/static/NotoSans-Regular.ttf?inline'
import notoBold from '../assets/Noto_Sans/static/NotoSans-Bold.ttf?inline'
import { useDataStore } from '@/stores/data.js'
applyPlugin(jsPDF)
const dataStore = useDataStore()

const hoy = d3.utcFormat('%d-%m-%Y')(new Date())
const anio = 2026
const seccionSeleccionada = ref('con_plan')
const modalInformeAbierto = computed(() => dataStore.modalAbierto)
const nombreReporte = ref(`estatus-datos-abiertos-${hoy}`)
const isLoading = ref(null)
const wasFetchigSuccesful = ref(null)
const totalRecursos = ref(null)
const diferenciaRecursos = 74
const totalConjuntos = ref(null)
const data = ref({
  con_plan: [],
  sin_plan: [],
})
const generandoReporte = ref(null)
const estatusGeneracionReporte = ref(null)
const dictColumnas = {
  sector_compuesto: 'Sector',
  nombre_institucion: 'Instituciones',
  conjuntos_en_plan: 'Conjuntos en plan',
  recursos_en_plan: 'Recursos en plan',
  conjuntos_creados_ckan: 'Conjuntos publicados',
  recursos_creados_ckan: 'Recursos publicados',
  porcentaje: 'Porcentaje',
}
const encabezados = {
  exportable: [
    'sector_compuesto',
    'nombre_institucion',
    'conjuntos_en_plan',
    'recursos_en_plan',
    'conjuntos_creados_ckan',
    'recursos_creados_ckan',
    'porcentaje',
  ],
  con_plan: [
    'nombre_institucion',
    'conjuntos_en_plan',
    'recursos_en_plan',
    'conjuntos_creados_ckan',
    'recursos_creados_ckan',
    'porcentaje',
  ],
  sin_plan: ['nombre_institucion', 'conjuntos_creados_ckan', 'recursos_creados_ckan'],
}

const numeralias = ref({
  Instituciones: 0,
  'Conjuntos en plan': 0,
  'Recursos en plan': 0,
  'Conjuntos publicados': 0,
  'Recursos publicados': 0,
})

async function solicitarDatos() {
  isLoading.value = true

  wasFetchigSuccesful.value = null
  try {
    // Solicitamos el agregado
    const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recursos`)
    const response = await request.json()
    totalConjuntos.value = response.conjuntos.length
    totalRecursos.value = response.recursos.length + diferenciaRecursos

    // Solicitamos la información correspondiente al año de interés
    const request_ptar = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/publicacion_instituciones_unicos?anio=2026`,
    )
    const response_ptar = await request_ptar.json()
    numeralias.value['Instituciones'] = response_ptar.num_instituciones
    numeralias.value['Conjuntos en plan'] = response_ptar.num_conjuntos_plan
    numeralias.value['Recursos en plan'] = response_ptar.num_recursos_plan
    numeralias.value['Conjuntos publicados'] = response_ptar.num_conjuntos_publicados
    numeralias.value['Recursos publicados'] = response_ptar.num_recursos_publicados

    // Constuimos la información anidada para las tablas de instituciones con plan
    data.value['con_plan'] = JSON.parse(response_ptar.sectorial_con_plan)
    const datumConPlan = JSON.parse(response_ptar.resultados_con_plan)
    data.value['con_plan'].forEach((d) => {
      d['data'] = datumConPlan
        .filter((m) => m.clave_sector == d.clave_sector)
        .sort((a, b) => a.nombre_institucion.localeCompare(b.nombre_institucion))
      d['desplegado'] = false
    })

    // Constuimos la información anidada para las tablas de instituciones con plan
    data.value['sin_plan'] = JSON.parse(response_ptar.sectorial_sin_plan)
    const datumSinPlan = JSON.parse(response_ptar.resultados_sin_plan)
    data.value['sin_plan'].forEach((d) => {
      d['data'] = datumSinPlan
        .filter((m) => m.clave_sector == d.clave_sector)
        .sort((a, b) => a.nombre_institucion.localeCompare(b.nombre_institucion))
      d['desplegado'] = false
    })
    console.log(data.value)
    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
}

function actualizarSeccion(nv) {
  seccionSeleccionada.value = nv
}

function formatearTexto(str) {
  return unidecode(str).toLowerCase().replaceAll(' ', '-').replaceAll(',', '')
}

function renderizar(plantilla, datos) {
  return plantilla.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, clave) => datos[clave] ?? '')
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
    padding: 8,
    margins: { top: 38, left: 20, right: 20, bottom: 30 },
    fonts: { default: 12, small: 8, medium: 10, large: 15, subtitle: 18, title: 22 },
  }

  // Identificamos los contenedores de gráficos que usaremos
  const tablaExportable = document.querySelector('table#tabla-exportable')
  // Revisamos que efectivamente existan
  if (!tablaExportable) {
    console.log('No se encontró la tabla')
    return 'Error: No se encontró la tabla'
  }

  try {
    // 1. Generamos el documento
    const doc = new jsPDF()
    // 2. Registramos las fuentes
    const base64 = notoRegular.split(',')[1]
    doc.addFileToVFS('NotoSans-Regular.ttf', base64)
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
    const boldbase64 = notoBold.split(',')[1]
    doc.addFileToVFS('NotoSans-Bold.ttf', boldbase64)
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold')
    doc.setFont('NotoSans', 'bold')
    // 3. Registramos la plantilla
    const img = document.getElementById('plantilla')
    // Asegúrate de que ya cargó
    if (!img.complete) {
      await new Promise((res) => (img.onload = res))
    }
    // 4. Generamos una variable de seguimiento de altura
    let posicionY = config.margins.top + 5
    doc.addImage(img, 'PNG', 0, 0, config.page.width, config.page.height)
    // 5. Agregamos el titlulo
    doc.setTextColor(67, 67, 67)
    doc.setFontSize(config.fonts.title)
    doc.text(
      'Publicación de bases de datos \r\npor sector de la APF',
      config.margins.left,
      posicionY,
      {
        maxWidth: 170,
      },
    )
    //posicionY += (6 * config.padding) / 2
    posicionY += 2 * config.padding
    // 6. Agregamos el subtitulo
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(config.fonts.large)
    doc.text('Plataforma Nacional de Datos Abiertos', config.margins.left, posicionY)
    posicionY += config.padding / 4
    // 7. Agregamos el encabezado
    const ultimaActualización = `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
      <i>Ultima actualización: ${hoy}</i>
    </p>`
    await doc.html(ultimaActualización, {
      x: config.margins.left,
      y: posicionY,
      width: 170,
      windowWidth: 650,
    })
    posicionY += config.padding

    // 8. Agregamos los párrafos
    doc.setFont('NotoSans')
    doc.setTextColor(67, 67, 67)
    const parrafo1 = renderizar(
      `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
     Los siguientes datos se obtuvieron del sistema de gestión de datos CKAN, que alimenta la
     Plataforma Nacional de Datos Abiertos. De marzo de 2024 a octubre de 2026 hay publicadas
      <b>{{recursos}}</b> bases de datos en <b>{{conjuntos}}</b> conjuntos de datos.
    </p>`,
      {
        recursos: d3.format(',')(totalRecursos.value),
        conjuntos: d3.format(',')(totalConjuntos.value),
      },
    )
    await doc.html(parrafo1, {
      x: config.margins.left,
      y: posicionY,
      width: 170,
      windowWidth: 650,
    })
    posicionY += 2 * config.padding
    /*const parrafo2 = `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
     En la siguiente tabla se reporta el número de bases de datos publicadas por sector; únicamente se contabilizan las bases de datos
     pertenecientes a instituciones que publicaron su Plan de apertura de datos. <s>Los datos consideran
     la publicación de nuevas bases de datos así como la sobreescritura de las mismas, es decir, cuando en el
     proceso de actualización una base reemplaza a su versión anterior. Cabe mencionar que la estructura del
     CKAN impide tener registro de dos tipos de actualización: 1)sobreescritura de las bases de datos y
     2)actualización de los metadatos de las bases de datos.</s> En consecuencia, <b>las métricas no reflejan
      la totalidad del trabajo realizado</b>.
    </p>`*/
    const parrafo2 = `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
     En la siguiente tabla se reporta el número de bases de datos publicadas por sector; únicamente se contabilizan las bases de datos
     pertenecientes a instituciones que publicaron su Plan de apertura de datos. Los valores de las columnas Conjuntos en plan y Recursos
      en plan consideran solo una vez las bases de datos cuyos nombres se repiten en el Plan de apertura de datos al
      que pertenecen; dichas repeticiones se deben a que la información de la base será actualizada a lo largo del
      año. Sin embargo, hay ocasiones en las que se crea un nuevo recurso en el CKAN para agregar la información actualizada en
      lugar de reemplazar el archivo anterior, lo que impide calcular correctamente la relación entre lo que los Planes de
      apertura de datos indican y lo que se publica en la PNDA.
    </p>`

    await doc.html(parrafo2, {
      x: config.margins.left,
      y: posicionY,
      width: 170,
      windowWidth: 650,
    })

    posicionY += 5 * config.padding
    // 9. Agregamos el título de la tabla
    doc.setFont('NotoSans', 'bold')
    doc.setTextColor(67, 67, 67)
    doc.setFontSize(14)
    doc.text(
      'Número de bases de datos publicadas en la PNDA por sector',
      config.margins.left,
      posicionY,
    )
    // 10. Agregamos la tabla
    doc.setFont('NotoSans')
    doc.setFontSize(config.fonts.default)
    posicionY += config.padding / 2
    doc.autoTable({
      startY: posicionY,
      html: '#tabla-exportable',
      headStyles: {
        fillColor: [97, 18, 50],
        textColor: [255, 255, 255],
        lineColor: [255, 255, 255],
        font: 'NotoSans',
        fontSize: 8,
        lineWidth: 0.3,
        halign: 'center',
        valign: 'middle',
      },
      margin: {
        top: config.margins.top,
        bottom: config.margins.bottom,
        left: config.margins.left,
        right: config.margins.right,
      },
      styles: {
        textColor: [67, 67, 67],
        font: 'NotoSans',
        fontSize: 8,
      },
      willDrawPage: () => {
        if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
          doc.addImage(img, 'PNG', 0, 0, config.page.width, config.page.height)
        }
      },
    })
    const pageHeight = doc.internal.pageSize.getHeight()
    posicionY = pageHeight + doc.lastAutoTable.finalY

    const pieTabla = `<p style="font-family: 'Noto Sans', sans-serif; font-size:10px; line-height: 1.2, width:650px">
     **<b>En plan</b> se refiere a datos que no cambian durante un año.
      <b>Publicados</b> se refiere a información que está en constante cambio.`

    await doc.html(pieTabla, {
      x: config.margins.left,
      y: posicionY,
      width: 170,
      windowWidth: 650,
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

function abrirModal() {
  estatusGeneracionReporte.value = null
  dataStore.abrirModal()
}

function cerrarModal() {
  dataStore.cerrarModal()
}
onMounted(async () => {
  cerrarModal()
  await solicitarDatos()
  //armarDataConPlan()
})
</script>
<template>
  <div class="m-1 p-4 modal-personalizado" v-if="modalInformeAbierto">
    <h5>Exportar reporte</h5>
    <SisdaiCampoBase
      etiqueta="Ingresa un nombre para el reporte generado"
      :es_obligatorio="true"
      :es_etiqueta_visible="true"
      v-model="nombreReporte"
      texto_ayuda="Nombre del archivo"
    />
    <IconoCarga class="m-y-2" v-if="generandoReporte" />
    <div
      v-if="estatusGeneracionReporte && estatusGeneracionReporte == 'Exito' && !generandoReporte"
      class="p-2 m-y-1 flex flex-contenido-centrado texto-color-confirmacion fondo-color-confirmacion borde borde-redondeado-8"
    >
      Reporte generado exitosamente.
    </div>
    <div
      v-if="estatusGeneracionReporte && estatusGeneracionReporte != 'Exito' && !generandoReporte"
      class="m-y-1 p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
    >
      Ocurrio un error
    </div>
    <div class="flex flex-contenido-final">
      <button class="boton-secundario" @click="cerrarModal" :disabled="generandoReporte">
        Cerrar
      </button>
      <button
        class="boton-primario"
        @click="exportar"
        :disabled="generandoReporte || estatusGeneracionReporte == 'Exito'"
      >
        Exportar
      </button>
    </div>
  </div>

  <div class="flex flex-contenido-centrado" id="spinner-01">
    <div v-if="isLoading" id="spinner flex-vertical-centrado" class="m-y-8">
      <IconoCarga />
    </div>
    <div
      v-if="wasFetchigSuccesful === false && !isLoading"
      id="error-01"
      class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
    >
      <IconoError />
      Ocurrió un error
    </div>
  </div>

  <div class="p-x-3" v-if="wasFetchigSuccesful && !isLoading">
    <h1>Plataforma Nacional de Datos Abiertos</h1>
    <h2>Estadísticas</h2>
    <p>
      Los siguientes datos se obtuvieron del sistema de gestión de datos CKAN, que alimenta la
      Plataforma Nacional de Datos Abiertos. Se compara información obtenida de los
      <b>Planes de Apertura de Datos</b> de cada institución con los Conjuntos y Bases de datos
      <b>publicadas durante el {{ anio }}</b
      >.
    </p>
    <div class="m-y-5 flex flex-contenido-centrado contenedor-numeralias">
      <div
        v-for="opcion of Object.keys(numeralias)"
        :key="opcion"
        class="contenedor-tarjeta p-x-2"
        :class="
          opcion == 'Instituciones' || opcion == 'Recursos en plan' ? 'con-borde' : 'sin-borde'
        "
      >
        <div class="tarjeta">
          <div class="tarjeta-cuerpo p-y-0">
            <div class="numeralia m-y-0 p-y-0">{{ d3.format(',')(numeralias[opcion]) }}</div>
            <div class="etiqueta-numeralia m-y-0 p-y-0">{{ opcion }}</div>
          </div>
        </div>
      </div>
    </div>
    <h3>Publicación de datos por sector</h3>
    <p>
      Los valores de las columnas <b>Conjuntos en plan</b> y <b>Recursos en plan</b> consideran solo
      una vez las bases de datos cuyos nombres se repiten en el Plan de apertura de datos al que
      pertenecen; dichas repeticiones se deben a que la información de la base será actualizada a lo
      largo del año.
    </p>
    <div class="m-y-3 flex flex-contenido-centrado">
      <div class="columna-12 p-3 cuadro-informacion" v-if="seccionSeleccionada == 'con_plan'">
        Hay ocasiones en las que se crea un nuevo recurso en el CKAN para agregar la información
        actualizada en lugar de reemplazar el archivo anterior, lo que impide calcular correctamente
        la relación entre lo que los Planes de apertura de datos indican y lo que se publica en la
        PNDA
      </div>
    </div>
    <div class="flex contenedor-seccion flex-contenido-separado">
      <div>
        <button
          class="seccion boton-mediano"
          :class="seccionSeleccionada === 'con_plan' ? 'selected' : 'no-selected'"
          @click="actualizarSeccion('con_plan')"
        >
          Instituciones con Plan de apertura
        </button>
        <button
          class="seccion boton-mediano"
          :class="seccionSeleccionada === 'sin_plan' ? 'selected' : 'no-selected'"
          @click="actualizarSeccion('sin_plan')"
        >
          Instituciones sin Plan de apertura
        </button>
      </div>
      <div>
        <button class="boton-primario boton-exportar" @click="abrirModal">Exportar</button>
      </div>
    </div>
    <img id="plantilla" src="/plantilla.png" style="display: none" />
    <table class="tabla-exportable" :id="`tabla-exportable`" v-show="false">
      <thead class="header-tabla">
        <tr>
          <th colspan="4">En plan</th>
          <th colspan="3">Publicados</th>
        </tr>
        <tr>
          <th v-for="columna of encabezados['exportable']" :key="columna">
            {{ dictColumnas[columna] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sector in data['con_plan']" :key="formatearTexto(sector.sector)">
          <td v-for="columna of encabezados['exportable']" :key="`fila-exportable-${columna}`">
            <span v-if="columna == 'porcentaje'">
              {{ d3.format(',.2f')(sector[columna]) }}
            </span>
            <span v-else-if="columna != 'sector_compuesto'">{{
              d3.format(',')(sector[columna])
            }}</span>
            <span v-else>{{ sector[columna] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-for="fila of data[seccionSeleccionada].filter((d) => d.clave_sector !== '999')"
      :key="`desplegable-${formatearTexto(fila.sector)}`"
      class="m-y-4 m-x-3"
    >
      <div class="flex flex-contenido-separado contenedor-sector">
        <h6 class="m-x-2">{{ fila.sector_compuesto }}</h6>
        <button class="boton-tabla" v-if="!fila['desplegado']" @click="fila['desplegado'] = true">
          <IconoExpandir />
        </button>
        <button class="boton-tabla" v-if="fila['desplegado']" @click="fila['desplegado'] = false">
          <IconoContraer />
        </button>
      </div>

      <table class="tabla-sectores" :id="`tabla-sector-${formatearTexto(fila.sector)}`">
        <thead class="header-tabla">
          <tr>
            <th v-for="columna of encabezados[seccionSeleccionada]" :key="columna">
              {{ dictColumnas[columna] }}:
              <span v-if="columna == 'porcentaje'" class="total-tabla">
                {{ d3.format(',.2f')(fila[columna]) }}
              </span>
              <span v-else class="total-tabla">{{ fila[columna] }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="fila['desplegado']">
          <tr
            v-for="institucion of fila['data']"
            :key="formatearTexto(institucion.nombre_institucion)"
          >
            <td
              v-for="columna of encabezados[seccionSeleccionada]"
              :key="`td-${formatearTexto(institucion.nombre_institucion)}-${columna}`"
            >
              <div v-if="columna == 'porcentaje'">
                {{ d3.format(',.2f')(institucion[columna]) }}
              </div>

              <div v-else>{{ institucion[columna] }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

h1,
h2,
h3 {
  color: var(--color-encabezados);
}
.tarjeta {
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.25) !important;
}

.modal-personalizado {
  background-color: var(--color-neutro-1);
  position: fixed;
  z-index: 5;
  left: 30vw;
  top: 15vh;
}

.contenedor-numeralias {
  gap: 0px;
}
.contenedor-tarjeta {
  width: 20%;
}
.con-borde {
  border-right: 2px solid var(--color-neutro-2);
}
.numeralia {
  font-size: 55px;
  font-weight: 700;
  text-align: center;
  color: var(--color-encabezados);
}

.etiqueta-numeralia {
  border-radius: 8px;
  padding: 8px;
  background-color: var(--color-secundario-11);
  color: white;
  font-weight: 500;
  font-size: 16px;
  text-align: center;
}

.cuadro-informacion {
  border: 1px solid var(--color-neutro-7);
  border-radius: 8px;
  background-color: var(--color-neutro-2);
  color: var(--color-neutro-7);
}

.contenedor-seccion {
  gap: 2px;
  border-bottom: 2px solid var(--color-neutro-2);
}
button.seccion {
  background-color: var(--color-neutro-1);
  color: var(--color-secundario-11);
}

.selected {
  border-bottom: solid 4px var(--color-secundario-7);
}

.no-selected {
  background-color: var(--color-neutro-1);
}
.contenedor-sector {
  background-color: var(--color-secundario-11);
  color: white;
}
.boton-exportar {
  align-self: flex-end;
}

h6 {
  font-weight: bold;
  font-family: Patria, 'noso Sans', Helvetica, Arial, sans-serif;
  font-size: larger;
}

button.boton-tabla {
  color: white;
  background-color: var(--color-secundario-11);
  border: none;
}

table {
  min-width: 100%;
  border: 1px solid var(--color-neutro-4);
  border-radius: 8px;
  color: var(--color-encabezados);
}
thead {
  background-color: var(--color-neutro-1);
}

/*td {
  background-color: var(--color-neutro-1);
  border-bottom: 1px solid var(--color-neutro-2);
}*/
th {
  text-align: center;
}
.total-tabla {
  padding: 4px;
  border-radius: 8px;
  /*border: 2px solid var(--color-secundario-7);
  color: var(--color-secundario-7) !important;*/
  background-color: var(--color-secundario-7);
  color: white;
  text-align: center;
  margin-left: 4px;
}
.highlight {
  font-weight: bold;
  border: none;
}
li {
  margin: 8px 16px;
}
</style>
