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
  <div class="p-3 contenedor-general" id="side-bar">
    <div v-if="dataStore.seccion == 'nosotros'" class="m-4">
      <h4 class="leyenda-radio">Selecciona el intervalo temporal de interés</h4>
      <div class="p-2">
        <label for="start" class="etiqueta-tiempo">Fecha de inicio:</label>
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
        <label for="end" class="etiqueta-tiempo">Fecha de cierre:</label>
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
    <div v-else class="m-4">
      <fieldset>
        <legend class="leyenda-radio">Selecciona el año del que deseas ver la información</legend>
        <div>
          <input v-model="anioSeleccionado" type="radio" id="2026" value="2026" name="grupo_anio" />
          <label for="2026" class="selector-anio">2026</label>
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
          <label for="2027" class="selector-anio">2027</label>
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
          <label for="2027" class="selector-anio">2028</label>
        </div>
      </fieldset>
    </div>
  </div>
</template>
<style scoped>
.contenedor-general {
  /*background-color: var(--color-secundario-10);*/
  background-image: linear-gradient(
    to bottom,
    var(--color-secundario-11),
    var(--color-secundario-7)
  );
  color: var(--color-neutro-1);
}
.etiqueta-tiempo {
  color: white;
  font-size: 12px;
}

.leyenda-radio {
  color: var(--color-neutro-1);
  font-size: 16px;
}
.selector-anio {
  color: white;
  font-size: 14px;
}
</style>
