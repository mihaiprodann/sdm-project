<template>
  <div class="papers-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="4"
      ></v-progress-circular>
      <p class="text-body-1 mt-4 text-medium-emphasis">Loading your papers...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="papers.length === 0" class="empty-state text-center py-12">
      <v-icon size="120" color="grey-lighten-1" class="mb-6">mdi-file-document-outline</v-icon>
      <h3 class="text-h5 font-weight-bold mb-3">No Papers Yet</h3>
      <p class="text-body-1 text-medium-emphasis mb-6">
        You haven't submitted any papers yet. Start by submitting your first research paper!
      </p>
      <v-btn
        color="primary"
        size="large"
        variant="flat"
        rounded="lg"
        @click="$emit('goToSubmit')"
      >
        <v-icon start>mdi-plus-circle</v-icon>
        Submit Your First Paper
      </v-btn>
    </div>

    <!-- Papers Grid -->
    <div v-else>
      <!-- Filter and Sort Controls -->
      <div class="controls-section mb-6">
        <v-row align="center">
          <v-col cols="12" md="6">
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
          <v-col cols="12" md="3">
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
          <v-col cols="12" md="3">
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
        </v-row>
      </div>

      <!-- Papers List -->
      <v-row>
        <v-col
          v-for="paper in filteredPapers"
          :key="paper.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="paper-card elevation-3"
            rounded="xl"
            :class="getCardClass(paper)"
          >
            <!-- Card Header -->
            <div class="card-header pa-4 pb-2">
              <div class="d-flex align-start justify-space-between">
                <div class="flex-grow-1">
                  <h4 class="text-h6 font-weight-bold line-clamp-2 mb-2">
                    {{ paper.title }}
                  </h4>
                  <div class="d-flex align-center mb-2">
                    <v-chip
                      :color="getStatusColor(paper.status)"
                      size="small"
                      variant="flat"
                      class="me-2"
                    >
                      <v-icon start size="16">{{ getStatusIcon(paper.status) }}</v-icon>
                      {{ paper.status }}
                    </v-chip>
                    <v-chip
                      v-if="paper.averageScore !== null"
                      :color="getScoreColor(paper.averageScore)"
                      size="small"
                      variant="outlined"
                    >
                      <v-icon start size="16">mdi-star</v-icon>
                      {{ paper.averageScore.toFixed(1) }}
                    </v-chip>
                  </div>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="viewPaper(paper)">
                      <template v-slot:prepend>
                        <v-icon>mdi-eye</v-icon>
                      </template>
                      <v-list-item-title>View PDF</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyLink(paper)">
                      <template v-slot:prepend>
                        <v-icon>mdi-link</v-icon>
                      </template>
                      <v-list-item-title>Copy Link</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Card Content -->
            <v-card-text class="pt-0">
              <!-- Co-authors -->
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Co-authors:</div>
                <div v-if="paper.coauthors?.length" class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="coauthor in paper.coauthors.slice(0, 3)"
                    :key="coauthor"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                  >
                    {{ getAuthorName(coauthor) }}
                  </v-chip>
                  <v-chip
                    v-if="paper.coauthors.length > 3"
                    size="x-small"
                    variant="outlined"
                    color="grey"
                  >
                    +{{ paper.coauthors.length - 3 }} more
                  </v-chip>
                </div>
                <span v-else class="text-caption text-medium-emphasis">None</span>
              </div>

              <!-- Keywords -->
              <div v-if="paper.keywords?.length" class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Keywords:</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="keyword in paper.keywords.slice(0, 4)"
                    :key="keyword"
                    size="x-small"
                    variant="tonal"
                    color="secondary"
                  >
                    {{ keyword }}
                  </v-chip>
                  <v-chip
                    v-if="paper.keywords.length > 4"
                    size="x-small"
                    variant="tonal"
                    color="grey"
                  >
                    +{{ paper.keywords.length - 4 }}
                  </v-chip>
                </div>
              </div>

              <!-- Submission Date -->
              <div class="text-caption text-medium-emphasis">
                <v-icon size="14" class="me-1">mdi-calendar</v-icon>
                Submitted {{ formatDate(paper.submittedAt) }}
              </div>
            </v-card-text>

            <!-- Card Actions -->
            <v-card-actions class="px-4 pb-4">
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                rounded="lg"
                :href="paper.pdfLink"
                target="_blank"
                block
              >
                <v-icon start>mdi-file-pdf-box</v-icon>
                View PDF
              </v-btn>
            </v-card-actions>

            <!-- Reviews Count Badge -->
            <div v-if="paper.reviewsCount > 0" class="reviews-badge">
              <v-chip size="small" color="info" variant="flat">
                <v-icon start size="16">mdi-comment-text</v-icon>
                {{ paper.reviewsCount }} review{{ paper.reviewsCount !== 1 ? 's' : '' }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Results -->
      <div v-if="filteredPapers.length === 0 && papers.length > 0" class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-file-search-outline</v-icon>
        <h4 class="text-h6 font-weight-bold mb-2">No Papers Found</h4>
        <p class="text-body-2 text-medium-emphasis">
          Try adjusting your search or filter criteria
        </p>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { db, auth } from '../firebase'
import { ref as dbRef, get } from 'firebase/database'

// Emits
const emit = defineEmits(['goToSubmit'])

// Reactive data
const papers = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const filterStatus = ref('')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Options for filters
const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Oldest First', value: 'oldest' },
  { title: 'Title A-Z', value: 'title-asc' },
  { title: 'Title Z-A', value: 'title-desc' },
  { title: 'Highest Score', value: 'score-desc' },
  { title: 'Lowest Score', value: 'score-asc' }
]

