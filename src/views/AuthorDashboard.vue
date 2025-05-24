<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="hero-section">
      <v-container>
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div>
            <h1 class="text-h3 font-weight-bold text-white mb-2">
              Welcome back, Author! 👋
            </h1>
            <p class="text-h6 text-white text-opacity-90">
              Manage your research papers and track reviews
            </p>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Stats Cards Section -->
    <v-container class="stats-section">
      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card elevation-3" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="primary" class="mb-3">mdi-file-document</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.totalPapers }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Papers</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card elevation-3" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="success" class="mb-3">mdi-check-circle</v-icon>
              <div class="text-h4 font-weight-bold text-success">{{ stats.acceptedPapers }}</div>
              <div class="text-body-2 text-medium-emphasis">Accepted</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card elevation-3" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="warning" class="mb-3">mdi-clock-outline</v-icon>
              <div class="text-h4 font-weight-bold text-warning">{{ stats.pendingPapers }}</div>
              <div class="text-body-2 text-medium-emphasis">Pending</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card elevation-3" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="info" class="mb-3">mdi-star</v-icon>
              <div class="text-h4 font-weight-bold text-info">{{ stats.averageScore }}</div>
              <div class="text-body-2 text-medium-emphasis">Avg. Score</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Main Content Tabs -->
    <v-container>
      <v-card class="main-content-card elevation-4" rounded="xl">
        <v-tabs 
          v-model="activeTab" 
          color="primary" 
          align-with-title
          class="px-4 pt-4"
          height="60"
        >
          <v-tab value="submit" class="text-none font-weight-medium">
            <v-icon start>mdi-plus-circle</v-icon>
            Submit Paper
          </v-tab>
          <v-tab value="papers" class="text-none font-weight-medium">
            <v-icon start>mdi-file-document-multiple</v-icon>
            My Papers ({{ stats.totalPapers }})
          </v-tab>
          <v-tab value="reviews" class="text-none font-weight-medium">
            <v-icon start>mdi-comment-text-multiple</v-icon>
            Reviews
          </v-tab>
        </v-tabs>

        <v-divider></v-divider>

        <v-window v-model="activeTab">
          <!-- Submit Paper Tab -->
          <v-window-item value="submit">
            <div class="pa-6">
              <div class="text-center mb-6">
                <v-icon size="48" color="primary" class="mb-3">mdi-file-upload</v-icon>
                <h3 class="text-h5 font-weight-bold mb-2">Submit New Paper</h3>
                <p class="text-body-1 text-medium-emphasis">Share your research with the academic community</p>
              </div>
              <PaperSubmit />
            </div>
          </v-window-item>

          <!-- My Papers Tab -->
          <v-window-item value="papers">
            <div class="pa-6">
              <div class="d-flex align-center justify-space-between mb-6">
                <div>
                  <h3 class="text-h5 font-weight-bold mb-2">Your Submitted Papers</h3>
                  <p class="text-body-1 text-medium-emphasis">Manage and track your research submissions</p>
                </div>
                <v-btn color="primary" variant="outlined" @click="activeTab = 'submit'">
                  <v-icon start>mdi-plus</v-icon>
                  New Paper
                </v-btn>
              </div>
              <MyPapers />
            </div>
          </v-window-item>

          <!-- Reviews Tab -->
          <v-window-item value="reviews">
            <div class="pa-6">
              <div class="mb-6">
                <h3 class="text-h5 font-weight-bold mb-2">Review Results</h3>
                <p class="text-body-1 text-medium-emphasis">See feedback and scores from peer reviewers</p>
              </div>
              <MyReviews />
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </v-container>

    <!-- Quick Actions FAB -->
    <v-fab
      bottom
      right
      :absolute="true"
      :top="true"
      :right="true"
      rounded="full"
      size="large"
      color="primary"
      icon="mdi-plus"
      @click="activeTab = 'submit'"
      class="fab-margin"
    >
      <template v-slot:tooltip>
        <span>Submit New Paper</span>
      </template>
    </v-fab>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PaperSubmit from '../components/PaperSubmit.vue'
import MyPapers from '../components/MyPapers.vue'
import MyReviews from '../components/MyReviews.vue'
import { db, auth } from '../firebase'
import { get, ref as dbRef } from 'firebase/database'

const activeTab = ref('submit')
const papersData = ref([])
const reviewsData = ref({})

// Stats computation
const stats = computed(() => {
  const totalPapers = papersData.value.length
  
  let acceptedPapers = 0
  let pendingPapers = 0
  let totalScore = 0
  let reviewedPapers = 0

  papersData.value.forEach(paper => {
    const paperReviews = reviewsData.value[paper.id] || {}
    const reviewsArray = Object.values(paperReviews)
    
    if (reviewsArray.length === 0) {
      pendingPapers++
    } else {
      const average = reviewsArray.reduce((sum, r) => sum + (r.score || 0), 0) / reviewsArray.length
      if (average >= 3) acceptedPapers++
      totalScore += average
      reviewedPapers++
    }
  })

  const averageScore = reviewedPapers > 0 
    ? (totalScore / reviewedPapers).toFixed(1) 
    : '0.0'

  return {
    totalPapers,
    acceptedPapers,
    pendingPapers,
    averageScore
  }
})

// Load data for stats
onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    // Load papers
    const papersSnap = await get(dbRef(db, 'papers'))
    const allPapers = papersSnap.val() || {}
    
    papersData.value = Object.entries(allPapers)
      .filter(([_, paper]) => paper.mainAuthor === user.uid)
      .map(([id, paper]) => ({ id, ...paper }))

    // Load reviews
    const reviewsSnap = await get(dbRef(db, 'reviews'))
    reviewsData.value = reviewsSnap.val() || {}
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 0 4rem 0;
  margin-bottom: -2rem;
  position: relative;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 2rem 2rem 0 0;
}

.stats-section {
  position: relative;
  z-index: 1;
}

.stats-card {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.main-content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
}

.fab-margin {
  margin-bottom: 1rem;
  margin-right: 1rem;
}

/* Dark theme adjustments */
.v-theme--dark .dashboard-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.v-theme--dark .hero-section {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.v-theme--dark .hero-section::after {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.v-theme--dark .stats-card {
  background: rgba(33, 33, 33, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .main-content-card {
  background: rgba(33, 33, 33, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Smooth transitions */
.v-window-item {
  transition: all 0.3s ease;
}

/* Custom tab styling */
.v-tabs :deep(.v-tab) {
  transition: all 0.3s ease;
}

.v-tabs :deep(.v-tab:hover) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>