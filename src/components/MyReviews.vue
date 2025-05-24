<template>
  <div class="reviews-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="4"
      ></v-progress-circular>
      <p class="text-body-1 mt-4 text-medium-emphasis">Loading review results...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="papers.length === 0" class="empty-state text-center py-12">
      <v-icon size="120" color="grey-lighten-1" class="mb-6">mdi-comment-text-outline</v-icon>
      <h3 class="text-h5 font-weight-bold mb-3">No Reviews Yet</h3>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Your papers haven't received any reviews yet. Reviews will appear here once they're completed.
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        rounded="lg"
        @click="$emit('goToSubmit')"
      >
        <v-icon start>mdi-plus-circle</v-icon>
        Submit Another Paper
      </v-btn>
    </div>

    <!-- Reviews Content -->
    <div v-else>
      <!-- Summary Stats -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card text-center pa-4" rounded="xl" elevation="2">
            <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h4 font-weight-bold text-success">{{ stats.accepted }}</div>
            <div class="text-body-2 text-medium-emphasis">Accepted</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card text-center pa-4" rounded="xl" elevation="2">
            <v-icon size="32" color="error" class="mb-2">mdi-close-circle</v-icon>
            <div class="text-h4 font-weight-bold text-error">{{ stats.rejected }}</div>
            <div class="text-body-2 text-medium-emphasis">Rejected</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card text-center pa-4" rounded="xl" elevation="2">
            <v-icon size="32" color="warning" class="mb-2">mdi-clock-outline</v-icon>
            <div class="text-h4 font-weight-bold text-warning">{{ stats.pending }}</div>
            <div class="text-body-2 text-medium-emphasis">Pending</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card text-center pa-4" rounded="xl" elevation="2">
            <v-icon size="32" color="info" class="mb-2">mdi-star</v-icon>
            <div class="text-h4 font-weight-bold text-info">{{ stats.averageScore }}</div>
            <div class="text-body-2 text-medium-emphasis">Avg. Score</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filter Controls -->
      <div class="controls-section mb-6">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search papers..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              rounded="lg"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Filter by status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              rounded="lg"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
            ></v-select>
          </v-col>
        </v-row>
      </div>

      <!-- Papers with Reviews -->
      <div class="papers-list">
        <v-card
          v-for="paper in filteredPapers"
          :key="paper.id"
          class="paper-review-card mb-6 elevation-4"
          rounded="xl"
        >
          <!-- Paper Header -->
          <div class="paper-header pa-6 pb-4">
            <div class="d-flex align-start justify-space-between flex-wrap">
              <div class="flex-grow-1 me-4">
                <h3 class="text-h5 font-weight-bold mb-3">{{ paper.title }}</h3>
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    :color="getStatusColor(paper.status)"
                    size="large"
                    variant="flat"
                    class="font-weight-medium"
                  >
                    <v-icon start>{{ getStatusIcon(paper.status) }}</v-icon>
                    {{ paper.status }}
                  </v-chip>
                  <v-chip
                    v-if="paper.average !== null"
                    :color="getScoreColor(paper.average)"
                    size="large"
                    variant="outlined"
                    class="font-weight-medium"
                  >
                    <v-icon start>mdi-star</v-icon>
                    {{ paper.average.toFixed(2) }} / 5
                  </v-chip>
                  <v-chip
                    color="info"
                    size="large"
                    variant="tonal"
                  >
                    <v-icon start>mdi-comment-text</v-icon>
                    {{ paper.reviews.length }} review{{ paper.reviews.length !== 1 ? 's' : '' }}
                  </v-chip>
                </div>
              </div>
              <div class="score-circle">
                <v-progress-circular
                  :model-value="paper.average ? (paper.average / 5) * 100 : 0"
                  :color="getScoreColor(paper.average || 0)"
                  size="80"
                  width="6"
                >
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold">
                      {{ paper.average ? paper.average.toFixed(1) : 'N/A' }}
                    </div>
                    <div class="text-caption">/ 5</div>
                  </div>
                </v-progress-circular>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- Reviews Section -->
          <div class="reviews-section pa-6">
            <div v-if="paper.reviews.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-3">mdi-comment-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis">No reviews submitted yet</p>
              <p class="text-body-2 text-medium-emphasis">Your paper is still being reviewed</p>
            </div>

            <div v-else>
              <h4 class="text-h6 font-weight-bold mb-4">
                <v-icon class="me-2">mdi-comment-text-multiple</v-icon>
                Reviewer Feedback
              </h4>

              <v-row>
                <v-col
                  v-for="(review, index) in paper.reviews"
                  :key="index"
                  cols="12"
                  md="6"
                >
                  <v-card
                    class="review-card elevation-2"
                    rounded="lg"
                    :class="getReviewCardClass(review.score)"
                  >
                    <v-card-text class="pa-4">
                      <!-- Review Header -->
                      <div class="d-flex align-center justify-space-between mb-3">
                        <div class="d-flex align-center">
                          <v-avatar size="32" :color="getScoreColor(review.score)" class="me-3">
                            <span class="text-caption font-weight-bold text-white">
                              R{{ index + 1 }}
                            </span>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium">Reviewer #{{ index + 1 }}</div>
                            <div class="text-caption text-medium-emphasis">
                              {{ formatReviewDate(review.submittedAt) }}
                            </div>
                          </div>
                        </div>
                        <div class="text-end">
                          <div class="text-h6 font-weight-bold" :class="getScoreTextColor(review.score)">
                            {{ review.score }}/5
                          </div>
                          <v-rating
                            :model-value="review.score"
                            readonly
                            size="small"
                            density="compact"
                            :color="getScoreColor(review.score)"
                          ></v-rating>
                        </div>
                      </div>

                      <!-- Review Comment -->
                      <div class="review-comment">
                        <div class="text-body-2 text-medium-emphasis mb-2">
                          <v-icon size="16" class="me-1">mdi-comment-quote</v-icon>
                          Feedback:
                        </div>
                        <div class="text-body-1 review-text">
                          {{ review.comment || 'No comment provided' }}
                        </div>
                      </div>

                      <!-- Review Score Breakdown -->
                      <div class="mt-3">
                        <v-chip
                          :color="getScoreColor(review.score)"
                          size="small"
                          variant="tonal"
                        >
                          {{ getScoreLabel(review.score) }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Review Summary -->
              <v-card class="review-summary mt-4" rounded="lg" color="deep-purple-lighten-4">
                <v-card-text class="pa-4">
                  <h5 class="text-subtitle-1 font-weight-bold mb-3">
                    <v-icon class="me-2">mdi-chart-line</v-icon>
                    Review Summary
                  </h5>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center mb-2">
                        <span class="text-body-2 text-medium-emphasis me-2">Average Score:</span>
                        <span class="font-weight-bold">{{ paper.average.toFixed(2) }}/5</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <span class="text-body-2 text-medium-emphasis me-2">Total Reviews:</span>
                        <span class="font-weight-bold">{{ paper.reviews.length }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <span class="text-body-2 text-medium-emphasis me-2">Decision:</span>
                        <v-chip
                          :color="getStatusColor(paper.status)"
                          size="small"
                          variant="flat"
                        >
                          {{ paper.status }}
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="score-distribution">
                        <div class="text-body-2 text-medium-emphasis mb-2">Score Distribution:</div>
                        <div class="d-flex align-center gap-1">
                          <span
                            v-for="score in [1, 2, 3, 4, 5]"
                            :key="score"
                            class="score-dot"
                            :class="{ 'active': paper.reviews.some(r => r.score === score)}"
                            :style="{ backgroundColor: getScoreColor(score) }"
                          >
                            {{ score }}
                          </span>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-card>
      </div>

      <!-- No Results -->
      <div v-if="filteredPapers.length === 0 && papers.length > 0" class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-file-search-outline</v-icon>
        <h4 class="text-h6 font-weight-bold mb-2">No Papers Found</h4>
        <p class="text-body-2 text-medium-emphasis">
          Try adjusting your search or filter criteria
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db, auth } from '../firebase'
import { get, ref as dbRef } from 'firebase/database'

// Emits
const emit = defineEmits(['goToSubmit'])

// Reactive data
const papers = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('')
const sortBy = ref('newest')

// Options
const statusOptions = [
  { title: 'All Status', value: '' },
  { title: 'Accepted', value: 'Accepted' },
  { title: 'Rejected', value: 'Rejected' },
  { title: 'Pending', value: 'Pending' }
]

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Highest Score', value: 'score-desc' },
  { title: 'Lowest Score', value: 'score-asc' },
  { title: 'Most Reviews', value: 'reviews-desc' }
]

