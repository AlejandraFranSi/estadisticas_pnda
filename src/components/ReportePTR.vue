<script setup>
import ObjetivosAnuales from './secciones/ObjetivosAnuales.vue'
import HistoricoTrimestral from './secciones/HistoricoTrimestral.vue'
import InformacionDiaria from './secciones/InformacionDiaria.vue'
import RelacionBases from './secciones/RelacionBases.vue'
</script>
<template>
  <div class="p-3">
    <ObjetivosAnuales />
    <HistoricoTrimestral />
    <InformacionDiaria />
    <RelacionBases />
    <div class="button-actions">
      <button class="boton-primario">Exportar como pdf</button>
    </div>
  </div>
</template>
