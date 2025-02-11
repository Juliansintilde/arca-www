<!-- 
  Esta versión se encarga de buscar los datos de algún elemento en las colecciones que tienen
  la misma estructura con el título en el campo `nombre`.
-->
<script setup>
import { usarArchivo } from '~~/cerebros/archivo';
import { nombrePorSlug, obrasPorSlug } from '~~/utilidades/queries';

const props = defineProps({
  coleccion: String,
  enTablaRelacional: {
    type: Boolean,
    default: false,
  },
  paginaActual: {
    type: String,
    default: '',
  },
  singular: String,
});

/**
 * Operaciones en el servidor
 */
const ruta = useRoute();
const datos = ref(null);
const respuesta = await obtenerDatos(props.coleccion, nombrePorSlug(props.coleccion, ruta.params.slug));

useHead(elementosCabeza(respuesta[props.coleccion][0], ruta.path)); // SEO

datos.value = respuesta[props.coleccion][0];

/**
 * Operaciones en el cliente
 */
const obras = ref([]);
const cerebroArchivo = usarArchivo();

const { data, pending } = obtenerDatosAsinc(
  `obras-${datos.value.id}`,
  obrasPorSlug(props.coleccion, ruta.params.slug, props.enTablaRelacional)
);

onMounted(() => {
  cerebroArchivo.paginaActual = props.paginaActual;
});

watch(data, (datosObras) => {
  // Extraer las obras de colección directamente o de la tabla relacional.
  obras.value = !props.enTablaRelacional
    ? datosObras[props.coleccion][0].obras
    : datosObras[props.coleccion][0].obras.map((obra) => obra.obras_id);
});
</script>

<template>
  <h1>{{ `${singular || props.paginaActual}: ${datos.nombre}` }}</h1>
  <Cargador v-if="pending" />
  <GaleriaMosaico :obras="obras" />
</template>
