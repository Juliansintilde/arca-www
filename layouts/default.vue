<script setup>
import { usarGeneral } from '~~/cerebros/general';

const cerebro = usarGeneral();

if (!cerebro.datosCargados) {
  await useAsyncData('general', cerebro.cargarGeneral);
}
</script>

<template>
  <div id="contenedor">
    <MenuGeneral />

    <main role="main">
      <slot />
    </main>
    <Guardaescobas />
  </div>
</template>

<style lang="scss">
@use 'sass:color';

main {
  display: flex;
  flex-direction: column;
}
#contenedor {
  display: flex;
  flex-direction: column;
  color: $profundidad;
}
.contenedor {
  display: flex;
}
// Teléfonos horizontal
@media (min-width: $minCelular) {
}
// Pantallas medianas (Tablets)
// @media (min-width: $minTablet) {
// }
// Dispositivos grandes y pantallas medianas
@media (min-width: $minPantalla) {
}
// Pantallas grandes
@media (min-width: $minPantallaGrande) {
}
</style>
