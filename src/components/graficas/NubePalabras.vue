<script setup>
import { onMounted } from 'vue'

async function calcularPromedio() {
  const request = await fetch('http://localhost:8000/api/promedio_semanal')
  console.log('la peticion del promedio: ', request)
}
onMounted(async () => {
  console.log('Solicitamos el promedio semanal')
  await calcularPromedio()
})
</script>
<template>
  <div>Esta es una nube de palabras que muestra las etiquetas vinculadas a más bases de datos</div>
</template>
