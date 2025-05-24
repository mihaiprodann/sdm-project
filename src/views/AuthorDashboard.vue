<template>
  <v-container>
    <h2>Author Dashboard</h2>
    <PaperSubmit />
    <v-divider class="my-4" />
    <MyPapers />
    <v-divider class="my-4" />
    <MyReviews />
  </v-container>
</template>

<script setup>
import PaperSubmit from '../components/PaperSubmit.vue'
import MyPapers from '../components/MyPapers.vue'
import MyReviews from '../components/MyReviews.vue'
</script>