const statusOptions = [
  { title: 'All Status', value: '' },
  { title: 'Accepted', value: 'Accepted' },
  { title: 'Rejected', value: 'Rejected' },
  { title: 'Pending', value: 'Pending' }
]

// Computed properties
const filteredPapers = computed(() => {
  let filtered = [...papers.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(paper =>
      paper.title.toLowerCase().includes(query) ||
      paper.keywords?.some(k => k.toLowerCase().includes(query)) ||
      paper.coauthors?.some(a => a.toLowerCase().includes(query))
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
        return new Date(b.submittedAt) - new Date(a.submittedAt)
      case 'oldest':
        return new Date(a.submittedAt) - new Date(b.submittedAt)
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      case 'score-desc':
        return (b.averageScore || 0) - (a.averageScore || 0)
      case 'score-asc':
        return (a.averageScore || 0) - (b.averageScore || 0)
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
  if (score >= 4) return 'success'
  if (score >= 3) return 'primary'
  if (score >= 2) return 'warning'
  return 'error'
}

const getCardClass = (paper) => {
  return {
    'accepted-card': paper.status === 'Accepted',
    'rejected-card': paper.status === 'Rejected',
    'pending-card': paper.status === 'Pending'
  }
}

const getAuthorName = (email) => {
  return email.split('@')[0]
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewPaper = (paper) => {
  window.open(paper.pdfLink, '_blank')
}

const copyLink = async (paper) => {
  try {
    await navigator.clipboard.writeText(paper.pdfLink)
    showSnackbar('Link copied to clipboard!', 'success')
  } catch (err) {
    showSnackbar('Failed to copy link', 'error')
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Load papers data
onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    loading.value = false
    return
  }

  try {
    const papersSnap = await get(dbRef(db, 'papers'))
    const papersData = papersSnap.val()
    if (!papersData) {
      loading.value = false
      return
    }

    const usersSnap = await get(dbRef(db, 'users'))
    const usersData = usersSnap.val() || {}

    const reviewsSnap = await get(dbRef(db, 'reviews'))
    const reviewsData = reviewsSnap.val() || {}

    papers.value = Object.entries(papersData)
      .filter(([_, paper]) => paper.mainAuthor === user.uid)
      .map(([id, paper]) => {
        const paperReviews = reviewsData[id] || {}
        const reviewsArray = Object.values(paperReviews)
        
        const averageScore = reviewsArray.length > 0
          ? reviewsArray.reduce((sum, r) => sum + (r.score || 0), 0) / reviewsArray.length
          : null

        const status = averageScore !== null
          ? averageScore >= 3 ? 'Accepted' : 'Rejected'
          : 'Pending'

        return {
          id,
          ...paper,
          coauthors: (paper.coauthors || []).map(uid => usersData[uid]?.email || uid),
          keywords: paper.keywords || [],
          reviewsCount: reviewsArray.length,
          averageScore,
          status
        }
      })

  } catch (error) {
    console.error('Error loading papers:', error)
    showSnackbar('Failed to load papers', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.papers-container {
  max-width: 100%;
}

.paper-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  border-left: 4px solid transparent;
}

.paper-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.accepted-card {
  border-left-color: rgb(var(--v-theme-success));
}

.rejected-card {
  border-left-color: rgb(var(--v-theme-error));
}

.pending-card {
  border-left-color: rgb(var(--v-theme-warning));
}

.card-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.8) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reviews-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.controls-section {
  background: rgba(var(--v-theme-surface), 0.6);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

/* Dark theme adjustments */
.v-theme--dark .card-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.9) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.v-theme--dark .controls-section {
  background: rgba(var(--v-theme-surface), 0.4);
}

/* Animation for cards */
.paper-card {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .controls-section .v-col {
    margin-bottom: 0.5rem;
  }
}
</style>