<script setup>
import { computed, watch } from 'vue'
import { useDataStore } from '@/stores/data.js'

const dataStore = useDataStore()
const modoAnalisis = computed({
  get: () => (dataStore.metodo === 'actualizados' ? true : false),
  set: () => dataStore.actualizarMetodo(),
})

watch(modoAnalisis, (nv) => {
  console.log(dataStore.metodo)
  console.log(nv)
})
</script>
<template>
  <div class="the-slider">
    Únicos
    <label class="switch">
      <input type="checkbox" v-model="modoAnalisis" />
      <span class="slider"></span>
    </label>
    Actualizados
  </div>
</template>
<style scoped lang="scss">
.the-slider {
  --container-height: 20px;
  --container-radius: 16px;
  --container-width: 40px;
  --slider-margins: 4px;
  display: flex;
  justify-content: center;
  padding: 8px;
  color: var(--color-secundario-12);
}
.switch {
  position: relative;
  display: inline-block;
  width: var(--container-width);
  height: var(--container-height);
  margin: 0px 8px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-secundario-7);
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: var(--container-radius);
}

.slider:before {
  position: absolute;
  content: '';
  height: calc(var(--container-height) - var(--slider-margins));
  width: calc(var(--container-height) - var(--slider-margins));
  left: calc(var(--slider-margins) / 2);
  top: calc(var(--slider-margins) / 2);
  background-color: var(--color-neutro-1);
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider:before {
  background-color: var(--color-neutro-1);
  transform: translateX(calc(((var(--container-width) - var(--container-height)))));
}
</style>
