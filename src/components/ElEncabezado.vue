<script setup>
import IconoEstadisticas from './icons/IconoEstadisticas.vue'
import { useDataStore } from '@/stores/data.js'
const dataStore = useDataStore()
</script>
<template>
  <div class="contenedor-header flex">
    <h3><IconoEstadisticas /> Estadísticas PNDA</h3>
    <div class="secciones flex">
      <button
        :class="dataStore.seccion === 'nosotros' ? 'selected' : 'no-selected'"
        @click="dataStore.actualizarSeccion('nosotros')"
      >
        Nosotros
      </button>
      <button
        :class="dataStore.seccion === 'instituciones' ? 'selected' : 'no-selected'"
        @click="dataStore.actualizarSeccion('instituciones')"
      >
        Instituciones
      </button>
    </div>
  </div>
</template>
<style scoped>
.contenedor-header {
  padding: 0px 8px;
  max-height: 80px;
  background-color: var(--color-secundario-11);
  color: var(--color-neutro-0);
  align-items: center;
  gap: 16px;
}
.secciones {
  gap: 8px;
  position: absolute;
  right: 16px;
  height: 80px;
}

button {
  height: 100%;
  background-color: var(--color-secundario-11);
  color: var(--color-neutro-0);
  border-radius: 0px;
}

button:hover {
  background-color: var(--color-secundario-7);
}

.selected {
  border-bottom: solid 4px var(--color-secundario-6);
}

@media (max-width: 580px) {
  .contenedor-header {
    margin-bottom: 40px;
  }
  .secciones {
    right: 0px;
    top: 80px;
    height: 40px;
    width: 100vw;
    padding: 0px 8px;
    gap: 0px;
    background-color: var(--color-secundario-11);
    border-top: solid 1px var(--color-secundario-6);
  }
  button {
    width: 50%;
  }
}
</style>
