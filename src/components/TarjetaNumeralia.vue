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
    <button clasS="boton-primario boton-chico">{{ props.valor }}</button>
  </div>
</template>
