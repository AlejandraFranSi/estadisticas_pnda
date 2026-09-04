import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as d3 from 'd3'

export const useDataStore = defineStore('data', () => {
  const seccion = ref('instituciones')
  const dataConjuntos = ref([])
  const dataRecursos = ref([])
  const error = ref(null)
  const totalConjuntos = computed(() => d3.format(',')(dataConjuntos.value.length))
  const totalRecursos = computed(() => d3.format(',')(dataRecursos.value.length))
  const categorias = ref(null)
  const totalCategorias = computed(() => d3.format(',')(categorias.value.length))
  const setEtiquetas = ref(null)
  const totalEtiquetas = computed(() => d3.format(',')(setEtiquetas.value.length))

  const actualizarSeccion = function (nuevaSeccion) {
    seccion.value = nuevaSeccion
  }
  const armarData = async function () {
    try {
      const request = await fetch('http://localhost:8000/api/resources')
      const response = await request.json()
      dataConjuntos.value = response.conjuntos
      dataRecursos.value = response.recursos
      categorias.value = response.categorias
      setEtiquetas.value = response.etiquetas
    } catch (error) {
      console.log(error)
    }
  }

  return {
    seccion,
    dataConjuntos,
    dataRecursos,
    error,
    totalConjuntos,
    totalRecursos,
    categorias,
    totalCategorias,
    setEtiquetas,
    totalEtiquetas,
    actualizarSeccion,
    armarData,
  }
})
