<script setup>
import { defineProps, onMounted } from 'vue'
import * as dfd from 'danfojs'

const props = defineProps({
  data: {
    default: [],
    type: Array,
  },
})

const cellSize = 16 // height of a day
const height = cellSize * 7 // height of a week (5 days + padding)
const width = (cellSize + 1.5) * 53 // width of the chart

onMounted(() => {
  console.log(props.data)
  let dataframe = new dfd.DataFrame(props.data).resetIndex({ drop: true })
  //dataframe.print()
  console.log(dataframe.columns)
  dataframe
    .column('creacion_recurso')
    .apply((x) => {
      let fecha = new Date(x)
      let dia = fecha.getDate()
      let mes = fecha.getMonth()
      let anio = fecha.getFullYear()
      return `${dia}/${mes}/${anio}`
    })
    .valueCounts()
    .print()
  //.column('creacion_recurso').valueCounts().print()
})
</script>
<template>
  <div class="contenedo-lineas">Aqui va el gráfico de lineas</div>
</template>
