<template>
    <div class="login-container fill-height d-flex align-center justify-center pa-4">
      <v-card 
        class="login-card elevation-12" 
        max-width="420" 
        width="100%"
        rounded="xl"
      >
        <!-- Header Section -->
        <div class="text-center pa-8 pb-4">
          <v-avatar size="64" class="mb-4" color="primary">
            <v-icon size="32" color="white">mdi-account-circle</v-icon>
          </v-avatar>
          <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
          <p class="text-body-1 text-medium-emphasis">Sign in to your account</p>
        </div>
  
        <!-- Form Section -->
        <v-card-text class="px-8 pb-8">
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="email"
              label="Email Address"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email-outline"
              class="mb-4"
              :rules="[rules.required, rules.email]"
              validate-on="blur"
              rounded="lg"
            />
            
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              variant="outlined"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-6"
              :rules="[rules.required]"
              validate-on="blur"
              rounded="lg"
            />
  
            <v-btn
              type="submit"
              color="primary"
              size="large"
              variant="flat"
              block
              class="mb-4 text-none font-weight-bold"
              rounded="lg"
              :loading="loading"
              :disabled="!email || !password"
            >
              Sign In
            </v-btn>
          </v-form>
  
          <!-- Error Alert -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            rounded="lg"
            closable
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>
  
          <!-- Divider -->
          <v-divider class="my-6">
            <span class="text-caption text-medium-emphasis px-4">OR</span>
          </v-divider>
  
          <!-- Social Login Options -->
          <div class="d-flex flex-column gap-3 mb-6">
            <v-btn
              variant="outlined"
              size="large"
              block
              class="text-none"
              rounded="lg"
              prepend-icon="mdi-google"
            >
              Continue with Google
            </v-btn>
          </div>
  
          <!-- Sign Up Link -->
          <div class="text-center">
            <span class="text-body-2 text-medium-emphasis">Don't have an account? </span>
            <RouterLink 
              to="/signup" 
              class="text-primary text-decoration-none font-weight-medium"
            >
              Create one
            </RouterLink>
          </div>
        </v-card-text>
      </v-card>
    </div>
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
  const loading = ref(false)
  const showPassword = ref(false)
  
  const router = useRouter()
  
  // Validation rules
  const rules = {
    required: value => !!value || 'This field is required',
    email: value => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Please enter a valid email address'
    }
  }
  
  const login = async () => {
    if (!email.value || !password.value) return
    
    loading.value = true
    error.value = ''
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user
      const snap = await get(dbRef(db, `users/${user.uid}`))
      const userData = snap.val()
  
      if (userData?.role) {
        router.push(`/dashboard/${userData.role}`)
      } else {
        error.value = 'No role found for user. Please contact administrator.'
      }
    } catch (err) {
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/user-not-found':
          error.value = 'No account found with this email address.'
          break
        case 'auth/wrong-password':
          error.value = 'Incorrect password. Please try again.'
          break
        case 'auth/invalid-email':
          error.value = 'Please enter a valid email address.'
          break
        case 'auth/too-many-requests':
          error.value = 'Too many failed attempts. Please try again later.'
          break
        default:
          error.value = 'Login failed. Please check your credentials and try again.'
      }
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .fill-height {
    min-height: 100vh;
  }
  
  .gap-3 > * + * {
    margin-top: 12px;
  }
  
  /* Dark theme adjustments */
  .v-theme--dark .login-card {
    background: rgba(33, 33, 33, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .v-theme--dark .login-container {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .v-theme--dark .fill-height {
    min-height: 100vh;
  }
  </style>