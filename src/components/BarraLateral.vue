<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const fechaInicio = computed({
  get() {
    return dataStore.fechaInicio
  },
  set(nv) {
    dataStore.fechaInicio = nv
  },
})
const fechaFinal = computed({
  get() {
    return dataStore.fechaFinal
  },
  set(nv) {
    dataStore.fechaFinal = nv
  },
})
</script>
<template>
  <div class="p-1">
    <h4>Selecciona el intervalo temporal de interés</h4>
    <div class="p-2">
      <label for="start">Fecha de inicio:</label>
      <input
        type="date"
        id="start"
        name="start-date"
        min="2025-06-01"
        max="2026-09-21"
        v-model="fechaInicio"
      />
    </div>
    <div class="p-2">
      <label for="end">Fecha de cierre:</label>
      <input
        type="date"
        id="end"
        name="end-date"
        min="2025-06-01"
        max="2026-09-21"
        v-model="fechaFinal"
      />
    </div>
  </div>
</template>
<style scoped>
div {
  background-color: var(--color-secundario-3);
}
</style>
