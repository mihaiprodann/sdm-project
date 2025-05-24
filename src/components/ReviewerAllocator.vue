<template>
  <div class="organizer-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <v-icon class="header-icon" size="32">mdi-account-supervisor</v-icon>
          <div>
            <h1 class="dashboard-title">Organizer Dashboard</h1>
            <p class="dashboard-subtitle">Manage conference papers and reviewer assignments</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <v-container class="dashboard-content" max-width="1200">
      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon papers">
            <v-icon>mdi-file-document-multiple</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.papers }}</div>
            <div class="stat-label">Papers Submitted</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon reviewers">
            <v-icon>mdi-account-group</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.reviewers }}</div>
            <div class="stat-label">Active Reviewers</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon allocations">
            <v-icon>mdi-connection</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.allocations }}</div>
            <div class="stat-label">Allocations Made</div>
          </div>
        </div>
      </div>

      <!-- Reviewer Allocation Section -->
      <v-card class="allocation-card" elevation="2">
        <v-card-title class="card-header">
          <v-icon class="mr-2" color="primary">mdi-account-switch</v-icon>
          Reviewer Allocation System
        </v-card-title>

        <v-card-text class="card-content">
          <div class="allocation-info">
            <div class="info-item">
              <v-icon class="info-icon" color="primary">mdi-file-document-alert</v-icon>
              <span><strong>{{ unallocatedPapers }}</strong> papers not yet allocated</span>
            </div>
            <div class="info-item">
              <v-icon class="info-icon" color="primary">mdi-account-alert</v-icon>
              <span><strong>{{ availableReviewers }}</strong> reviewers available</span>
            </div>
            <div class="info-item" v-if="unallocatedPapers === 0">
              <v-icon class="info-icon" color="orange">mdi-alert</v-icon>
              <span>No new papers left to allocate.</span>
            </div>
            <div class="info-item" v-if="availableReviewers < 2">
              <v-icon class="info-icon" color="red">mdi-alert-circle</v-icon>
              <span>At least 2 reviewers are required for allocation.</span>
            </div>
          </div>

          

          <div class="allocation-actions">
            <v-btn
              class="allocate-btn mr-5"
              color="secondary"
              @click="showStatsModal = true"
              size="large"
              variant="outlined"
            >
              <v-icon start>mdi-chart-bar</v-icon>
              View Stats
            </v-btn>

            <v-dialog v-model="showStatsModal" max-width="900px">
              <v-card>
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">mdi-table-eye</v-icon>
                  Reviewer Assignment Stats
                </v-card-title>
                <v-card-text>
                  <v-table v-if="allocationsTable.length">
                    <thead>
                      <tr>
                        <th class="text-left">Paper Title</th>
                        <th class="text-left">Email</th>
                        <th class="text-left">Score</th>
                        <th class="text-left">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="entry in allocationsTable" :key="entry.paper + '-' + entry.email">
                        <td>{{ entry.paper }}</td>
                        <td>{{ entry.email }}</td>
                        <td>{{ entry.score ?? '—' }}</td>
                        <td>{{ entry.comment ?? '—' }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                  <v-alert v-else type="info" class="mt-4">
                    No assignment data available.
                  </v-alert>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="showStatsModal = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-btn 
              class="allocate-btn"
              color="primary" 
              @click="allocate" 
              :loading="loading"
              :disabled="loading || unallocatedPapers === 0 || availableReviewers < 2"
              size="large"
              variant="elevated"
            >
              <v-icon start>mdi-auto-fix</v-icon>
              {{ loading ? 'Allocating...' : 'Start Auto Allocation' }}
            </v-btn>
          </div>

          <!-- Alerts -->
          <div class="alerts-section">
            <v-alert 
              v-if="success" 
              type="success" 
              variant="tonal"
              closable
              class="success-alert"
            >
              <v-icon slot="prepend">mdi-check-circle</v-icon>
              {{ success }}
            </v-alert>

            <v-alert 
              v-if="error" 
              type="error" 
              variant="tonal"
              closable
              class="error-alert"
            >
              <v-icon slot="prepend">mdi-alert-circle</v-icon>
              {{ error }}
            </v-alert>
          </div>
        </v-card-text>
      </v-card>

      <!-- Allocation Results Table -->
      <v-card v-if="allocationResults.length" class="mt-4" elevation="2">
        <v-card-title class="text-h6">
          Allocation Results
        </v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Paper Title</th>
                <th class="text-left">Author</th>
                <th class="text-left">Reviewer 1 (email)</th>
                <th class="text-left">Reviewer 2 (email)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in allocationResults" :key="result.title">
                <td>{{ result.title }}</td>
                <td>{{ result.author }}</td>
                <td>{{ result.reviewers[0] || 'N/A' }}</td>
                <td>{{ result.reviewers[1] || 'N/A' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Recent Activity -->
      <v-card class="activity-card mt-10" elevation="2">
        <v-card-title class="card-header">
          <v-icon class="mr-2" color="info">mdi-history</v-icon>
          Recent Activity
        </v-card-title>

        <v-card-text>
          <div class="activity-list">
            <div class="activity-item" v-if="lastAllocation">
              <div class="activity-icon success">
                <v-icon size="16">mdi-check</v-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">Reviewers Successfully Allocated</div>
                <div class="activity-time">{{ formatTime(lastAllocation) }}</div>
              </div>
            </div>

            <div class="activity-item empty" v-else>
              <div class="activity-icon neutral">
                <v-icon size="16">mdi-information</v-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">No recent allocations</div>
                <div class="activity-time">Start by allocating reviewers to papers</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { get, ref as dbRef, push } from 'firebase/database'

const loading = ref(false)
const success = ref('')
const error = ref('')
const lastAllocation = ref(null)

const allocationResults = ref([])
const unallocatedPapers = ref(0)
const availableReviewers = ref(0)

const showStatsModal = ref(false)
const allocationsTable = ref([])

const loadAllocationsTable = async () => {
  allocationsTable.value = []

  const [papersSnap, usersSnap, reviewsSnap, allocationsSnap] = await Promise.all([
    get(dbRef(db, 'papers')),
    get(dbRef(db, 'users')),
    get(dbRef(db, 'reviews')),
    get(dbRef(db, 'allocationsHistory'))
  ])

  const papers = papersSnap.val() || {}
  const users = usersSnap.val() || {}
  const reviews = reviewsSnap.val() || {}
  const allocationsHistories = allocationsSnap.val() || {}

  const latestAlloc = Object.values(allocationsHistories).slice(-1)[0]?.allocations || {}

  for (const paperId in latestAlloc) {
    const paper = papers[paperId]
    const paperTitle = paper?.title || paperId
    const assignedReviewerIds = latestAlloc[paperId]

    assignedReviewerIds.forEach((reviewerId) => {
      const reviewer = users[reviewerId] || {}
      const email = reviewer.email || reviewerId
      const review = reviews[paperId]?.[reviewerId] || {}

      allocationsTable.value.push({
        paper: paperTitle,
        email,
        score: review.score ?? null,
        comment: review.comment ?? null
      })
    })
  }
}

watch(showStatsModal, (val) => {
  if (val) loadAllocationsTable()
})

const stats = ref({
  papers: 0,
  reviewers: 0,
  allocations: 0
})

onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  try {
    const [papersSnap, usersSnap, allocationsSnap] = await Promise.all([
      get(dbRef(db, 'papers')),
      get(dbRef(db, 'users')),
      get(dbRef(db, 'allocationsHistory'))
    ])

    const papers = papersSnap.val() || {}
    const users = usersSnap.val() || {}
    const allocationsHistory = allocationsSnap.val() || {}

    const latestAlloc = Object.values(allocationsHistory).slice(-1)[0]?.allocations || {}
    const allocatedPaperIds = new Set(Object.keys(latestAlloc))
    const allPaperIds = Object.keys(papers)

    unallocatedPapers.value = allPaperIds.filter(id => !allocatedPaperIds.has(id)).length
    availableReviewers.value = Object.values(users).filter(u => u.role === 'reviewer').length

    stats.value = {
      papers: allPaperIds.length,
      reviewers: availableReviewers.value,
      allocations: Object.keys(allocationsHistory).length
    }
  } catch (e) {
    console.error('Error loading stats:', e)
  }
}

const allocate = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  allocationResults.value = []

  try {
    const [papersSnap, usersSnap, allocationsSnap] = await Promise.all([
      get(dbRef(db, 'papers')),
      get(dbRef(db, 'users')),
      get(dbRef(db, 'allocationsHistory'))
    ])

    const papers = papersSnap.val() || {}
    const users = usersSnap.val() || {}
    const allocationsHistory = allocationsSnap.val() || {}
    const latestAlloc = Object.values(allocationsHistory).slice(-1)[0]?.allocations || {}

    const reviewers = Object.entries(users)
      .filter(([_, u]) => u.role === 'reviewer')
      .map(([uid, u]) => ({
        id: uid,
        name: u.name || uid,
        email: u.email || ''
      }))

    if (reviewers.length < 2) {
      error.value = 'You need at least 2 reviewers to allocate.'
      loading.value = false
      return
    }

    const allocations = {}
    const results = []

    for (const paperId in papers) {
      if (latestAlloc[paperId]) continue // skip already allocated papers

      const paper = papers[paperId]
      const shuffled = [...reviewers].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 2)

      allocations[paperId] = selected.map(r => r.id)

      const author =
        users[paper.mainAuthor]?.name ||
        users[paper.mainAuthor]?.email ||
        paper.mainAuthor ||
        'Unknown'

      results.push({
        title: paper.title || paperId,
        author,
        reviewers: selected.map(r => r.email)
      })
    }

    if (Object.keys(allocations).length > 0) {
      const combinedAllocations = { ...latestAlloc, ...allocations }

      await push(dbRef(db, 'allocationsHistory'), {
        timestamp: new Date().toISOString(),
        allocations: combinedAllocations
      })
    }


    allocationResults.value = results
    success.value = 'Reviewers allocated successfully!'
    lastAllocation.value = new Date().toISOString()
    await loadStats()
  } catch (e) {
    error.value = 'Error: ' + e.message
  } finally {
    loading.value = false
    setTimeout(() => {
      success.value = ''
      error.value = ''
    }, 5000)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.organizer-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  color: rgba(255, 255, 255, 0.9);
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.dashboard-content {
  padding-top: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.papers {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.reviewers {
  background: linear-gradient(135deg, #10b981, #047857);
}

.stat-icon.allocations {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.allocation-card, .activity-card {
  margin-bottom: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.card-header {
  background: rgba(99, 102, 241, 0.05);
  border-radius: 16px 16px 0 0;
  font-weight: 600;
  padding: 1.5rem;
}

.card-content {
  padding: 1.5rem;
}

.allocation-info {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
}

.info-icon {
  flex-shrink: 0;
}

.allocation-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.allocate-btn {
  font-weight: 600;
  border-radius: 12px;
  padding: 0 2rem;
  text-transform: none;
  letter-spacing: 0;
}

.alerts-section {
  margin-top: 1.5rem;
}

.success-alert, .error-alert {
  border-radius: 12px;
  margin-bottom: 1rem;
}

.activity-list {
  padding: 0.5rem 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.activity-item:hover {
  background: rgba(99, 102, 241, 0.05);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.success {
  background: #dcfdf7;
  color: #059669;
}

.activity-icon.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.activity-title {
  font-weight: 500;
  color: #1f2937;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

</style>