<template>
    <v-container class="pa-4" max-width="400">
    <v-card>
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-text-field label="Email" v-model="email" />
          <v-text-field label="Password" v-model="password" type="password" />
          <v-btn color="primary" @click="login">Login</v-btn>
          <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
        </v-card-text>
        <v-card-text class="mt-2">
            <RouterLink to="/signup">Don't have an account? Register</RouterLink>
        </v-card-text>
    </v-card>


    </v-container>
    
  </template>
  
<script setup>
    import { ref } from 'vue'
    import { auth, db } from '../firebase'
    import { signInWithEmailAndPassword } from 'firebase/auth'
    import { RouterLink, useRouter } from 'vue-router'
    import { get, ref as dbRef } from 'firebase/database'


    const email = ref('')
    const password = ref('')
    const error = ref('')


    const router = useRouter()

    const login = () => {
        signInWithEmailAndPassword(auth, email.value, password.value)
        .then(async userCredential => {
            const user = userCredential.user
            const snap = await get(dbRef(db, `users/${user.uid}`))
            const userData = snap.val()

            if (userData?.role) {
                router.push(`/dashboard/${userData.role}`)
            } else {
                error.value = 'No role found for user.'
            }

        })
        .catch(err => {
            error.value = err.message
        })
    }

</script>
