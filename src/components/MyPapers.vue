<template>
    <v-container>
      <h3>Your Submitted Papers</h3>
      <v-alert v-if="papers.length === 0" type="info">No papers submitted yet.</v-alert>
  
      <v-card v-for="paper in papers" :key="paper.id" class="mb-3">
        <v-card-title>{{ paper.title }}</v-card-title>
        <v-card-subtitle>
          Co-authors: {{ paper.coauthors?.length ? paper.coauthors.join(', ') : 'None' }}
        </v-card-subtitle>
        <v-card-text>
          <a :href="paper.pdfLink" target="_blank">View PDF</a>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { db, auth } from '../firebase'
  import { ref as dbRef, get } from 'firebase/database'
  
  const papers = ref([])
  
  onMounted(async () => {
    const user = auth.currentUser
    if (!user) return

    const papersSnap = await get(dbRef(db, 'papers'))
    const papersData = papersSnap.val()
    if (!papersData) return

    const usersSnap = await get(dbRef(db, 'users'))
    const usersData = usersSnap.val() || {}

    papers.value = Object.entries(papersData)
        .filter(([_, paper]) => paper.mainAuthor === user.uid)
        .map(([id, paper]) => ({
        id,
        ...paper,
        coauthors: (paper.coauthors || []).map(uid => usersData[uid]?.email || uid)
        }))
    })

  </script>
  