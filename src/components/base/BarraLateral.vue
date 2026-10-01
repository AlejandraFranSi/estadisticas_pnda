<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const anioSeleccionado = ref(2026)
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
  <div class="p-3" id="side-bar">
    <div v-if="dataStore.seccion == 'nosotros'">
      <h4>Selecciona el intervalo temporal de interés</h4>
      <p>Estos controles no modifican las secciones de Objetivos Anuales ni Histórico Trimestral</p>
      <div class="p-x-2">
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
    <div v-else>
      <h4>Selecciona el año del que deseas ver la información</h4>
      <fieldset>
        <legend class="leyenda-radio">Select a maintenance drone:</legend>
        <div>
          <input v-model="anioSeleccionado" type="radio" id="2026" value="2026" name="grupo_anio" />
          <label for="2026">2026</label>
        </div>
        <div>
          <input
            v-model="anioSeleccionado"
            type="radio"
            id="2027"
            value="2027"
            name="grupo_anio"
            disabled
          />
          <label for="2027">2027</label>
        </div>
        <div>
          <input
            v-model="anioSeleccionado"
            type="radio"
            id="2028"
            value="2028"
            name="grupo_anio"
            disabled
          />
          <label for="2027">2028</label>
        </div>
      </fieldset>
    </div>
  </div>
</template>
<style scoped>
div {
  background-color: var(--color-secundario-1);
}

.leyenda-radio {
  color: var(--color-secundario-10);
  font-weight: bold;
}
fieldset {
  background-color: red!;
}
</style>
