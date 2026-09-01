<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  data: {
    default: [],
    type: Array,
  },
})

console.log(props.data)
</script>
<template>
  <div class="contenedo-lineas">Aqui va el gráfico de lineas</div>
</template>
