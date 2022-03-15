<template>
  <div id="contenedor-grafica">
    <svg id="grafica">
      <g id="cuerpo"></g>
    </svg>
    <div>
      <span id="boton">
        <div class="pantalla">
          <h3 class="seccion" @click="desplegar">Graficar círculos por:</h3>
          <ul class="menu-propiedades">
            <li
              v-for="(propiedad, i) in propiedades"
              id="propiedad"
              :key="`propiedad${i}`"
              @click="graficarCirculos(obras, propiedad.menu)"
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
import { forceManyBody } from 'd3';

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
        obra(limit: 100) {
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

    graficarCirculos(lista, criterio) {
      this.obtenerCantidadObras(lista, criterio);

      // Variables para d3
      const obras = this.obrasSeleccionadas;

      // Dimensiones
      const margen = { superior: 40, derecho: 150, inferior: 60, izquierdo: 30 };
      const ancho = 500 - margen.izquierdo - margen.derecho;
      const altura = 500 - margen.superior - margen.inferior;
      const grafica = d3.select('#grafica');

      // Limpiar lienzo
      d3.select('#cuerpo').selectAll('g').remove();

      // Ajustar tamaño del contenedor
      grafica.style('width', ancho).style('height', altura);

      // Agregar el objeto svg al cuerpo de la página
      const svg = d3
        .select('#cuerpo')
        .append('svg')
        .attr('width', ancho + margen.izquierdo + margen.derecho)
        .attr('height', altura + margen.superior + margen.inferior);

      /*  // Paleta de color por continentes
      var color = d3.scaleOrdinal().domain(['Asia', 'Europe', 'Africa', 'Oceania', 'Americas']).range(d3.schemeSet1);
 */
      // Escala de tamaño según criterio
      const max = d3.max(obras, (d) => d.cantidad);
      const size = d3.scaleLinear().domain([0, max]).range([7, 55]);

      // Crear un tooltip ¿?
      const tooltip = d3
        .select('#contenedor-grafica')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', '#fffdf8')
        .style('color', '#08173e')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('border-color', '#af2828')
        .style('padding', '5px')
        .style('position', 'absolute')
        .style('width', '200px');

      // Tres funciones que cambian el tooltip en el hover
      const mouseover = function (d) {
        tooltip.style('opacity', 0.9);
      };

      // Mostrar tooltip al mover el mouse
      const mousemove = function (d) {
        const pos = d3.pointer(d, this);
        const nombre = d.srcElement.__data__.nombre;
        const cantidad = d.toElement.__data__.cantidad;
        tooltip
          .html('<b>' + nombre + ':' + '</b>' + '<br>' + cantidad + ' obras')
          .style('opacity', 0.9)
          .style('top', pos[1] + 120 + 'px')
          .style('left', pos[0] + 190 + 'px');
      };

      // Ocultar tooltip al salir del círculo
      const mouseleave = function () {
        tooltip.style('opacity', 0);
      };

      // Inicializar los círculos en el área svg
      const node = svg
        .append('g')
        .selectAll('circle')
        .data(obras)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', function (d) {
          return size(d.cantidad);
        })
        .attr('cx', ancho / 2)
        .attr('cy', altura / 2)
        .style('fill', '#af2828')
        .style('fill-opacity', 0.9)
        .attr('stroke', '#08173e')
        .style('stroke-width', 1)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
      // .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)); // llama una función específica cuando el círculo es arrastrado;

      // Fuerzas aplicadas a los nodos
      const simulacion = d3
        .forceSimulation()
        .force(
          'center',
          d3
            .forceCenter()
            .x(ancho / 2) // Atracción hacia el centro del área svg
            .y(altura / 2)
        )
        .force('charge', forceManyBody().strength(0.1)) // Los nodos son atraídos entre sí si el valor es > 0
        .force(
          'collide',
          d3
            .forceCollide()
            .strength(0.2)
            .radius(function (d) {
              return size(d.cantidad) + 3;
            })
            .iterations(1) // Fuerza que evita que los círculos se superpongan
        );

      // Aplicar las fuerzas a los nodos y actualizar sus posiciones
      simulacion.nodes(obras).on('tick', function () {
        node
          .attr('cx', function (d) {
            return d.x;
          })
          .attr('cy', function (d) {
            return d.y;
          });
      });
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
