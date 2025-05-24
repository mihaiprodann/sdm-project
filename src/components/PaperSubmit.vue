<template>
    <v-container class="pa-4" max-width="600">
      <v-card>
        <v-card-title>Submit a Paper</v-card-title>
        <v-card-text>
          <v-text-field label="Title" v-model="title" />
            <v-select
                v-model="selectedCoauthors"
                :items="availableAuthors"
                item-title="email"
                item-value="uid"
                label="Select co-authors"
                multiple
                chips
                clearable
            />

          <v-text-field label="Keywords (comma-separated)" v-model="keywords" />
          <v-text-field label="PDF Link" v-model="pdfLink" />
          <v-btn color="primary" @click="submitPaper">Submit</v-btn>
          <v-alert type="success" v-if="success" class="mt-3">Paper submitted!</v-alert>
          <v-alert type="error" v-if="error" class="mt-3">{{ error }}</v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { db, auth } from '../firebase'
  import {  get, child, push, ref as dbRef, serverTimestamp } from 'firebase/database'
  import { onMounted } from 'vue'

const selectedCoauthors = ref([])
const availableAuthors = ref([])
  
  const title = ref('')
  const authors = ref('')
  const keywords = ref('')
  const pdfLink = ref('')
  const error = ref('')
  const success = ref(false)
  
  const submitPaper = async () => {
    error.value = ''
    success.value = false
  
    const user = auth.currentUser
    if (!user) {
      error.value = 'Not authenticated'
      return
    }
  
    if (!title.value || !pdfLink.value) {
      error.value = 'Title and PDF Link are required'
      return
    }
  
    const paperData = {
        title: title.value,
        coauthors: selectedCoauthors.value,
        keywords: keywords.value.split(',').map(k => k.trim()),
        pdfLink: pdfLink.value,
        mainAuthor: user.uid,
        submittedAt: serverTimestamp()
    }

  
    try {
      await push(dbRef(db, 'papers'), paperData)
      success.value = true
      title.value = authors.value = keywords.value = pdfLink.value = ''
    } catch (e) {
      error.value = e.message
    }
  }


onMounted(async () => {
  const snapshot = await get(dbRef(db, 'users'))
  const allUsers = snapshot.val()
  const currentUser = auth.currentUser

  if (!allUsers || !currentUser) return

  availableAuthors.value = Object.entries(allUsers)
    .filter(([uid, u]) => u.role === 'author' && uid !== currentUser.uid)
    .map(([uid, u]) => ({
      uid,
      email: u.email
    }))
})

  </script>
  