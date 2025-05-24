<template>
  <div class="papers-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h3 class="main-title">
          <v-icon class="title-icon">mdi-file-document-multiple</v-icon>
          Assigned Papers for Review
        </h3>
        <div class="stats-badge" v-if="papers.length > 0">
          <span class="badge-text">{{ papers.length }} paper{{ papers.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
      <v-divider class="header-divider"></v-divider>
    </div>

    <!-- Empty State -->
    <div v-if="papers.length === 0" class="empty-state">
      <v-icon size="80" class="empty-icon">mdi-file-search-outline</v-icon>
      <h4 class="empty-title">No Papers Assigned Yet</h4>
      <p class="empty-subtitle">Your assigned papers will appear here once they're allocated by the conference organizers.</p>
    </div>

    <!-- Papers Grid -->
    <div v-else class="papers-grid">
      <v-card 
        v-for="paper in papers" 
        :key="paper.id" 
        class="paper-card"
        elevation="0"
        :class="{ 'reviewed': paper.isReviewed }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="paper-status">
            <v-chip 
              :color="paper.isReviewed ? 'success' : 'warning'"
              :variant="paper.isReviewed ? 'flat' : 'outlined'"
              size="small"
            >
              <v-icon start size="16">
                {{ paper.isReviewed ? 'mdi-check-circle' : 'mdi-clock-outline' }}
              </v-icon>
              {{ paper.isReviewed ? 'Reviewed' : 'Pending' }}
            </v-chip>
          </div>
        </div>

        <!-- Paper Title -->
        <div class="paper-title-section">
          <h4 class="paper-title">{{ paper.title }}</h4>
          <div class="author-info">
            <v-icon size="16" class="author-icon">mdi-account</v-icon>
            <span class="author-text">{{ paper.mainAuthorEmail || paper.mainAuthor }}</span>
          </div>
        </div>

        <!-- PDF Link -->
        <div class="pdf-section">
          <v-btn
            :href="paper.pdfLink"
            target="_blank"
            variant="outlined"
            color="primary"
            size="small"
            class="pdf-btn"
          >
            <v-icon start>mdi-file-pdf-box</v-icon>
            View PDF
            <v-icon end size="16">mdi-open-in-new</v-icon>
          </v-btn>
        </div>

        <v-divider class="section-divider"></v-divider>

        <!-- Review Section -->
        <div class="review-section">
          <h5 class="review-title">
            <v-icon size="18" class="review-icon">mdi-star-circle</v-icon>
            Your Review
          </h5>

          <!-- Score Section -->
          <div class="score-section">
            <div class="score-header">
              <span class="score-label">Score</span>
              <div class="score-display">
                <span class="score-value">{{ paper.review.score }}</span>
                <span class="score-max">/5</span>
                <div class="score-stars">
                  <v-icon 
                    v-for="i in 5" 
                    :key="i"
                    :color="i <= paper.review.score ? 'warning' : 'grey-lighten-2'"
                    size="16"
                  >
                    mdi-star
                  </v-icon>
                </div>
              </div>
            </div>
            <v-slider
              v-model="paper.review.score"
              :max="5"
              :min="0"
              step="1"
              color="primary"
              track-color="grey-lighten-3"
              thumb-color="primary"
              class="score-slider"
              hide-details
            />
          </div>

          <!-- Comment Section -->
          <div class="comment-section">
            <v-textarea
              v-model="paper.review.comment"
              label="Review Comments"
              placeholder="Provide detailed feedback on the paper's quality, methodology, contributions..."
              variant="outlined"
              rows="4"
              class="comment-textarea"
              hide-details
            />
          </div>

          <!-- Submit Button -->
          <div class="submit-section">
            <v-btn
              @click="submitReview(paper)"
              color="primary"
              variant="flat"
              size="large"
              class="submit-btn"
              :loading="isSubmitting"
              :disabled="!paper.review.comment.trim()"
            >
              <v-icon start>mdi-send</v-icon>
              {{ paper.isReviewed ? 'Update Review' : 'Submit Review' }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { get, ref as dbRef, set } from 'firebase/database'

const papers = ref([])
const isSubmitting = ref(false)

const loadData = async () => {
  const user = auth.currentUser
  if (!user) return

  const [papersSnap, allocationsSnap, usersSnap, reviewsSnap] = await Promise.all([
    get(dbRef(db, 'papers')),
    get(dbRef(db, 'allocations')),
    get(dbRef(db, 'users')),
    get(dbRef(db, 'reviews'))
  ])

  const allPapers = papersSnap.val() || {}
  const allocations = allocationsSnap.val() || {}
  const allUsers = usersSnap.val() || {}
  const allReviews = reviewsSnap.val() || {}

  const assignedPaperIds = Object.entries(allocations)
    .filter(([_, reviewers]) => Array.isArray(reviewers) && reviewers.includes(user.uid))
    .map(([paperId]) => paperId)

  papers.value = assignedPaperIds.map(paperId => {
    const paper = allPapers[paperId]
    const existingReview = allReviews[paperId]?.[user.uid]
    
    return {
      id: paperId,
      ...paper,
      mainAuthorEmail: allUsers[paper.mainAuthor]?.email || paper.mainAuthor,
      review: {
        score: existingReview?.score || 0,
        comment: existingReview?.comment || ''
      },
      isReviewed: !!existingReview
    }
  })
}

onMounted(loadData)

const submitReview = async (paper) => {
  const user = auth.currentUser
  if (!user) return

  isSubmitting.value = true

  try {
    await set(dbRef(db, `reviews/${paper.id}/${user.uid}`), {
      score: paper.review.score,
      comment: paper.review.comment,
      submittedAt: new Date().toISOString()
    })

    paper.isReviewed = true
    
    // Success feedback
    const event = new CustomEvent('show-snackbar', {
      detail: { 
        message: paper.isReviewed ? 'Review updated successfully!' : 'Review submitted successfully!',
        color: 'success'
      }
    })
    window.dispatchEvent(event)
    
  } catch (error) {
    console.error('Error submitting review:', error)
    const event = new CustomEvent('show-snackbar', {
      detail: { 
        message: 'Error submitting review. Please try again.',
        color: 'error'
      }
    })
    window.dispatchEvent(event)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.papers-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header-section {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.main-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.title-icon {
  color: #1976d2;
}

.stats-badge {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.header-divider {
  border-color: #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 16px;
  border: 2px dashed #e3f2fd;
}

.empty-icon {
  color: #90a4ae;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 8px;
}

.empty-subtitle {
  color: #757575;
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.papers-grid {
  display: grid;
  gap: 24px;
}

.paper-card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  position: relative;
}

.paper-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border-color: #1976d2;
}

.paper-card.reviewed {
  border-left: 4px solid #4caf50;
}

.card-header {
  padding: 20px 20px 0;
  display: flex;
  justify-content: flex-end;
}

.paper-title-section {
  padding: 0 20px 20px;
}

.paper-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.4;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.author-icon {
  color: #90a4ae;
}

.pdf-section {
  padding: 0 20px 20px;
}

.pdf-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.section-divider {
  margin: 0 20px;
  border-color: #f0f0f0;
}

.review-section {
  padding: 24px 20px;
  background: #fafafa;
}

.review-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.review-icon {
  color: #ff9800;
}

.score-section {
  margin-bottom: 24px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.score-label {
  font-weight: 500;
  color: #424242;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1976d2;
}

.score-max {
  color: #666;
  font-size: 1rem;
}

.score-stars {
  display: flex;
  gap: 2px;
  margin-left: 8px;
}

.score-slider {
  margin: 8px 0;
}

.comment-section {
  margin-bottom: 24px;
}

.comment-textarea :deep(.v-field) {
  border-radius: 12px;
}

.submit-section {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  padding: 0 32px;
  height: 48px;
}

@media (max-width: 768px) {
  .papers-container {
    padding: 0 12px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .main-title {
    font-size: 1.5rem;
  }
  
  .paper-card {
    margin: 0 -4px;
  }
  
  .submit-section {
    justify-content: stretch;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>