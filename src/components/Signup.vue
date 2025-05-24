<template>
    <v-container class="pa-4" max-width="400">
      <v-card>
        <v-card-title>Sign Up</v-card-title>
        <v-card-text>
          <v-text-field label="Email" v-model="email" />
          <v-text-field label="Password" v-model="password" type="password" />
          <v-select :items="roles" label="Role" v-model="role" />
          <v-btn color="primary" @click="register">Register</v-btn>
          <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
        </v-card-text>
        <v-card-text class="mt-2">
            <RouterLink to="/login">Already have an account? Login</RouterLink>
        </v-card-text>

      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { auth, db } from '../firebase'
  import { createUserWithEmailAndPassword } from 'firebase/auth'
  import { ref as dbRef, set } from 'firebase/database'
  import { RouterLink } from 'vue-router'

  
  const email = ref('')
  const password = ref('')
  const role = ref('')
  const roles = ['author', 'reviewer', 'organizer']
  const error = ref('')
  
  const register = () => {
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(userCredential => {
        const user = userCredential.user
        return set(dbRef(db, `users/${user.uid}`), {
          email: email.value,
          role: role.value
        })
      })
      .catch(err => {
        error.value = err.message
      })
  }
  </script>
  