<script setup>
import ElEncabezado from './components/ElEncabezado.vue'
import VistaInstituciones from './components/VistaInstituciones.vue'
import VistaNosotros from './components/VistaNosotros.vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
</script>

<template>
  <header>
    <ElEncabezado />
  </header>

  <main>
    <VistaNosotros v-if="dataStore.seccion === 'nosotros'" />
    <VistaInstituciones v-if="dataStore.seccion === 'instituciones'" />
  </main>
</template>

<style>
body {
  background-color: var(--color-neutro-1);
}
</style>
