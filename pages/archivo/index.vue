<script setup>
import { usarArchivo } from '~~/cerebros/archivo';
import { gql } from '~~/utilidades/ayudas';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const ruta = useRoute();

const { paginas } = await obtenerDatos(
  'indiceArchivo',
  gql`
    query {
      paginas(filter: { slug: { _eq: "archivo" } }, limit: 1) {
        titulo
        slug
        descripcion
        contenido
        banner {
          id
          title
        }
      }
    }
  `
);

useHead(elementosCabeza(paginas[0] ? paginas[0] : {}, ruta.path));

const cerebroArchivo = usarArchivo();

const pagina = ref(null);
pagina.value = paginas[0];
cerebroArchivo.paginaActual = '';
const searchClient = instantMeiliSearch('http://localhost:7700', '81086ece-7c22-46ac-b867-7f3ecdb00c18');

// Nuxt normaliza los nombres de "layouts" a kebab-case.
definePageMeta({ layout: 'con-buscador', keepalive: true });

// const { data, pending } = obtenerDatosAsinc(
//   'busqueda',
//   gql`
// query {

// }
// `
// );
</script>

<template>
  <MenuVistas />
  <h1>{{ pagina.titulo }}</h1>

  <ais-instant-search :search-client="searchClient" index-name="obras">
    <ais-search-box />
    <ais-hits>
      <template v-slot:item="{ item }">
        <p>{{ item.titulo }}</p>
        <i>{{ JSON.stringify(item, null, 2) }}</i>
      </template>
    </ais-hits>
  </ais-instant-search>
</template>

<style lang="scss" scoped></style>
