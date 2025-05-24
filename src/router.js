import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import SignupView from './views/SignupView.vue'
import DashboardView from './views/DashboardView.vue'


const requireAuth = (to, from, next) => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      if (user) next()
      else next('/login')
    })
}

const routes = [
{ path: '/', redirect: '/login' },
{ path: '/login', component: LoginView },
{ path: '/signup', component: SignupView },
{
    path: '/dashboard',
    component: DashboardView,
    beforeEnter: requireAuth
}
]

  
const router = createRouter({
  history: createWebHistory(),
  routes
})





export default router
