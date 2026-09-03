<script setup>
import * as d3 from 'd3'
import * as dfd from 'danfojs'
import GraficoCalendario from './graficas/GraficoCalendario.vue'
import GraficoRidgeline from './graficas/GraficoRidgeline.vue'
import NubePalabras from './graficas/NubePalabras.vue'
import IconoError from './icons/IconoError.vue'
import { computed, onMounted, ref } from 'vue'

const estaCargando = ref(false)
const error = ref(null)
const data = ref([])
const totalBases = computed(() => d3.format(',')(data.value.length))
const totalCategorias = computed(() =>
  Array.from(new Set(data.value.map((d) => d.nombre_categoria))),
)
const etiquetas = ref([])
const setEtiquetas = computed(() =>
  Array.from(new Set(etiquetas.value)).sort((a, b) => a.localeCompare(b)),
)
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
        //console.log(d)
        let conjunto = {
          nombre_categoria: d.groups[0].display_name,
          clave_categoria: d.groups[0].name,
          descripcion_categoria: d.groups[0].description,
          id_categoria: d.groups[0].id,
          nombre_institucion: d.organization.title,
          descripcion_institucion: d.organization.description,
          imagen_institucion: d.organization.image_url,
          nombre_paquete: d.title,
          clave_paquete: d.name,
          notas_paquete: d.notes,
          etiquetas: d.tags,
          id_paquete: d.id,
        }
        etiquetas.value = [...etiquetas.value, ...d.tags.map((t) => t.display_name)]
        d.resources.forEach((r) => {
          const recurso = {
            ...conjunto,
            id_recurso: r.id,
            nombre_recurso: r.name,
            descripcion_recurso: r.description,
            url_recurso: r.url,
            frecuencia_actualizacion: r.update_frequency,
            creacion_recurso: r.created,
          }
          data.value.push(recurso)
        })
      })
      offset += 1000
    } catch (error) {
      error.value = error
    }
  } while (true)
  //totalBases.value = d3.format(',')(data.value.length)
  estaCargando.value = false
}

// Esto es para las categorias
const dataAgrupada = ref(null)
const maximoXcategoria = ref(null)
const timeDomain = [
  '03/2025',
  '04/2025',
  '05/2025',
  '06/2025',
  '07/2025',
  '08/2025',
  '09/2025',
  '10/2025',
  '11/2025',
  '12/2025',
  '01/2026',
  '02/2026',
  '03/2026',
  '04/2026',
  '05/2026',
  '06/2026',
  '07/2026',
  '08/2026',
  '09/2026',
]

const prepararData = function () {
  const datum = data.value.map((d) => {
    return {
      categoria: d.nombre_categoria,
      fecha: d3.timeFormat('%m/%Y')(new Date(d.creacion_recurso.slice(0, 23))),
      reps: 1,
    }
  })

  let df = new dfd.DataFrame(datum)
  df = df.groupby(['categoria', 'fecha']).sum()
  maximoXcategoria.value = df['reps_sum'].max()
  dataAgrupada.value = d3.groups(dfd.toJSON(df), (d) => d.categoria)
  dataAgrupada.value.forEach((d) => {
    let entradasOrdenadas = []
    for (let mes of timeDomain) {
      let prueba = d[1].find((d) => d.fecha === mes)
      if (!prueba) {
        entradasOrdenadas.push({ categoria: d[0], fecha: mes, reps_sum: 0 })
      } else {
        entradasOrdenadas.push(prueba)
      }
    }
    d[1] = entradasOrdenadas
  })

  dataAgrupada.value = dataAgrupada.value.sort((a, b) => a[0].localeCompare(b[0]))
}
onMounted(async () => {
  await armarBase()
  prepararData()
})
</script>

<template>
  <div class="contenedor-nosotros m-2" id="estadisticas-nosotros">
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

    <div v-if="!estaCargando && data.length > 0" id="contenedor-estadisticas">
      <h3>Numeralias generales:</h3>
      <div class="flex flex-contenido-centrado" id="numeralias-grales">
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Total de bases de datos:
          <button clasS="boton-primario boton-chico">{{ totalBases }}</button>
        </div>
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Categorías registradas:
          <button clasS="boton-primario boton-chico">
            {{ d3.format(',')(totalCategorias.length) }}
          </button>
        </div>
        <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
          Etiquetas empleadas:
          <button clasS="boton-primario boton-chico">
            {{ d3.format(',')(setEtiquetas.length) }}
          </button>
        </div>
      </div>
      <h3>Frecuencia de publicación</h3>
      <GraficoCalendario :data="data" />

      <h3>Publicacion por categoría</h3>
      <div v-if="dataAgrupada">
        <GraficoRidgeline
          v-for="categoria in dataAgrupada"
          :titulo="categoria[0]"
          :data="categoria"
          :x-domain="timeDomain"
          :y-max="maximoXcategoria"
        />
      </div>

      <h3>Etiquetas más usadas</h3>
      <NubePalabras />
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