// Computed properties
const stats = computed(() => {
  const accepted = papers.value.filter(p => p.status === 'Accepted').length
  const rejected = papers.value.filter(p => p.status === 'Rejected').length
  const pending = papers.value.filter(p => p.status === 'Pending').length
  
  const reviewedPapers = papers.value.filter(p => p.average !== null)
  const averageScore = reviewedPapers.length > 0
    ? (reviewedPapers.reduce((sum, p) => sum + p.average, 0) / reviewedPapers.length).toFixed(1)
    : '0.0'

  return { accepted, rejected, pending, averageScore }
})

const filteredPapers = computed(() => {
  let filtered = [...papers.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(paper =>
      paper.title.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(paper => paper.status === filterStatus.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return b.id.localeCompare(a.id)
      case 'score-desc':
        return (b.average || 0) - (a.average || 0)
      case 'score-asc':
        return (a.average || 0) - (b.average || 0)
      case 'reviews-desc':
        return b.reviews.length - a.reviews.length
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const getStatusColor = (status) => {
  switch (status) {
    case 'Accepted': return 'success'
    case 'Rejected': return 'error'
    case 'Pending': return 'warning'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Accepted': return 'mdi-check-circle'
    case 'Rejected': return 'mdi-close-circle'
    case 'Pending': return 'mdi-clock-outline'
    default: return 'mdi-help-circle'
  }
}

const getScoreColor = (score) => {
  if (score >= 4.5) return 'success'
  if (score >= 4) return 'light-green'
  if (score >= 3) return 'primary'
  if (score >= 2) return 'orange'
  return 'error'
}

const getScoreTextColor = (score) => {
  if (score >= 4) return 'text-success'
  if (score >= 3) return 'text-primary'
  if (score >= 2) return 'text-warning'
  return 'text-error'
}

const getScoreLabel = (score) => {
  if (score >= 4.5) return 'Excellent'
  if (score >= 4) return 'Very Good'
  if (score >= 3) return 'Good'
  if (score >= 2) return 'Fair'
  return 'Poor'
}

const getReviewCardClass = (score) => {
  if (score >= 4) return 'review-positive'
  if (score >= 3) return 'review-neutral'
  return 'review-negative'
}

const formatReviewDate = (timestamp) => {
  if (!timestamp) return 'Recently'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Load data
onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    loading.value = false
    return
  }

  try {
    const papersSnap = await get(dbRef(db, 'papers'))
    const allPapers = papersSnap.val() || {}

    const myPapers = Object.entries(allPapers)
      .filter(([_, paper]) => paper.mainAuthor === user.uid)

    const reviewsSnap = await get(dbRef(db, 'reviews'))
    const allReviews = reviewsSnap.val() || {}

    papers.value = myPapers.map(([id, paper]) => {
      const reviewsForPaper = allReviews[id] || {}
      const reviewsArray = Object.values(reviewsForPaper)

      const average = reviewsArray.length > 0
        ? reviewsArray.reduce((sum, r) => sum + (r.score || 0), 0) / reviewsArray.length
        : null

      const status = average !== null
        ? average >= 3 ? 'Accepted' : 'Rejected'
        : 'Pending'

      return {
        id,
        title: paper.title,
        reviews: reviewsArray,
        average,
        status
      }
    })
  } catch (error) {
    console.error('Error loading reviews:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.reviews-container {
  max-width: 100%;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.paper-review-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.paper-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.score-circle {
  text-align: center;
}

.review-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.review-positive {
  border-left-color: rgb(var(--v-theme-success));
}

.review-neutral {
  border-left-color: rgb(var(--v-theme-primary));
}

.review-negative {
  border-left-color: rgb(var(--v-theme-error));
}

.review-text {
  line-height: 1.5;
  padding: 0.5rem;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}

.score-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.score-dot.active {
  opacity: 1;
  transform: scale(1.1);
}

.controls-section {
  background: rgba(var(--v-theme-surface), 0.6);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.empty-state {
  max-width: 500px;
  margin: 0 auto;
}

/* Animation */
.paper-review-card {
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark theme adjustments */
.v-theme--dark .paper-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.v-theme--dark .controls-section {
  background: rgba(var(--v-theme-surface), 0.4);
}

.v-theme--dark .review-text {
  background: rgba(var(--v-theme-surface), 0.3);
}
</style>