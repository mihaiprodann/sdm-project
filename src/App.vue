<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()

const showNavbar = computed(() => {
  return !['/login', '/signup'].includes(route.path)
})
</script>

<style scoped>

.v-container {
  padding: 0 !important;
}

</style>