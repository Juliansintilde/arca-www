import InstantSearch from 'vue-instantsearch/vue3/es';

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.use(InstantSearch);
});
