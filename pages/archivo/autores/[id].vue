<script setup>
import { usarArchivo } from '~~/cerebros/archivo';
import { gql } from '~~/utilidades/ayudas';

/**
 * Operaciones en el servidor
 */
const ruta = useRoute();
const Autor = gql`
query {
  autores_by_id(id: ${ruta.params.id}) {
    id
    nombre
    apellido
    biografia
  }
}
`;

const { autores_by_id: datosAutor } = await obtenerDatos('autor', Autor);

const crearNombre = () => {
  const partesNombre = [];
  if (datosAutor.nombre) partesNombre.push(datosAutor.nombre);
  if (datosAutor.apellido) partesNombre.push(datosAutor.apellido);

  return partesNombre.join(' ');
};

useHead(
  elementosCabeza(
    {
      nombre: crearNombre(),
      descripcion: datosAutor.biografia,
    },
    ruta.path
  )
); // SEO

/**
 * Operaciones en el cliente
 */
const obras = ref([]);
const cerebroArchivo = usarArchivo();

cerebroArchivo.paginaActual = 'Autores';

const ObrasAutor = gql`
query {
  autores_by_id(id: ${ruta.params.id}) {
    obras(limit: 20) {
      obras_id {
        id
        registro
        titulo
        imagen {
          id,
          title
        }
        autores {
          autores_id {
            nombre
            apellido
          }
        }
      }
    }
  }
}
`;

const { data, error, pending } = obtenerDatosAsinc(`obrasAutor${datosAutor.id}`, ObrasAutor);

watch(data, ({ autores_by_id }) => {
  obras.value = autores_by_id.obras.map((obra) => obra.obras_id);
});

watch(error, (errores) => {
  console.error(errores);
});

definePageMeta({ layout: 'con-buscador', keepalive: true });
</script>

<template>
  <h1>Autor: {{ datosAutor.nombre }} {{ datosAutor.apellido }}</h1>
  <Cargador v-if="pending" />
  <GaleriaMosaico v-else :obras="obras" />
</template>
