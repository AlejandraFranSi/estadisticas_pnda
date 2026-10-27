<script setup>
import * as d3 from 'd3'
import unidecode from 'unidecode'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import IconoError from './icons/IconoError.vue'
import IconoExpandir from './icons/IconoExpandir.vue'
import IconoContraer from './icons/IconoContraer.vue'
import IconoCarga from './icons/IconoCarga.vue'
import { onMounted, ref } from 'vue'
import notoRegular from '../assets/Noto_Sans/static/NotoSans-Regular.ttf?inline'
import notoBold from '../assets/Noto_Sans/static/NotoSans-Bold.ttf?inline'

applyPlugin(jsPDF)

const hoy = d3.utcFormat('%d-%m-%Y')(new Date())
const seccionSeleccionada = ref('con_plan')
const modalInforme = ref(null)
const isLoading = ref(null)
const wasFetchigSuccesful = ref(null)
const totalRecursos = ref(null)
const diferenciaRecursos = 74
const totalConjuntos = ref(null)
const dataConPlan = ref(null)
const dataSinPlan = ref(null)
const data = ref()
const listaSectores = ref([])
const generandoReporte = ref(null)
const estatusGeneracionReporte = ref(null)
const encabezadosTablaExportable = ref([
  'Sector',
  'Número de instituciones',
  'Conjuntos en plan',
  'Recursos en plan',
  'Conjuntos publicados',
  'Recursos publicados',
  'Porcentaje',
])
const numeralias = ref({
  Instituciones: 0,
  'Conjuntos en plan': 0,
  'Recursos en plan': 0,
  'Conjuntos publicados': 0,
  'Recursos publicados': 0,
})

const dictColumnasConjuntos = {
  con_plan: {
    nombre_institucion: 'Instituciones',
    conjuntos_plan: 'Conjuntos en plan',
    conjuntos_creados_ckan: 'Conjuntos publicados',
    recursos_plan: 'Recursos en plan',
    suma_recursos: 'Recursos publicados',
    porcentaje_recursos: 'Porcentaje',
  },
  sin_plan: {
    nombre_institucion: 'Instituciones',
    conjuntos_creados_ckan: 'Conjuntos publicados',
    suma_recursos: 'Recursos publicados',
  },
}

function armarDataConPlan() {
  const datum = {}
  dataConPlan.value.forEach((d) => {
    const nombre = `${d.clave_sector}-${d.sector}`
    if (!Object.keys(datum).includes(nombre)) {
      datum[nombre] = {
        clave_sector: d.clave_sector,
        nombre_institucion: 1,
        conjuntos_plan: Number(d.conjuntos_plan) ? Number(d.conjuntos_plan) : 0,
        conjuntos_creados_ckan: Number(d.conjuntos_creados_ckan)
          ? Number(d.conjuntos_creados_ckan)
          : 0,
        recursos_plan: Number(d.recursos_plan) ? Number(d.recursos_plan) : 0,
        suma_recursos: Number(d.suma_recursos) ? Number(d.suma_recursos) : 0,
        porcentaje_recursos: Number(d.porcentaje_recursos)
          ? d3.format(',.2f')(Number(d.porcentaje_recursos))
          : 0,
        tabla: [d],
        show: false,
      }
    } else {
      datum[nombre]['nombre_institucion'] += 1
      datum[nombre]['conjuntos_plan'] = Number(d.conjuntos_plan)
        ? datum[nombre]['conjuntos_plan'] + Number(d.conjuntos_plan)
        : datum[nombre]['conjuntos_plan']

      datum[nombre]['conjuntos_creados_ckan'] = Number(d.conjuntos_creados_ckan)
        ? datum[nombre]['conjuntos_creados_ckan'] + Number(d.conjuntos_creados_ckan)
        : datum[nombre]['conjuntos_creados_ckan']

      datum[nombre]['recursos_plan'] = Number(d.recursos_plan)
        ? datum[nombre]['recursos_plan'] + Number(d.recursos_plan)
        : datum[nombre]['recursos_plan']

      datum[nombre]['suma_recursos'] = Number(d.suma_recursos)
        ? datum[nombre]['suma_recursos'] + Number(d.suma_recursos)
        : datum[nombre]['suma_recursos']

      datum[nombre]['porcentaje_recursos'] = d3.format(',.2f')(
        (Number(datum[nombre]['suma_recursos']) / Number(datum[nombre]['recursos_plan'])) * 100,
      )

      datum[nombre]['tabla'] = [...datum[nombre]['tabla'], d].sort((a, b) =>
        a['nombre_institucion'].localeCompare(b['nombre_institucion']),
      )
    }
  })
  listaSectores.value = Object.keys(datum).sort((a, b) => a.localeCompare(b))
  data.value = datum
}

