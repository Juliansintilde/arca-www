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
        <!-- <DescripcionGaleria :numero="obras.length" :busqueda="$route.query.autor" /> -->
        <div v-for="(etiqueta, i) in etiquetas" :key="`etiqueta-${i}`" @click="$fetch">
          <!-- <span v-if="etiqueta != null"> -->
          <!--<EtiquetasGaleria :busqueda="etiquetas[i]" /> -->
          <div class="categorias-seleccionadas">
            <div v-if="etiqueta == autorSeleccionado" class="categoria">
              <nuxt-link :to="`/filtros?autor=&pais=${paisSeleccionado}&categoria1=${categoriaSeleccionada}&page=1`">
                {{ etiqueta }} X
              </nuxt-link>
            </div>
            <div v-if="etiqueta == paisSeleccionado" class="categoria">
              <nuxt-link :to="`/filtros?autor=${autorSeleccionado}&pais=&categoria1=${categoriaSeleccionada}&page=1`">
                {{ etiqueta }} X
              </nuxt-link>
            </div>
            <div v-if="etiqueta == categoriaSeleccionada" class="categoria">
              <nuxt-link :to="`/filtros?autor=${autorSeleccionado}&pais=${paisSeleccionado}&categoria1=&page=1`">
                {{ etiqueta }} X
              </nuxt-link>
            </div>
          </div>
          <!-- </span> -->
        </div>
        <Galeria :obras="obras" />
        <MenuVistas :busqueda="$route.query.autor" />
        <span v-if="obras.length == 100" class="paginas">
          <div class="pag-cont">
            <div v-for="(page, i) in pages" :key="`page-${i}`" class="num-pag" @click="$fetch">
              <nuxt-link
                :to="`/filtros?autor=${autorSeleccionado}&pais=${paisSeleccionado}&categoria1=${categoriaSeleccionada}&page=${page}`"
              >
                {{ page }}
              </nuxt-link>
            </div>
          </div>
        </span>
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
      categoriaSeleccionada: '',
      autorSeleccionado: '',
      paisSeleccionado: '',
      etiquetas: { pais: '', autor: '', categoria: '' },
      enlace: '',
    };
  },

  async fetch() {
    let autor = `"${this.$route.query.autor}"`;
    this.autorSeleccionado = this.$route.query.autor;
    this.etiquetas.autor = this.autorSeleccionado;
    let pais = `"${this.$route.query.pais}"`;
    this.paisSeleccionado = this.$route.query.pais;
    this.etiquetas.pais = this.paisSeleccionado;
    let categoria = `"${this.$route.query.categoria1}"`;
    this.categoriaSeleccionada = this.$route.query.categoria1;
    this.etiquetas.categoria = this.categoriaSeleccionada;
    const page = this.$route.query.page;

    if (this.$route.query.autor === null) {
      autor = null;
      this.autorSeleccionado = '';
    }
    if (this.$route.query.pais === null) {
      pais = null;
      this.paisSeleccionado = '';
    }
    if (this.$route.query.categoria1 === null) {
      categoria = null;
      this.categoriaSeleccionada = '';
    }

    const query = gql`
      query {
        artworks(filter: { _and: [ { _or: [
            {category_1_id: { name: { _eq: ${categoria} } }},
            {category_2_id: { name: { _eq: ${categoria} } }},
            {category_3_id: { name: { _eq: ${categoria} } }},
            {category_4_id: { name: { _eq: ${categoria} } }},
            {category_5_id: { name: { _eq: ${categoria} } }},
        ] },
            {author_id: { lastname: { _eq: ${autor} } }},
            { _or: [
              {actual_country_id: { name_spanish: { _eq: ${pais} } }},
              {origin_country_id: { name_spanish: { _eq: ${pais} } }},
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

  methods: {
    borrarEtiqueta(etiqueta) {
      if (etiqueta === this.etiquetas.autor) {
        this.etiquetas.autor = this.autorSeleccionado = this.$store.state.buscador.etiquetas.autor = '';
      } else if (etiqueta === this.etiquetas.pais) {
        this.etiquetas.pais = this.paisSeleccionado = this.$store.state.buscador.etiquetas.autor = '';
      } else if (etiqueta === this.etiquetas.categoria) {
        this.etiquetas.categoria = this.categoriaSeleccionada = this.$store.state.buscador.etiquetas.categoria = '';
      }
    },
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
  width: 100%;
  justify-self: center;
  align-self: center;
  margin: 10px;
  justify-content: center;
  .pag-cont {
    width: 350px;
    display: flex;
    border: 2px solid $profundidad;
    border-radius: 200px;
    justify-content: center;
    .num-pag {
      display: flex;
      justify-content: center;
      align-self: center;
      text-align: center;
      padding: 10px;
    }
  }
}

.categorias-seleccionadas {
  height: 40px;
  border-bottom: 1px solid $mediana;
  flex: 0 0 100%;
  text-align: center;
  display: flex;
  align-items: center;
  .categoria {
    background-color: $dolor;
    color: black;
    border-radius: 30px;
    margin-left: 10px;
    padding: 5px 15px 5px 15px;
    font-family: $fuenteMenu;
    cursor: pointer;
  }
}
</style>
