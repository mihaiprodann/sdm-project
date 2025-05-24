<template>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>E-Conference</v-toolbar-title>
      <v-spacer></v-spacer>
  
      <v-menu v-if="user">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title class="text-caption">{{ user.email }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </template>
  
  <script setup>
  import { auth } from '../firebase'
  import { onAuthStateChanged, signOut } from 'firebase/auth'
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const user = ref(null)
  const router = useRouter()
  
  onMounted(() => {
    onAuthStateChanged(auth, u => {
      user.value = u
    })
  })
  
  const logout = async () => {
    await signOut(auth)
    router.push('/login')
  }
  </script>
  