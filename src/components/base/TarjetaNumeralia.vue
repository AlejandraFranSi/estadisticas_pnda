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
  <div class="p-x-3 p-y-1 m-x-1 m-y-2 contenedor-numeralia flex">
    <div class="columna-16 m-0 p-0 valor">{{ props.valor }}</div>
    <div class="columna-16 m-0 p-0 titulo">
      {{ props.titulo }}
    </div>
  </div>
</template>
<style scoped>
.contenedor-numeralia {
  width: 85%;
  border-radius: 16px;
  background-color: var(--color-neutro-1);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.25) !important;
  gap: 8px;
}
.valor {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
.titulo {
  background-color: var(--color-secundario-7);
  color: var(--color-neutro-0);
  padding: 8px;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}
</style>
