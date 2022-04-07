<template>
  <div id="contenedor-grafica-barras">
    <h3>Barras</h3>
    <svg id="grafica-barras" height="100">
      <g id="cuerpo-barras"></g>
      <g id="yAxis"></g>
      <g id="xAxis"></g>
    </svg>

    <div class="opciones" @click="desplegar">
      <h4 class="seccion">Graficar por &#9662;</h4>
      <ul>
        <li
          v-for="(propiedad, i) in propiedades"
          id="propiedad"
          :key="`propiedad${i}`"
          class="enlace-menu"
          @click="graficarBarras(obras, propiedad.menu)"
        >
          {{ propiedad.nombre }}
        </li>
      </ul>
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
        obra(limit: 200) {
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

    graficarBarras(lista, criterio) {
      this.obtenerCantidadObras(lista, criterio);
      // Variables para d3
      const obras = this.obrasSeleccionadas;
      const grafica = d3.select('#grafica-barras');
      const cuerpo = d3.select('#cuerpo-barras');

      const max = d3.max(obras, (d) => d.cantidad);
      const maxDomain = 700;
      const anchoContenedor = 1100;
      const altoContenedor = 400;
      const desplazarGrafica = { x: 150, y: 50 };
      const altura = 270;
      const amountScale = d3.scaleLinear().domain([0, max]).range([0, maxDomain]);

      const scalePosition = d3
        .scaleBand()
        .range([0, altura])
        .domain(obras.map((d) => d.nombre));
      scalePosition.padding(0.8);

      // Ejes
      const xAxis = d3.axisBottom(amountScale);
      const yAxis = d3.axisLeft(scalePosition);
      let textoEje = '';

      // Limpiar lienzo
      cuerpo.selectAll('rect').remove();
      cuerpo.selectAll('circle').remove();
      grafica.selectAll('.textoEje').remove();

      cuerpo.attr('transform', `translate(${desplazarGrafica.x}, ${desplazarGrafica.y})`);
      const join = cuerpo.selectAll('rect').data(obras);

      grafica.style('width', anchoContenedor).style('height', altoContenedor);

      // Dibujar líneas
      join
        .enter()
        .append('rect')
        .style('fill', '#af2828')
        .style('stroke', '#af2828')
        .style('width', (d) => amountScale(d.cantidad))
        .style('height', 0.1) // scalePosition.bandwidth()
        .style('y', (d) => scalePosition(d.nombre));
      // Dibujar círculos
      join
        .enter()
        .append('circle')
        .style('stroke', '#af2828')
        .style('fill', '#af2828')
        .attr('r', 4)
        .attr('cx', (d) => amountScale(d.cantidad))
        .attr('cy', (d) => scalePosition(d.nombre));

      xAxis.ticks(10);
      d3.select('#xAxis')
        .call(xAxis)
        .attr('transform', `translate(${desplazarGrafica.x}, ${altura + desplazarGrafica.y})`);
      d3.select('#xAxis')
        .append('text')
        .text('Cantidad')
        .attr('class', 'textoEje')
        .attr('transform', `translate(${maxDomain + 25}, 5)`)
        .style('fill', '#af2828');

      textoEje = this.limpiarTexto(criterio);

      d3.select('#yAxis').call(yAxis).attr('transform', `translate(${desplazarGrafica.x}, ${desplazarGrafica.y})`);
      d3.select('#yAxis')
        .append('text')
        .text(textoEje)
        .attr('class', 'textoEje')
        .attr('transform', 'translate(0, -5)')
        .style('fill', '#af2828');
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

#contenedor-grafica-barras {
  display: flex;
  margin-top: 2%;
  margin-left: 5%;
}
#grafica-barras {
  height: inherit;
  margin: 3em 0em 2em -4em;
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
