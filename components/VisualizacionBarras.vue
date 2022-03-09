<template>
  <div id="contenedor-grafica">
    <!-- Barras -->
    <svg id="grafica">
      <g id="cuerpo" style="transform: translate(80px, 53px)"></g>
      <g id="yAxis"></g>
      <g id="xAxis"></g>
    </svg>
    <div>
      <button id="boton" @click="graficarBarras(obras, 'tipo_relato_visual')">Graficar cantidad de obras por:</button>
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
      gato: 0,
    };
  },

  async fetch() {
    const query = gql`
      query {
        obra(limit: 1999) {
          arca_id
          fechas_actividad
          ubicacion_actual {
            nombre
          }
          autor {
            apellido
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

    this.graficarBarras(this.obras, 'tipo_relato_visual');
  },

  methods: {
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
        if (criterio === 'tipo_relato_visual') {
          propiedad = 'nombre';
        }
        for (const i of lista) {
          listaCriterio.push(i[criterio][`${propiedad}`]);
        }
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
          if (criterio === 'tipo_relato_visual') {
            propiedad = 'nombre';
          }
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
      const contenedorBarras = d3.select('#grafica');
      const cuerpo = d3.select('#cuerpo');
      const anchoContenedor = 700;
      const altoContenedor = 400;
      // Limpiar lienzo
      cuerpo.selectAll('rect').remove();
      cuerpo.selectAll('circle').remove();

      contenedorBarras.style('width', anchoContenedor).style('height', altoContenedor);

      const max = d3.max(obras, (d) => d.cantidad);
      const altura = 270;
      const amountScale = d3.scaleLinear().range([0, 500]).domain([0, max]);

      const scalePosition = d3
        .scaleBand()
        .range([0, altura])
        .domain(obras.map((d) => d.nombre));
      scalePosition.padding(0.8);

      const join = cuerpo.selectAll('rect').data(obras);
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

      const xAxis = d3.axisBottom(amountScale);
      xAxis.ticks(10);
      d3.select('#xAxis')
        .call(xAxis)
        .attr('transform', `translate(80, ${altura + 50})`);
      d3.select('#xAxis').append('text').text('Cantidad').attr('transform', `translate(550, 5)`).style('fill', 'black');

      const yAxis = d3.axisLeft(scalePosition);
      const textoEje = this.limpiarTexto(criterio);
      d3.select('#yAxis').call(yAxis).attr('transform', 'translate(80, 50)');
      d3.select('#yAxis').append('text').text(textoEje).attr('transform', 'translate(0, -5)').style('fill', 'black');
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
  margin: 2em;
}
</style>