function armarDataSinPlan() {
  const datum = {}
  dataSinPlan.value.forEach((d) => {
    const nombre = `${d.clave_sector}-${d.sector}`
    if (!Object.keys(datum).includes(nombre)) {
      datum[nombre] = {
        clave_sector: d.clave_sector,
        nombre_institucion: 1,
        conjuntos_creados_ckan: Number(d.conjuntos_creados_ckan)
          ? Number(d.conjuntos_creados_ckan)
          : 0,
        suma_recursos: Number(d.suma_recursos) ? Number(d.suma_recursos) : 0,
        tabla: [d],
        show: false,
      }
    } else {
      datum[nombre]['nombre_institucion'] += 1

      datum[nombre]['conjuntos_creados_ckan'] = Number(d.conjuntos_creados_ckan)
        ? datum[nombre]['conjuntos_creados_ckan'] + Number(d.conjuntos_creados_ckan)
        : datum[nombre]['conjuntos_creados_ckan']

      datum[nombre]['suma_recursos'] = Number(d.suma_recursos)
        ? datum[nombre]['suma_recursos'] + Number(d.suma_recursos)
        : datum[nombre]['suma_recursos']

      datum[nombre]['tabla'] = [...datum[nombre]['tabla'], d].sort((a, b) =>
        a['nombre_institucion'].localeCompare(b['nombre_institucion']),
      )
    }
  })
  listaSectores.value = Object.keys(datum).sort((a, b) => a.localeCompare(b))
  data.value = datum
}

function actualizarSeccion(nv) {
  seccionSeleccionada.value = nv
  if (nv == 'sin_plan') {
    armarDataSinPlan()
  } else if (nv == 'con_plan') {
    armarDataConPlan()
  }
}

