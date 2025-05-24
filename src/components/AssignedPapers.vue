<template>
    <v-container>
      <h3>Assigned Papers for Review</h3>
      <v-alert v-if="papers.length === 0" type="info">No papers assigned yet.</v-alert>
  
      <v-card v-for="paper in papers" :key="paper.id" class="mb-3">
        <v-card-title>{{ paper.title }}</v-card-title>
        <v-card-subtitle>
          Author: {{ paper.mainAuthorEmail || paper.mainAuthor }}
        </v-card-subtitle>
        <v-card-text>
          <a :href="paper.pdfLink" target="_blank">View PDF</a>
          <div class="mt-3">
            <v-textarea label="Comment" v-model="paper.review.comment" />
            <v-slider
              v-model="paper.review.score"
              :max="5"
              :min="0"
              step="1"
              label="Score"
              class="mt-2"
            />
            <v-btn color="primary" @click="submitReview(paper)">Submit Review</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { db, auth } from '../firebase'
  import { get, ref as dbRef, set } from 'firebase/database'
  
  const papers = ref([])
  
  const loadData = async () => {
    const user = auth.currentUser
    if (!user) return
  
    const [papersSnap, allocationsSnap, usersSnap] = await Promise.all([
      get(dbRef(db, 'papers')),
      get(dbRef(db, 'allocations')),
      get(dbRef(db, 'users'))
    ])
  
    const allPapers = papersSnap.val() || {}
    const allocations = allocationsSnap.val() || {}
    const allUsers = usersSnap.val() || {}
  
    const assignedPaperIds = Object.entries(allocations)
      .filter(([_, reviewers]) => Array.isArray(reviewers) && reviewers.includes(user.uid))
      .map(([paperId]) => paperId)
  
    papers.value = assignedPaperIds.map(paperId => {
      const paper = allPapers[paperId]
      return {
        id: paperId,
        ...paper,
        mainAuthorEmail: allUsers[paper.mainAuthor]?.email || paper.mainAuthor,
        review: {
          score: 0,
          comment: ''
        }
      }
    })
  }
  
  onMounted(loadData)
  
  const submitReview = async (paper) => {
    const user = auth.currentUser
    if (!user) return
  
    await set(dbRef(db, `reviews/${paper.id}/${user.uid}`), {
      score: paper.review.score,
      comment: paper.review.comment
    })
  
    alert('Review submitted!')
  }
  </script>
  