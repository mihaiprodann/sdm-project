<template>
    <v-container class="pa-4">
      <v-card>
        <v-card-title>Allocate Reviewers to Papers</v-card-title>
        <v-card-text>
          <v-btn color="primary" @click="allocate" :loading="loading">Allocate Now</v-btn>
          
          <v-divider class="my-4" />
  
          <v-alert v-if="success" type="success" closable>{{ success }}</v-alert>
          <v-alert v-if="error" type="error" closable>{{ error }}</v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { db } from '../firebase'
  import { get, ref as dbRef, set } from 'firebase/database'
  
  const loading = ref(false)
  const success = ref('')
  const error = ref('')
  
  const allocate = async () => {
    loading.value = true
    error.value = ''
    success.value = ''
  
    try {
      const [papersSnap, usersSnap] = await Promise.all([
        get(dbRef(db, 'papers')),
        get(dbRef(db, 'users'))
      ])
  
      const papers = papersSnap.val() || {}
      const users = usersSnap.val() || {}
  
      const reviewers = Object.entries(users)
        .filter(([_, u]) => u.role === 'reviewer')
        .map(([uid]) => uid)
  
      if (reviewers.length < 2) {
        error.value = '⚠️ You need at least 2 reviewers to allocate.'
        loading.value = false
        return
      }
  
      const allocations = {}
      for (const paperId in papers) {
        const shuffled = [...reviewers].sort(() => 0.5 - Math.random())
        allocations[paperId] = shuffled.slice(0, 2)
      }
  
      await set(dbRef(db, 'allocations'), allocations)
      success.value = '✅ Reviewers allocated successfully!'
    } catch (e) {
      error.value = 'Error: ' + e.message
    } finally {
      loading.value = false
  
      setTimeout(() => {
        success.value = ''
        error.value = ''
      }, 3000)
    }
  }
  </script>
  