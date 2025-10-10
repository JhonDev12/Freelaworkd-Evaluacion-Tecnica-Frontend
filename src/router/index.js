// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Importaciones de vistas
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProyectosView from '@/views/ProyectosView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/registro', name: 'registro', component: RegisterView, meta: { requiresAuth: false } },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },

  {
    path: '/proyectos',
    name: 'proyectos',
    component: ProyectosView,
    meta: { requiresAuth: true },
  },
  {
    path: '/propuestas',
    name: 'propuestas',
    component: () => import('@/views/PropuestasView.vue'),
    meta: { requiresAuth: true },
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
})

// Middleware global de autenticación
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Redirige si intenta ir al login ya autenticado
  if (to.name === 'login' && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // Protege rutas con meta.requiresAuth
  if (to.meta?.requiresAuth) {
    if (auth.isAuthenticated) {
      if (!auth.user) {
        try {
          await auth.fetchUser()
        } catch {
          auth.clearToken()
          return next({ name: 'login', query: { returnTo: to.fullPath } })
        }
      }
      return next()
    }

    return next({ name: 'login', query: { returnTo: to.fullPath } })
  }

  next()
})

export default router
