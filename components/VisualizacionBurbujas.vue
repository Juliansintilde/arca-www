<template>
  <div id="contenedor-grafica">
    <!-- Barras -->
    <div id="grafica">
      <g id="yAxis"></g>
      <g id="xAxis"></g>
    </div>
    <div>
      <span id="boton">
        <div class="pantalla">
          <h3 class="seccion" @click="desplegar">Graficar barras por:</h3>
          <ul class="menu-propiedades">
            <li
              v-for="(propiedad, i) in propiedades"
              id="propiedad"
              :key="`propiedad${i}`"
              @click="graficarBurbujas(obras, propiedad.menu)"
            >
              {{ propiedad.nombre }}
            </li>
          </ul>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { gql } from 'nuxt-graphql-request';

export default {
  layout: 'conBuscador',
  data() {
    return {
      pagina: {},
      obras: [],
      obrasSeleccionadas: [],
      propiedades: [],
    };
  },

  async fetch() {
    const query = gql`
      query {
        obra(limit: 9999) {
          arca_id
          fechas_actividad
          ubicacion_actual {
            nombre
          }
          autor {
            apellido
            nombre
          }
          complejidad_gestual {
            nombre
          }
          cuerpo_imagen {
            nombre
          }
          disposicion_corporal {
            nombre
          }
          donante {
            nombre
          }
          escenario {
            nombre
          }
          rostro {
            nombre
          }
          tecnica {
            nombre
          }
          tipo_gestual {
            nombre
          }
          tipo_relato_visual {
            nombre
          }
        }
      }
    `;

    const { obra } = await this.$graphql.principal.request(query);

    if (obra && obra.length) {
      this.obras = obra;
    } else {
      if (process.server) {
        this.$nuxt.context.res.statusCode = 404;
      }
      throw new Error('La página no existe');
    }

    // this.graficarBarras(this.obras, 'tipo_relato_visual');
    this.propiedades.push(
      { nombre: 'Complejidad gestual', menu: 'complejidad_gestual' },
      { nombre: 'Cuerpo', menu: 'cuerpo_imagen' },
      { nombre: 'Disposición corporal', menu: 'disposicion_corporal' },
      { nombre: 'Donante', menu: 'donante' },
      { nombre: 'Escenario', menu: 'escenario' },
      { nombre: 'Relato visual', menu: 'tipo_relato_visual' },
      { nombre: 'Rostro', menu: 'rostro' },
      // { nombre: 'Símbolo', menu: 'simbolo' },
      { nombre: 'Tipo gestual', menu: 'tipo_gestual' }
      // { nombre: 'Ubicación', menu: 'ubicacion_actual' }
    );
  },

  methods: {
    // TODO: Mover a utilidades - ayudas
    desplegar(evento) {
      const contenedor = evento.target.parentElement;
      contenedor.classList.toggle('abierto');
    },
    crearSet(lista, criterio) {
      this.ordenarLista(lista, criterio);
      const listaCriterio = [];
      let propiedad = '';
      // Si se grafica por fechas u otro criterio sin propiedades
      if (criterio === 'fechas_actividad') {
        for (const i of lista) {
          listaCriterio.push(i[criterio]);
        }
        // Si se grafica por un criterio que tiene propiedades
      } else {
        propiedad = 'nombre';
      }
      for (const i of lista) {
        listaCriterio.push(i[criterio][`${propiedad}`]);
      }
      const set = new Set(listaCriterio);
      return set;
    },
    obtenerCantidadObras(lista, criterio) {
      const obras = [];
      const set = this.crearSet(lista, criterio);
      let propiedad = '';
      let result = [];

      // Eliminar comillas del criterio
      criterio = criterio.replace("'", '');

      // Agregar cantidad de obras por nombre
      for (let i = 0; i < set.size; i++) {
        const cuenta = { nombre: '', cantidad: 0 };
        if (criterio === 'fechas_actividad') {
          result = this.obras.filter((obra) => obra[criterio] === Array.from(set)[i]);
          cuenta.nombre = result[0][criterio];
          // Si se grafica por un criterio que tiene propiedades
        } else {
          propiedad = 'nombre';

          result = this.obras.filter((obra) => obra[criterio][`${propiedad}`] === Array.from(set)[i]);
          cuenta.nombre = result[0][criterio][`${propiedad}`];
        }
        cuenta.cantidad = result.length;
        obras.push(cuenta);
      }
      this.obrasSeleccionadas = obras;
      return obras;
    },

    ordenarLista(lista, criterio) {
      const criterioSinComillas = criterio.replace("'", '');
      lista.sort((a, b) => {
        return d3.ascending(a[criterioSinComillas], b[criterioSinComillas]);
      });
    },
    mostrarDatos(lista, criterio = '') {
      for (const item of lista) {
        // eslint-disable-next-line dot-notation
        this.escribir(item[criterio]);
      }
    },

    borrarGrafica() {
      const grafica = d3.select('#grafica');
      grafica.remove();
    },

    graficarBurbujas(lista, criterio) {
      this.obtenerCantidadObras(lista, criterio);
      // Dimensiones
      /*  const margen = { superior: 40, derecho: 150, inferior: 60, izquierdo: 30 };
      const ancho = 500 - margen.izquierdo - margen.derecho;
      const altura = 420 - margen.superior - margen.inferior;
 */
      // Agregar el objeto svg al cuerpo de la página
      /*   const svg = d3
        .select('#grafica')
        .append('svg')
        .attr('width', ancho + margen.izquierdo + margen.derecho)
        .attr('height', altura + margen.superior + margen.inferior)
        .append('g')
        .attr('transform', 'translate(' + margen.izquierdo + ',' + margen.superior + ')');
 */
      // Agregar eje X
      // const x = d3.scaleLinear().domain;
    },

    // TODO: pasar esta función a utilidades-ayudas
    limpiarTexto(texto) {
      let textoLimpio = `${texto}`.replace(/_/g, ' ');
      textoLimpio = textoLimpio.substring(0, 1).toUpperCase() + textoLimpio.substring(1);
      return textoLimpio;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';

#contenedor-grafica {
  margin-left: 5%;
}
#grafica {
  height: inherit;
  margin: 0em;
}
</style>
