<script setup>
import ElEncabezado from './components/base/ElEncabezado.vue'
import BarraLateral from './components/base/BarraLateral.vue'
import ReporteNosotros from './components/ReporteNosotros.vue'
import ReportePTAR from './components/ReportePTAR.vue'
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
      <ReporteNosotros v-if="dataStore.seccion === 'nosotros'" />
      <ReportePTAR v-if="dataStore.seccion === 'ptar'" />
      <!--<VistaNosotros v-if="dataStore.seccion === 'nosotros'" />
      <VistaInstituciones v-if="dataStore.seccion === 'instituciones'" />-->
    </div>
  </main>
</template>

<style>
/*#3B364A*/

:root {
  --color-neutro-7: #47454e;
}
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
h4 {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-neutro-7);
}
h5 {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-neutro-7);
}
</style>
