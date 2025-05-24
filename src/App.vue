<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main class="pt-12">
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
