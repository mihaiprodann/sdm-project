import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import SignupView from './views/SignupView.vue'
import AuthorDashboard from './views/AuthorDashboard.vue'
import ReviewerDashboard from './views/ReviewerDashboard.vue'
import OrganizerDashboard from './views/OrganizerDashboard.vue'
import DashboardRedirect from './views/DashboardRedirect.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { db } from './firebase'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/signup', component: SignupView },
  { path: '/dashboard', component: DashboardRedirect },
  { path: '/dashboard/author', component: AuthorDashboard },
  { path: '/dashboard/reviewer', component: ReviewerDashboard },
  { path: '/dashboard/organizer', component: OrganizerDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  const publicPages = ['/login', '/signup']
  const authRequired = !publicPages.includes(to.path)

  const user = await new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      resolve(user)
    })
  })

  if (authRequired && !user) {
    return next('/login')
  }

  if (user && publicPages.includes(to.path)) {
    return next('/dashboard')
  }

  if (to.path === '/dashboard' && user) {
    try {
      const snap = await get(ref(db, `users/${user.uid}`))
      const role = snap.val()?.role
      if (role === 'author' || role === 'reviewer' || role === 'organizer') {
        return next(`/dashboard/${role}`)
      } else {
        return next('/login')
      }
    } catch (err) {
      console.error('Eroare la citirea rolului:', err)
      return next('/login')
    }
  }

  next()
})

export default router
