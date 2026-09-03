import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as d3 from 'd3'

export const useDataStore = defineStore('data', () => {
  const dataConjuntos = ref([])
  const dataRecursos = ref([])
  const error = ref(null)
  const totalConjuntos = computed(() => d3.format(',')(dataConjuntos.value.length))
  const totalRecursos = computed(() => d3.format(',')(dataRecursos.value.length))
  const categorias = computed(() =>
    Array.from(new Set(dataRecursos.value.map((d) => d.nombre_categoria))),
  )
  const totalCategorias = computed(() => d3.format(',')(categorias.value.length))
  const etiquetas = ref([])
  const setEtiquetas = computed(() =>
    Array.from(new Set(etiquetas.value)).sort((a, b) => a.localeCompare(b)),
  )
  const totalEtiquetas = computed(() => d3.format(',')(setEtiquetas.value.length))

  const armarData = async function () {
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
        dataConjuntos.value = [...dataConjuntos.value, ...result.result]
        result.result?.forEach((d) => {
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
            creator_user_id: d.creator_user_id,
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
            dataRecursos.value.push(recurso)
          })
        })
      } catch (error) {
        error.value = error
      }
      offset += 1000
    } while (true)
  }

  return {
    dataConjuntos,
    dataRecursos,
    error,
    totalConjuntos,
    totalRecursos,
    categorias,
    totalCategorias,
    setEtiquetas,
    totalEtiquetas,
    armarData,
  }
})
