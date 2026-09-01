<script setup>
import Encabezado from './components/Encabezado.vue'
import VistaInstituciones from './components/VistaInstituciones.vue'
import VistaNosotros from './components/VistaNosotros.vue'
</script>

<template>
  <header>
    <Encabezado />
  </header>

  <main>
    <VistaNosotros />
    <!-- <VistaInstituciones /> -->
  </main>
</template>

<style>
body {
  background-color: var(--color-neutro-1);
}
</style>
