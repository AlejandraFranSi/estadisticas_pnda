<script setup>
import * as d3 from 'd3'
import * as dfd from 'danfojs'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const estaCargando = ref(false)
const error = computed(() => dataStore.error)
const dataRecursos = computed(() => dataStore.dataRecursos)
const totalBases = computed(() => dataStore.totalRecursos)

async function solicitarPlanes() {
  const planesApertura = dataRecursos.value.filter(
    (d) => d.nombre_categoria === 'Plan de Apertura de Datos',
  )
  const dict = {
    'Area que genera el recurso de datos': 'area_genera_recurso_datos',
    'A\x81rea que genera el recurso de datos': 'area_genera_recurso_datos',
    'Área que genera el recurso de datos': 'area_genera_recurso_datos',
    'Á\x81rea que genera el recurso de datos': 'area_genera_recurso_datos',
    'Ã\x81rea que genera el recurso de datos': 'area_genera_recurso_datos',
    'Ãrea que genera el recurso de datos': 'area_genera_recurso_datos',
    area_que_genera_recurso_datos: 'area_genera_recurso_datos',
    'Ãrea que genera el recurso de datos': 'area_genera_recurso_datos',
    'ciudadanía objetivo o sector de uso': 'sector_uso',
    'Conjunto de datos': 'conjunto_datos',
    'Conjunto de Datos': 'conjunto_datos',
    conjunto_datos: 'conjunto_datos',
    'Descripcion del conjunto de datos': 'descripcion_conjunto_datos',
    'Descripción del conjunto de datos': 'descripcion_conjunto_datos',
    'Descripción del conjunto de datos ': 'descripcion_conjunto_datos',
    'Descripcion del recurso de datos': 'descripcion_recurso_datos',
    'Descripción del recurso de datos': 'descripcion_recurso_datos',
    'Descripción n del recurso de datos': 'descripcion_recurso_datos',
    descripcion_conjunto_datos: 'descripcion_conjunto_datos',
    descripcion_recurso_datos: 'descripcion_recurso_datos',
    'Fecha de publicacion 2026': 'fecha_publicacion',
    'Fecha de publicación 2026': 'fecha_publicacion',
    'Fecha publicacación 2026': 'fecha_publicacion',
    'Fecha publicación\n 2026': 'fecha_publicacion',
    'Fecha publicacion 2026': 'fecha_publicacion',
    'Fecha publicación 2026': 'fecha_publicacion',
    fecha_publicacion_2026: 'fecha_publicacion',
    formato: 'formato',
    'Formato del recurso': 'formato',
    fundamento: 'fundamento',
    'Importancia del recurso': 'importancia_recurso',
    importancia_recurso: 'importancia_recurso',
    Observaciones: 'observaciones',
    'Periodicidad de\n publicación': 'periodicidad_publicacion',
    'Periodicidad de publicacioln': 'periodicidad_publicacion',
    'Periodicidad de publicacion': 'periodicidad_publicacion',
    'Periodicidad de publicación': 'periodicidad_publicacion',
    periodicidad_publicacion: 'periodicidad_publicacion',
    'Poblacion objetivo o sector de uso': 'sector_uso',
    'Población objetivo o sector de uso': 'sector_uso',
    poblacion_objetivo_o_sector_uso: 'sector_uso',
    'Recurso de datos': 'recurso_datos',
    recurso_datos: 'recurso_datos',
  }
  let datum = []
  for (let i = 0; i < 5; i++) {
    //const recurso = planesApertura[i]
    //console.log(recurso)
    const url = planesApertura[i]['url_recurso']
    const request = await fetch(url)
    //console.log(request)
    const response = await request.text()
    //console.log(response)
    const parsedCsv = d3.csvParse(response)
    parsedCsv.columns = parsedCsv.columns.map((d) => dict[d])
    let dataFrame = new dfd.DataFrame(parsedCsv)
    dataFrame.print()
    //dataFrame.rename({ mapper: dict, axis: 1, inplace: true })
    //datum.push(dataFrame)
  }
  //const elDf = dfd.concat({ dfList: datum, axis: 0 })
  //elDf.print()
  //console.log(elDf)
  //console.log(datum)
}
onMounted(async () => {
  if (totalBases.value == 0) {
    estaCargando.value = true
    await dataStore.armarData()
    estaCargando.value = false
  }
  solicitarPlanes()
})
</script>

<template>
  <div>
    El objetivo de esta sección es evaluar el cumplimiento del plan que entregan las instituciones
    1. ¿Cuáles son las intituciones que más datos abiertos tienen publicados? 2. ¿Cumplen con el
    plan que envían? 3. ¿Incliuyen los metadatos? 4. ¿Envían su diccionario de datos? 5. ¿Envían sus
    metodologías?
  </div>
  <div class="flex flex-contenido-centrado" id="spinner-01">
    <div v-if="estaCargando" id="spinner flex-vertical-centrado">
      <img src="../../public/loading.gif" />
      <p>Solictando datos</p>
    </div>
    <div
      v-if="error"
      id="error-01"
      class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
    >
      <IconoError />
      Ocurrió un error
    </div>
  </div>
</template>
