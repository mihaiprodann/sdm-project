<template>
    <v-container>
      <h3>Review Results for Your Papers</h3>
      <v-alert v-if="papers.length === 0" type="info">No papers submitted yet.</v-alert>
  
      <v-card v-for="paper in papers" :key="paper.id" class="mb-4">
        <v-card-title>{{ paper.title }}</v-card-title>
        <v-card-subtitle>
          Status:
          <strong :class="paper.status === 'Accepted' ? 'text-success' : 'text-error'">
            {{ paper.status }}
          </strong>
          | Average Score: {{ paper.average?.toFixed(2) ?? 'N/A' }}
        </v-card-subtitle>
  
        <v-card-text>
          <div v-if="paper.reviews.length === 0">No reviews yet.</div>
          <div v-for="(review, index) in paper.reviews" :key="index" class="mb-2">
            <v-divider />
            <p><strong>Reviewer #{{ index + 1 }}</strong></p>
            <p><strong>Score:</strong> {{ review.score }}</p>
            <p><strong>Comment:</strong> {{ review.comment }}</p>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { db, auth } from '../firebase'
  import { get, ref as dbRef } from 'firebase/database'
  
  const papers = ref([])
  
  onMounted(async () => {
    const user = auth.currentUser
    if (!user) return

    const papersSnap = await get(dbRef(db, 'papers'))
    const allPapers = papersSnap.val() || {}
  
    const myPapers = Object.entries(allPapers)
      .filter(([_, paper]) => paper.mainAuthor === user.uid)
  
    const reviewsSnap = await get(dbRef(db, 'reviews'))
    const allReviews = reviewsSnap.val() || {}
  
    papers.value = myPapers.map(([id, paper]) => {
      const reviewsForPaper = allReviews[id] || {}
  
      const reviewsArray = Object.values(reviewsForPaper)
  
      const average =
        reviewsArray.length > 0
          ? reviewsArray.reduce((sum, r) => sum + (r.score || 0), 0) / reviewsArray.length
          : null
  
      const status =
        average !== null
          ? average >= 3
            ? 'Accepted'
            : 'Rejected'
          : 'Pending'
  
      return {
        id,
        title: paper.title,
        reviews: reviewsArray,
        average,
        status
      }
    })
  })
  </script>
  