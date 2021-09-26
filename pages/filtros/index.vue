<template>
  <div>
    <template v-if="$fetchState.pending">
      <div>
        <h1>Pendiente...</h1>
      </div>
    </template>

    <template v-else-if="$fetchState.error">
      <div>
        <h1 class="error">{{ $fetchState.error.message }}</h1>
      </div>
    </template>

    <template v-else>
      <div class="contenedor-pagina">
        <DescripcionGaleria :numero="obras.length" :busqueda="$route.query.autor" />
        <EtiquetasGaleria :busqueda="$route.query.autor" />
        <Galeria :obras="obras" />
        <MenuVistas :busqueda="$route.query.autor" />
      </div>
    </template>
  </div>
</template>

<script>
import { gql } from 'nuxt-graphql-request';

export default {
  layout: 'conBuscador',
  data() {
    return {
      pagina: {},
      obras: [],
    };
  },

  async fetch() {
    const autor = this.$route.query.autor;
    // const pais = this.$route.query.pais;
    // const categoria = this.$route.query.categoria1;

    const query = gql`
      query {
        artworks(filter: { author_id: { lastname: { _eq: "${autor}" } } }, limit: -1) {
          id
          title
          annotation_date
          synthesis
          latitude_current
          longitude_current
          image {
            id
            title
          }
          author_id {
            id
            name
            lastname
            biography
          }
          actual_country_id {
            id
            name_spanish
          }
        }
      }
    `;

    // if (categoria && autor && pais) {
    /*  const query = gql`
       query {
        artworks(filter: { _or: [
            {category_1_id: { name: { _eq: "${categoria}" } }},
            {category_2_id: { name: { _eq: "${categoria}" } }},
            {category_3_id: { name: { _eq: "${categoria}" } }},
            {category_4_id: { name: { _eq: "${categoria}" } }},
            {category_5_id: { name: { _eq: "${categoria}" } }},
        ] _and: [
            {author_id: { lastname: { _eq: "${autor}" } }},
            { _or: [ 
              {actual_country_id: { name_spanish: { _eq: "${pais}" } }}, 
              {origin_country_id: { name_spanish: { _eq: "${pais}" } }}, 
            ] }
        ] }, limit: -1) {
          id
          title
          annotation_date
          synthesis
          latitude_current
          longitude_current
          actual_country_id {
            id
            name_spanish
          }
          origin_country_id {
            id
            name_spanish
          }
          author_id {
            id
            name
            lastname
            biography
          }
          image {
            id
            title
          }
          category_1_id {
            id
            name
          }
          category_2_id {
            id
            name
          }
          category_3_id {
            id
            name
          }
          category_4_id {
            id
            name
          }
          category_5_id {
            id
            name
          }
        }
      }
    `; */
    // }

    const { artworks } = await this.$graphql.principal.request(query);

    if (artworks && artworks.length) {
      this.obras = artworks;
    } else {
      if (process.server) {
        this.$nuxt.context.res.statusCode = 404;
      }
      throw new Error('La página no existe');
    }
  },

  /**
   * TODO: ver como construir el head con datos del pais.
   */
  // head() {
  //   return crearHead(
  //     this.$store.state.general.datos.nombre,
  //     this.pagina.titulo,
  //     this.pagina.descripcion,
  //     this.pagina.banner,
  //     this.$nuxt.$route.path
  //   );
  // },
};
</script>

<style lang="scss" scoped></style>
