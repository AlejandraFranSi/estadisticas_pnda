<script setup>
import ElEncabezado from './components/ElEncabezado.vue'
import BarraLateral from './components/BarraLateral.vue'
import ReportePTR from './components/ReportePTR.vue'
import VistaInstituciones from './components/VistaInstituciones.vue'
import VistaNosotros from './components/VistaNosotros.vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
</script>

<template>
  <header>
    <ElEncabezado class="header" />
  </header>

  <main>
    <BarraLateral class="side-bar" />
    <div class="contenido">
      <ReportePTR v-if="dataStore.seccion === 'ptr'" />
      <VistaNosotros v-if="dataStore.seccion === 'nosotros'" />
      <VistaInstituciones v-if="dataStore.seccion === 'instituciones'" />
    </div>
  </main>
</template>

<style>
body {
  background-color: var(--color-neutro-1);
}
.header {
  position: fixed;
  top: 0px;
  width: 100vw;
  z-index: 3;
}
.side-bar {
  position: fixed;
  top: 80px;
  width: 20vw;
  height: calc(100vh - 80px);
}
.contenido {
  width: 80vw;
  position: absolute;
  left: 20vw;
  top: 80px;
  overflow-y: scroll;
}
</style>
