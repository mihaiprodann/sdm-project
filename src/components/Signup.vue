<template>
  <div class="signup-container fill-height d-flex align-center justify-center pa-4">
    <v-card 
      class="signup-card elevation-12" 
      max-width="450" 
      width="100%"
      rounded="xl"
    >
      <!-- Header Section -->
      <div class="text-center pa-8 pb-4">
        <v-avatar size="64" class="mb-4" color="success">
          <v-icon size="32" color="white">mdi-account-plus</v-icon>
        </v-avatar>
        <h2 class="text-h4 font-weight-bold mb-2">Create Account</h2>
        <p class="text-body-1 text-medium-emphasis">Join our conference platform</p>
      </div>

      <!-- Form Section -->
      <v-card-text class="px-8 pb-8">
        <v-form @submit.prevent="register" ref="form">
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
            class="mb-4"
            :rules="[rules.required, rules.minLength]"
            validate-on="blur"
            rounded="lg"
            hint="Minimum 6 characters"
            persistent-hint
          />

          <v-text-field
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm Password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            class="mb-4"
            :rules="[rules.required, rules.passwordMatch]"
            validate-on="blur"
            rounded="lg"
          />

          <v-select
            v-model="role"
            :items="roleOptions"
            label="Select Your Role"
            variant="outlined"
            prepend-inner-icon="mdi-account-star-outline"
            class="mb-6"
            :rules="[rules.required]"
            validate-on="blur"
            rounded="lg"
            hint="Choose your role in the conference"
            persistent-hint
          />

          <v-btn
            type="submit"
            color="success"
            size="large"
            variant="flat"
            block
            class="mb-4 text-none font-weight-bold"
            rounded="lg"
            :loading="loading"
            :disabled="!isFormValid"
          >
            Create Account
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

        <!-- Success Alert -->
        <v-alert
          v-if="success"
          type="success"
          variant="tonal"
          class="mb-4"
          rounded="lg"
        >
          {{ success }}
        </v-alert>

        <!-- Divider -->
        <v-divider class="my-6">
          <span class="text-caption text-medium-emphasis px-4">OR</span>
        </v-divider>

        <!-- Login Link -->
        <div class="text-center">
          <span class="text-body-2 text-medium-emphasis">Already have an account? </span>
          <RouterLink 
            to="/login" 
            class="text-success text-decoration-none font-weight-medium"
          >
            Sign in
          </RouterLink>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'
import { RouterLink, useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const form = ref(null)

const router = useRouter()

// Role options with descriptions
const roleOptions = [
  { title: 'Author - Submit and present papers', value: 'author' },
  { title: 'Reviewer - Review submitted papers', value: 'reviewer' }
]

// Validation rules
const rules = {
  required: value => !!value || 'This field is required',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Please enter a valid email address'
  },
  minLength: value => value.length >= 6 || 'Password must be at least 6 characters',
  passwordMatch: value => value === password.value || 'Passwords do not match'
}

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         confirmPassword.value && 
         role.value && 
         password.value === confirmPassword.value &&
         password.value.length >= 6 &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const register = async () => {
  if (!isFormValid.value) {
    form.value?.validate()
    return
  }
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    
    await set(dbRef(db, `users/${user.uid}`), {
      email: email.value,
      role: role.value,
      createdAt: new Date().toISOString()
    })
    
    success.value = 'Account created successfully! Redirecting...'
    
    // Redirect after a brief delay to show success message
    setTimeout(() => {
      router.push(`/dashboard/${role.value}`)
    }, 1500)
    
  } catch (err) {
    // Handle specific Firebase errors
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'An account with this email already exists.'
        break
      case 'auth/invalid-email':
        error.value = 'Please enter a valid email address.'
        break
      case 'auth/operation-not-allowed':
        error.value = 'Account creation is currently disabled.'
        break
      case 'auth/weak-password':
        error.value = 'Password is too weak. Please choose a stronger password.'
        break
      default:
        error.value = 'Failed to create account. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
}

.signup-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fill-height {
  min-height: 100vh;
}

/* Dark theme adjustments */
.v-theme--dark .signup-card {
  background: rgba(33, 33, 33, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .signup-container {
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
}

.v-theme--dark .fill-height {
  min-height: 100vh;
}

/* Custom styling for select items */
:deep(.v-list-item-title) {
  font-size: 0.875rem;
}

/* Animation for success state */
.v-alert.v-alert--variant-tonal.v-theme--light.text-success {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>