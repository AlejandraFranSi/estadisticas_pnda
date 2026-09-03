<script setup>
import IconoEstadisticas from './icons/IconoEstadisticas.vue'
console.log('Cargamos el encabezado')
</script>
<template>
  <div class="contenedor-header flex">
    <h3><IconoEstadisticas /> Estadísticas PNDA</h3>
    <div class="secciones flex">
      <button>Nosotros</button>
      <button disabled>Instituciones</button>
    </div>
  </div>
</template>
<style scoped>
.contenedor-header {
  padding: 0px 16px;
  max-height: 80px;
  background-color: var(--color-secundario-10);
  color: var(--color-neutro-0);
  align-items: center;
  gap: 16px;
}
.secciones {
  justify-self: flex-end;
  gap: 8px;
  position: absolute;
  right: 100px;
}
</style>
