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
  <div class="p-x-3 p-y-1 m-1">
    {{ props.titulo }}:
    <span>{{ props.valor }}</span>
  </div>
</template>
<style scoped>
div {
  width: 100%;
  border-radius: 16px;
  background-color: var(--color-secundario-2);
}
span {
  background-color: var(--color-primario-3);
  color: var(--color-neutro-0);
  padding: 0px 8px;
  border-radius: 8px;
  width: 100%;
}
</style>
