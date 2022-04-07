<template>
  <div id="contenedor-general-circulos">
    <div id="contenedor-grafica-circulos" @click="verOcultar">
      <h3>Círculos</h3>

      <svg id="grafica-circulos" height="100">
        <g id="cuerpo-circulos"></g>
      </svg>
    </div>
    <div>
      <div class="opciones" @click="desplegar">
        <h4 class="seccion">Graficar por &#9662;</h4>
        <ul>
          <li
            v-for="(propiedad, i) in propiedades"
            id="propiedad"
            :key="`propiedad${i}`"
            class="enlace-menu"
            @click="graficarCirculos(obras, propiedad.menu)"
          >
            {{ propiedad.nombre }}
          </li>
        </ul>
      </div>
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
    verOcultar(evento) {
      const contenedor = evento.target.parentElement;
      contenedor.classList.toggle('oculto');
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
        this.escribir(item[criterio]);
      }
    },

    borrarGrafica() {
      const grafica = d3.select('#grafica-circulos');
      grafica.remove();
    },

    graficarCirculos(lista, criterio) {
      this.obtenerCantidadObras(lista, criterio);

      // Variables para d3
      const obras = this.obrasSeleccionadas;

      // Dimensiones
      const margen = { superior: 50, derecho: 150, inferior: 70, izquierdo: 30 };
      const ancho = 500 - margen.izquierdo - margen.derecho;
      const altura = 500 - margen.superior - margen.inferior;
      const grafica = d3.select('#grafica-circulos');

      // Limpiar lienzo
      d3.select('#cuerpo-circulos').selectAll('g').remove();

      // Ajustar tamaño del contenedor
      grafica.style('width', ancho).style('height', altura);

      // Agregar el objeto svg al cuerpo de la página
      const svg = d3
        .select('#cuerpo-circulos')
        .append('svg')
        .attr('width', ancho + margen.izquierdo + margen.derecho)
        .attr('height', altura + margen.superior + margen.inferior);

      /*  // Paleta de color por continentes
      var color = d3.scaleOrdinal().domain(['Asia', 'Europe', 'Africa', 'Oceania', 'Americas']).range(d3.schemeSet1);
 */
      // Escala de tamaño según criterio
      const max = d3.max(obras, (d) => d.cantidad);
      const size = d3.scaleLinear().domain([0, max]).range([7, 55]);

      // Crear un tooltip
      const tooltip = d3
        .select('#contenedor-general-circulos')
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
      const mouseover = function () {
        tooltip.style('opacity', 0.9);
        tooltip.style('z-index', 99);
      };

      // Mostrar tooltip al mover el mouse
      const mousemove = function (d) {
        const pos = d3.pointer(d, this);
        const nombre = d.srcElement.__data__.nombre;
        const cantidad = d.toElement.__data__.cantidad;
        tooltip
          .html('<b>' + nombre + '</b>' + '<br>' + cantidad + ' obras')
          .style('opacity', 0.9)
          .style('top', pos[1] + 150 + 'px')
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
        .on('mousemove', mousemove);
      // .on('mouseleave', mouseleave);
      // .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)); // llama una función específica cuando el círculo es arrastrado;

      tooltip.on('mouseleave', mouseleave);

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

#contenedor-general-circulos {
  display: flex;
  margin-top: 2%;
  margin-left: 5%;
}
#contenedor-grafica-circulos {
  height: fit-content;
  overflow: visible;
  &.oculto {
    height: 1.7em;
    overflow: hidden;
  }
}
#grafica-circulos {
  height: inherit;
  margin: 1em 0em 2em 0em;
  background-color: $mediana;
  border-radius: 10px;
}
.opciones {
  margin: 2.5em 0em 0em 2em;
  height: 1.7em;
  overflow: hidden;
  cursor: pointer;
  &.abierto {
    height: fit-content;
  }
  ul {
    margin-left: 0em;
  }
  li {
    margin-bottom: 0em;
  }
}

ul {
  margin-right: 0.2em;
  margin-left: 0.8em;
  padding-top: 0.5em;
  font-family: $fuenteMenu;

  &.opciones {
    overflow: visible;
  }
}

.enlace-menu {
  margin-bottom: 0.4em;
  font-size: 0.85em;
  position: relative;

  &::before {
    content: '';
    width: 3px;
    height: 3px;
    border-radius: 50%;
    display: block;
    background-color: $dolor;
    position: absolute;
    left: -9px;
    top: 0.5em;
  }
}
</style>
