<template>
  <v-app-bar 
    color="transparent" 
    elevation="0"
    class="navbar-modern"
    height="70"
  >
    <div class="navbar-container">
      <div class="navbar-brand">
        <v-icon class="brand-icon" size="28">mdi-video-account</v-icon>
        <span class="brand-text">E-Conference</span>
      </div>
      
      <v-spacer></v-spacer>
      
      <div v-if="user" class="user-section">
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn 
              v-bind="props" 
              class="user-avatar-btn"
              variant="text"
              size="large"
            >
              <div class="user-avatar">
                <span class="avatar-text">{{ getInitials(user.email) }}</span>
              </div>
            </v-btn>
          </template>
          
          <v-card class="user-menu" min-width="200">
            <v-card-text class="pa-3">
              <div class="user-info">
                <div class="user-avatar-small">
                  <span class="avatar-text-small">{{ getInitials(user.email) }}</span>
                </div>
                <div class="user-details">
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </v-card-text>
            
            <v-divider class="mx-3"></v-divider>
            
            <v-card-actions class="pa-3">
              <v-btn 
                @click="logout" 
                variant="text" 
                color="error"
                block
                class="logout-btn"
              >
                <v-icon start size="18">mdi-logout</v-icon>
                Logout
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div>
    </div>
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

const getInitials = (email) => {
  if (!email) return 'U'
  const name = email.split('@')[0]
  return name.charAt(0).toUpperCase()
}
</script>

<style scoped>
.navbar-modern {
  backdrop-filter: blur(20px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.navbar-container {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  color: #6366f1;
}

.brand-text {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.025em;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-avatar-btn {
  padding: 4px !important;
  min-width: unset !important;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-menu {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text-small {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-email {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  word-break: break-all;
}

.logout-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
}

</style>