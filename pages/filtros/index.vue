<template>
  <div>
    <template v-if="$fetchState.pending">
      <div>
        <h1>Pendiente...</h1>
      </div>
    </template>

    <template v-else-if="$fetchState.error">
      <div>
        <!-- <h1 class="error">{{ $fetchState.error.message }}</h1> -->
        <h2 class="error">No hay regitros que coincidan con los criterios de búsqueda.</h2>
        <nuxt-link :to="`/archivo`"> Volver a buscar </nuxt-link>
      </div>
    </template>

    <template v-else>
      <div class="contenedor-pagina">
        <span class="paginas">
          <div v-for="(page, i) in pages" :key="`page-${i}`" @click="$fetch">
            <nuxt-link
              v-if="obras.length == 100"
              :to="`/filtros?autor=${etiquetasSeleccionadas.autor}&pais=${etiquetasSeleccionadas.pais}&categoria1=${etiquetasSeleccionadas.categoria1}&page=${page}`"
            >
              {{ page }}
            </nuxt-link>
          </div>
        </span>
        <!-- <DescripcionGaleria :numero="obras.length" :busqueda="$route.query.autor" /> -->
        <EtiquetasGaleria :busqueda="$route.query.categoria1" />
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
      pages: [...Array(11).keys()].splice(1),
      etiquetasSeleccionadas: {
        categoria1: null,
        autor: null,
        pais: null,
      },
      selectedQuery: null,
    };
  },

  async fetch() {
    const autor = (this.etiquetasSeleccionadas.autor = this.$route.query.autor);
    const pais = (this.etiquetasSeleccionadas.pais = this.$route.query.pais);
    const categoria = (this.etiquetasSeleccionadas.categoria1 = this.$route.query.categoria1);
    const page = this.$route.query.page;
    // let selectedQuery;
    //  const query = selectedQuery;

    if (autor !== 'null' && pais !== 'null' && categoria !== 'null') {
      this.selectedQuery = gql`
      query {
        artworks(filter: { _and: [ { _or: [
            {category_1_id: { name: { _eq: "${categoria}" } }},
            {category_2_id: { name: { _eq: null } }},
            {category_3_id: { name: { _eq: null } }},
            {category_4_id: { name: { _eq: null } }},
            {category_5_id: { name: { _eq: null } }},
        ] },
            {author_id: { lastname: { _eq: "${autor}" } }},
            { _or: [
              {actual_country_id: { name_spanish: { _eq: "${pais}" } }},
              {origin_country_id: { name_spanish: { _eq: "${pais}" } }},
            ] }
        ]  }, page:  ${page}) {
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
    `;
    } else if (autor !== 'null' && pais !== 'null' && categoria === 'null') {
      this.selectedQuery = gql`
      query {
        artworks(filter: { _and: [
            {author_id: { lastname: { _eq: "${autor}" } }},
            { _or: [
              {actual_country_id: { name_spanish: { _eq: "${pais}" } }},
              {origin_country_id: { name_spanish: { _eq: "${pais}" } }},
            ] }
        ]  }, page:  ${page}) {
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
      `;
    } else if (autor !== 'null' && pais === 'null' && categoria !== 'null') {
      this.selectedQuery = gql`
        query {
        artworks(filter: { _and: [ { _or: [
            {category_1_id: { name: { _eq: "${categoria}" } }},
            {category_2_id: { name: { _eq: null } }},
            {category_3_id: { name: { _eq: null } }},
            {category_4_id: { name: { _eq: null } }},
            {category_5_id: { name: { _eq: null } }},
        ] },
            {author_id: { lastname: { _eq: "${autor}" } }},
        ]  }, page:  ${page}) {
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
      `;
    } else if (autor === 'null' && pais !== 'null' && categoria !== 'null') {
      this.selectedQuery = gql`
        query {
        artworks(filter: { _and: [ { _or: [
            {category_1_id: { name: { _eq: "${categoria}" } }},
            {category_2_id: { name: { _eq: null } }},
            {category_3_id: { name: { _eq: null } }},
            {category_4_id: { name: { _eq: null } }},
            {category_5_id: { name: { _eq: null } }},
        ] },
            { _or: [
              {actual_country_id: { name_spanish: { _eq: "${pais}" } }},
              {origin_country_id: { name_spanish: { _eq: "${pais}" } }},
            ] }
        ]  }, page:  ${page}) {
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
      `;
    } else if (autor !== 'null' && pais === 'null' && categoria === 'null') {
      this.selectedQuery = gql`
      query {
        artworks(filter: { author_id: { lastname: { _eq: "${autor}" } } }, page: ${page} ) {
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
            artworkso2m {
              id
            }
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
    } else if (autor === 'null' && pais !== 'null' && categoria === 'null') {
      this.selectedQuery = gql`
      query {
        artworks(filter: { _or: [
              {actual_country_id: { name_spanish: { _eq: "${pais}" } }},
              {origin_country_id: { name_spanish: { _eq: "${pais}" } }},
            ] }, page: ${page} ) {
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
            artworkso2m {
              id
            }
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
    } else if (autor === 'null' && pais === 'null' && categoria !== 'null') {
      this.selectedQuery = gql`
      query {
        artworks(filter: { _or: [
            {category_1_id: { name: { _eq: "${categoria}" } }},
            {category_2_id: { name: { _eq: "${categoria}" } }},
            {category_3_id: { name: { _eq: "${categoria}" } }},
            {category_4_id: { name: { _eq: "${categoria}" } }},
            {category_5_id: { name: { _eq: "${categoria}" } }},
        ] }, page: ${page}) {
          id
          title
          annotation_date
          synthesis
          latitude_current
          longitude_current
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
    `;
    }

    const query = this.selectedQuery;

    const { artworks } = await this.$graphql.principal.request(query);

    if (artworks && artworks.length) {
      this.obras = artworks;
    } else {
      if (process.server) {
        this.$nuxt.context.res.statusCode = 404;
      }
      throw new Error('La página no existe');
    }
    console.log(query);
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

<style lang="scss" scoped>
.paginas {
  display: flex;
  width: 100vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
