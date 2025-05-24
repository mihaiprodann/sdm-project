import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import SignupView from './views/SignupView.vue'
import AuthorDashboard from './views/AuthorDashboard.vue'
import ReviewerDashboard from './views/ReviewerDashboard.vue'
import OrganizerDashboard from './views/OrganizerDashboard.vue'
import DashboardRedirect from './views/DashboardRedirect.vue' // 👈
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const skipIfAuthenticated = (to, from, next) => {
  const auth = getAuth()
  onAuthStateChanged(auth, user => {
    if (user) next('/dashboard')
    else next()
  })
}


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, beforeEnter: skipIfAuthenticated },
  { path: '/signup', component: SignupView, beforeEnter: skipIfAuthenticated },
  {
    path: '/dashboard',
    component: DashboardRedirect,
    beforeEnter: (to, from, next) => {
      import('./firebase').then(({ auth, db }) => {
        import('firebase/auth').then(({ onAuthStateChanged }) => {
          import('firebase/database').then(({ ref, get }) => {
            const unsubscribe = onAuthStateChanged(auth, async user => {
              if (user) {
                const snap = await get(ref(db, `users/${user.uid}`))
                const role = snap.val()?.role
                if (role) {
                  next(`/dashboard/${role}`)
                } else {
                  next('/login')
                }
              } else {
                next('/login')
              }
            })
          })
        })
      })
    }
  },
  { path: '/dashboard/author', component: AuthorDashboard },
  { path: '/dashboard/reviewer', component: ReviewerDashboard },
  { path: '/dashboard/organizer', component: OrganizerDashboard }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
