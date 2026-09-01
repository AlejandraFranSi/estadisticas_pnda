<script setup>
import * as d3 from 'd3'
import IconoError from './icons/IconoError.vue'
import { onMounted, ref } from 'vue'
import GraficoLinea from './GraficoLinea.vue'

const estaCargando = ref(false)
const error = ref(null)
const data = ref([])
const total_bases = ref(0)
const armarBase = async function () {
  estaCargando.value = true
  let offset = 0
  do {
    try {
      const request = await fetch(
        `https://www.datos.gob.mx/api/3/action/current_package_list_with_resources?limit=1000&offset=${offset}`,
      )
      const result = await request.json()
      if (result.result?.length === 0) {
        break
      }
      result.result?.forEach((d) => {
        let conjunto = {
          nombre_categoria: d.groups.display_name,
          clave_categoria: d.groups.name,
          descripcion_categoria: d.groups.description,
          id_categoria: d.groups.id,
          nombre_institucion: d.organization.title,
          descripcion_institucion: d.organization.description,
          imagen_institucion: d.organization.image_url,
          nombre_paquete: d.title,
          clave_paquete: d.name,
          notas_paquete: d.notes,
          etiquetas: d.tags,
          id_paquete: d.id,
        }

        d.resources.forEach((r) => {
          const recurso = {
            ...conjunto,
            id_recurso: r.id,
            nombre_recurso: r.name,
            descripcion_recurso: r.description,
            url_recurso: r.url,
            frecuencia_actualizacion: r.update_frequency,
          }
          data.value.push(recurso)
        })
      })
      offset += 1000
    } catch (error) {
      error.value = error
    }
  } while (true)
  total_bases.value = d3.format(',.2r')(data.value.length)
  estaCargando.value = false
}
onMounted(() => {
  armarBase()
})
</script>

<template>
  <div class="contenedor-nosotros m-2">
    El objetivo de esta vista es mostrar nuestro trabajo.
    <ol>
      <li>¿Cuántas bases de datos se han publicado?</li>
      <li>¿Cuál es la periodicidad de publicación de las bases?</li>
      <li>¿Cuántas bases de cada categoría?</li>
      <li>¿Cuántas con cada una de las etiquetas?</li>
    </ol>

    <div class="flex flex-contenido-centrado">
      <div v-if="estaCargando" id="spinner flex-vertical-centrado">
        <img src="../../public/loading.gif" />
        <p>Solictando datos</p>
      </div>
      <div
        v-if="error"
        id="error"
        class="p-2 flex flex-contenido-centrado texto-color-error fondo-color-error borde borde-redondeado-8"
      >
        <IconoError />
        Ocurrió un error
      </div>
    </div>

    <div v-if="!estaCargando && data.length > 0">
      <div class="flex flex-contenido-inicio">
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Total de bases de datos:
          <button clasS="boton-primario boton-chico">{{ total_bases }}</button>
        </div>
        <GraficoLinea :data="data" />
      </div>
    </div>
  </div>
</template>
<style scoped>
ol,
li {
  margin: 4px;
}

.numerico {
  background-color: var(--color-secundario-3);
}
</style>
