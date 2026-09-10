<script setup>
const props = defineProps({
  titulo: {
    default: 'sin-titulo',
    type: String,
  },
  valor: {
    default: '0',
    type: String,
  },
})
</script>
<template>
  <div class="columna-3 numerico tarjeta p-x-3 p-y-1 m-1">
    {{ props.titulo }}:
    <span>{{ props.valor }}</span>
  </div>
</template>
<style scoped>
span {
  background-color: var(--color-secundario-8);
  color: var(--color-neutro-0);
  padding: 0px 8px;
  border-radius: 8px;
}
</style>
