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
  --color-secundario-1: #f6ebef;
  --color-secundario-2: #f2e6ec;
  --color-secundario-3: #f2e6ec;
  --color-secundario-4: #e2cfd8;
  --color-secundario-5: #d3b9c4;
  --color-secundario-6: #6b2a44;
  --color-secundario-7: #6b223f;
  --color-secundario-8: #661b39;
  --color-secundario-9: #611232;
  --color-secundario-10: #51132c;
  --color-secundario-11: #471529;
  --color-secundario-12: #3e1626;
  --color-primario-3: #751a35;
  --color-primario-4: #9a2246;
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
  /*color: var(--color-neutro-7);*/
}
h5 {
  font-size: 20px;
  font-weight: bold;
  /*color: var(--color-neutro-7);*/
}
</style>
