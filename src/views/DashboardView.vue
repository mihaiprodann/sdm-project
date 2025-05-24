<template>
    <v-container>
      <h2>Welcome!</h2>
      <p v-if="user && role">Logged in as <strong>{{ role }}</strong> ({{ user.email }})</p>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { auth, db } from '../firebase'
  import { onAuthStateChanged } from 'firebase/auth'
  import { ref as dbRef, get } from 'firebase/database'
  
  const user = ref(null)
  const role = ref(null)
  
  onMounted(() => {
    onAuthStateChanged(auth, async u => {
      if (u) {
        user.value = u
        const snap = await get(dbRef(db, `users/${u.uid}`))
        role.value = snap.val()?.role
      }
    })
  })
  </script>
  