<script setup></script>

<template>
  <div id="encabezado">
    <Icono color="white" />
    <ul>
      <li>Archivo</li>
    </ul>
    <Buscador />
  </div>
</template>

<style lang="scss" scoped>
#encabezado {
  position: fixed;
  z-index: 99;
  background-color: $dolor;
  width: 100vw;
  display: flex;
  align-items: center;
}

#logoArca {
  height: 50px;
  width: auto;
}
</style>
