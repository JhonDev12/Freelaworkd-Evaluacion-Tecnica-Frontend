// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";


import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import DashboardView from "@/views/DashboardView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: LoginView },
  { path: "/home", name: "home", component: HomeView },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (to.name === "login" && auth.isAuthenticated) {
    return next({ name: "dashboard" });
  }

  // Si la ruta requiere auth
  if (to.meta?.requiresAuth) {
    if (auth.isAuthenticated) {
      if (!auth.user) {
        try {
          await auth.fetchUser();
        } catch (e) {
          auth.clearToken();
          return next({ name: "login", query: { returnTo: to.fullPath } });
        }
      }
      return next();
    }
  
    return next({ name: "login", query: { returnTo: to.fullPath } });
  }


  return next();
});

export default router;