async function solicitarDatos() {
  isLoading.value = true

  wasFetchigSuccesful.value = null
  try {
    const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recursos`)
    const response = await request.json()
    totalConjuntos.value = response.conjuntos.length
    totalRecursos.value = response.recursos.length + diferenciaRecursos
    const request_ptar = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/publicacion_instituciones?anio=2026`,
    )
    const response_ptar = await request_ptar.json()
    numeralias.value['Instituciones'] = response_ptar.instituciones
    numeralias.value['Conjuntos en plan'] = response_ptar.conjuntos_plan
    numeralias.value['Conjuntos publicados'] = response_ptar.total_conjuntos
    numeralias.value['Recursos en plan'] = response_ptar.recursos_plan
    numeralias.value['Recursos publicados'] = response_ptar.total_recursos
    dataConPlan.value = JSON.parse(response_ptar.resultados_con_plan)
    dataSinPlan.value = JSON.parse(response_ptar.resultados_sin_plan)
    wasFetchigSuccesful.value = true
  } catch (error) {
    console.log(error)
    wasFetchigSuccesful.value = false
  }
  isLoading.value = false
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
    fonts: { default: 12, small: 8, medium: 10, large: 16, subtitle: 20, title: 24 },
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
    doc.text('Publicación de bases de datos por sector de la APF', config.margins.left, posicionY, {
      maxWidth: 170,
    })
    posicionY += (6 * config.padding) / 2
    // 6. Agregamos el subtitulo
    doc.setFontSize(config.fonts.subtitle)
    doc.text('Plataforma Nacional de Datos Abiertos', config.margins.left, posicionY)
    posicionY += config.padding
    // 7. Agregamos el encabezado
    doc.setFontSize(config.fonts.large)
    doc.text('2026', config.margins.left, posicionY)
    posicionY += config.padding
    // 8. Agregamos los párrafos
    doc.setFont('NotoSans')
    const parrafo1 = renderizar(
      `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
     Los datos reportados se obtuvieron del sistema de gestión de datos CKAN <i>(Comprehensive Knowledge Archive Network)</i> vinculado al Portal de Datos Abiertos.
     Hasta el día ${hoy} se han publicado <b>{{recursos}}</b> bases de datos en <b>{{conjuntos}}</b> conjuntos de datos.
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
    posicionY += (4 * config.padding) / 2

    const parrafo2 = `<p style="font-family: 'Noto Sans', sans-serif; font-size:12px; width:650px">
     El total de bases de datos publicadas reportado en la tabla a continuación considera tanto la creación 
     de nuevas bases de datos, como la sobreescritura de las mismas; esto quiere decir que un archivo 
     reemplaza al anterior con la finalidad de actualizarlo. Asimismo, la estructura del CKAN impide el 
     registro de todas las veces que se lleva a cabo el proceso de sobreescritura y basta con que se abra la 
     sección de edición de una base para que actualice la fecha de última modificación de la misma. En 
     consecuencia, <b>las métricas no reflejan la totalidad del trabajo realizado</b>.
    </p>`

    await doc.html(parrafo2, {
      x: config.margins.left,
      y: posicionY,
      width: 170,
      windowWidth: 650,
    })

    posicionY += (7 * config.padding) / 2
    doc.setFontSize(config.fonts.default)
    doc.autoTable({
      startY: posicionY,
      html: '#tabla-exportable',
      headStyles: {
        fillColor: [97, 18, 50],
        textColor: [255, 255, 255],
        font: 'NotoSans',
        fontSize: 8,
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

    // Guardamos el documento
    doc.save(`reporte-${hoy}.pdf`)

    return 'Exito'
  } catch (error) {
    return `Error: ${error}`
  }
}

const exportar = async function () {
  generandoReporte.value = true
  estatusGeneracionReporte.value = await generarReporte()
  console.log(estatusGeneracionReporte.value)
  generandoReporte.value = false
}

function abrirModal() {
  console.log('Se hizo clic en el modal')
  modalInforme.value?.abrirModal()
}
onMounted(async () => {
  await solicitarDatos()
  armarDataConPlan()
})
</script>
<template>
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
  <div>El modal</div>
  <div class="p-x-3" v-if="wasFetchigSuccesful && !isLoading">
    <h1>Plataforma Nacional de Datos Abiertos</h1>
    <h2>Estadísticas</h2>
    <div class="m-y-5 contenedor-numeralias flex flex-contenido-centrado">
      <div v-for="opcion of Object.keys(numeralias)" :key="opcion" class="tarjeta columna-3">
        <div class="tarjeta-cuerpo p-y-0">
          <div class="numeralia m-y-0 p-y-0">{{ d3.format(',')(numeralias[opcion]) }}</div>
          <div class="etiqueta-numeralia m-y-0 p-y-0">{{ opcion }}</div>
        </div>
      </div>
    </div>
    <h3>Publicación de datos por sector</h3>
    <p>
      La información a continuación se obtuvo exclusivamente del CKAN. Los conjuntos y recursos
      publicados consideran entradas nuevas y actualizaciones.
    </p>
    <div class="m-y-3 flex flex-contenido-centrado">
      <div
        class="columna-12 p-3 texto-color-informacion fondo-color-informacion borde borde-redondeado-8"
      >
        La información de actualización de conjunto y recursos es únicamente una aproximación debido
        a que el CKAN únicamente ofrece la fecha de última modificación.

        <span v-if="seccionSeleccionada == 'con_plan'">
          <br /><br />Tampoco podemos tener certeza de que los recursos publicados y actualizados
          corresponan con lo citado en los Planes de Apertura Institucionales</span
        >
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
    <table v-if="dataConPlan" class="tabla-exportable" :id="`tabla-exportable`" v-show="false">
      <thead class="header-tabla">
        <tr>
          <th v-for="columna of encabezadosTablaExportable" :key="columna">{{ columna }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sector in listaSectores" :key="formatearTexto(sector)">
          <td>
            {{ sector }}
          </td>
          <td
            v-for="columna of Object.keys(dictColumnasConjuntos[seccionSeleccionada])"
            :key="columna"
          >
            {{ data[sector][columna] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-for="sector of listaSectores" :key="`desplegable-${sector}`" class="m-y-4 m-x-3">
      <div class="flex flex-contenido-separado contenedor-sector">
        <h6 class="m-x-2">{{ sector }}</h6>
        <button
          class="boton-tabla"
          v-if="!data[sector]['show']"
          @click="data[sector]['show'] = true"
        >
          <IconoExpandir />
        </button>
        <button
          class="boton-tabla"
          v-if="data[sector]['show']"
          @click="data[sector]['show'] = false"
        >
          <IconoContraer />
        </button>
      </div>

      <table class="tabla-sectores" :id="`tabla-sector-${formatearTexto(sector)}`">
        <thead class="header-tabla">
          <tr>
            <th
              v-for="columna of Object.keys(dictColumnasConjuntos[seccionSeleccionada])"
              :key="columna"
            >
              {{ dictColumnasConjuntos[seccionSeleccionada][columna] }}:
              <span class="total-tabla">{{ data[sector][columna] }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="data[sector]['show']">
          <tr v-for="fila of data[sector]['tabla']" :key="data[sector]['tabla'].indexOf(fila)">
            <td
              v-for="columna in Object.keys(dictColumnasConjuntos[seccionSeleccionada])"
              :key="`td-${fila.sector}-${columna}`"
            >
              <div v-if="columna == 'porcentaje_recursos'">
                {{ d3.format(',.2f')(fila[columna]) }}
              </div>

              <div v-else>{{ fila[columna] }}</div>
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
