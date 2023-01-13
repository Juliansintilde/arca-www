<script setup>
const busqueda = ref('');
const ruta = useRouter();

function validarBusqueda(evento) {
  if (evento.key === 'Enter') {
    ruta.push({ path: `/archivo`, query: { busqueda: busqueda.value } });
  }
}
</script>

<template>
  <input v-model="busqueda" type="search" placeholder="buscar" @keyup="validarBusqueda" />
</template>

<style lang="scss" scoped>
input {
  border: 2px solid $dolor;
  border-radius: 25px;
  width: 90%;
  display: flex;
  height: 40px;
  justify-content: center;
  background-color: #faf5ec;
  font-family: 'Work Sans';
  text-align: center;
  text-transform: uppercase;
  margin-left: 5%;
}

input:focus {
  outline: none;
}
</style>
