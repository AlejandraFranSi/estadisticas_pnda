<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Solicitamos la información de los planes de apertura')
})
</script>
<template>
  <div>
    El reporte para el ptar cuantas instituciones y cuantas bases publicadas <br />
    *** contar cuanto dicen los planes y cuántas se han publicado, nos interesa la cantidad (tabla)
    *** cuantas instituciones por sector cruzando la info del pndasi y del ckan (tabla) <br />
    ptar: capacitaciones, lo principal son las incidencias. En estas primeras entregas se va a
    implementar solo el gráfico de interacciones
  </div>
</template>
