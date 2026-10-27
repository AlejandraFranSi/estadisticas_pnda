<script setup>
import ElEncabezado from './components/base/ElEncabezado.vue'
import BarraLateral from './components/base/BarraLateral.vue'
import ReporteNosotros from './components/ReporteNosotros.vue'
import ReportePTAR from './components/ReportePTAR.vue'
import { computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const mostrarSidebar = computed(() => dataStore.mostrarBarra)
const cualquierModalAbierto = computed(() => dataStore.modalAbierto)
watch(
  cualquierModalAbierto,
  (valor) => {
    document.body.classList.toggle('overflow-hidden', valor)
  },
  { immediate: true },
)
</script>

<template>
  <div class="fondo-negro" v-if="cualquierModalAbierto" @click="dataStore.cerrarModal"></div>
  <header>
    <ElEncabezado class="header" />
  </header>

  <main>
    <BarraLateral :class="mostrarSidebar ? 'side-bar-expandida' : 'side-bar-contraida'" />
    <div :class="mostrarSidebar ? 'contenido-contraido' : 'contenido-largo'">
      <ReporteNosotros v-if="dataStore.seccion === 'nosotros'" />
      <ReportePTAR v-if="dataStore.seccion === 'ptar'" />
      <!--<VistaNosotros v-if="dataStore.seccion === 'nosotros'" />
      <VistaInstituciones v-if="dataStore.seccion === 'instituciones'" />-->
    </div>
  </main>
</template>

<style>
@import url('https://framework-gb.cdn.gob.mx/gm/v3/qa/assets/styles/main.css');

:root {
  --color-secundario-1: #fff6f7;
  --color-secundario-2: #fdf0f4;
  --color-secundario-3: #f1cdd8;
  --color-secundario-4: #cd8c9f;
  --color-secundario-5: #bc6982;
  --color-secundario-6: #ac4564;
  --color-secundario-7: #9b2247;
  --color-secundario-8: #8d1e42;
  --color-secundario-9: #7e1a3d;
  --color-secundario-10: #701637;
  --color-secundario-11: #611232;
  --color-secundario-12: #4b0c27;
  --color-primario-3: #a57f2c;
  --color-primario-4: #e6d194;
  --color-neutro-1: #f7f7f9;
  --color-neutro-2: #e1e1e8;
  --color-neutro-3: #bdbdc1;
  --color-neutro-4: #98989a;
  --color-neutro-5: #7d7c81;
  --color-neutro-6: #626167;
  --color-neutro-7: #47454e;
  --color-encabezados: #161a1d;
}
body {
  background-color: var(--color-neutro-1);
  font-size: 16px;
}
.overflow-hidden {
  overflow: hidden;
}

.fondo-negro {
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100vh;
  width: 100vw;
  opacity: 0.7;
  background-color: black;
  z-index: 4;
}

.header {
  position: fixed;
  top: 0px;
  width: 100vw;
  z-index: 3;
}

.side-bar-contraida {
  position: fixed;
  top: 80px;
  width: 48px;
  height: calc(100vh - 80px);
}

.side-bar-expandida {
  position: fixed;
  top: 80px;
  width: 15vw;
  height: calc(100vh - 80px);
}

.contenido-largo {
  width: calc(100vw - 48px);
  position: absolute;
  left: 48px;
  top: 80px;
  overflow-y: scroll;
}
.contenido-contraido {
  width: 85vw;
  position: absolute;
  left: 15vw;
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
