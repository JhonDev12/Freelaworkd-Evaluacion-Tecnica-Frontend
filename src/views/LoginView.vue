<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--bg,#F9FAFB)] p-6">
    <div
      class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-2xl overflow-hidden"
      role="main"
      aria-labelledby="login-title"
    >
      <!-- LEFT: Imagen + branding -->
      <aside
        class="relative hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-[color:var(--primary)]/95 to-[color:var(--accent)]/60"
        aria-hidden="true"
      >
        <div class="flex flex-col items-center text-center text-white">
          <img
            :src="logo"
            alt="Freelaworkd"
            class="w-80 h-auto drop-shadow-2xl transform transition-transform duration-500 hover:scale-105"
            loading="eager"
          />
          <h2 class="mt-6 text-3xl font-extrabold tracking-tight">Freelaworkd</h2>
          <p class="mt-2 max-w-xs leading-relaxed text-sm opacity-90">
            Plataforma de contratación freelance — conecta profesionales con proyectos reales.
          </p>
        </div>
        <div class="absolute -bottom-6 -right-6 w-36 h-36 rounded-full opacity-20 blur-2xl bg-white/20"></div>
      </aside>

      <!-- RIGHT: Formulario -->
      <section class="p-8 md:p-10 flex flex-col justify-center">
        <div class="mb-6 md:mb-8">
          <img :src="logo" alt="Freelaworkd" class="mx-auto md:hidden w-40 h-auto" />
        </div>

        <h1 id="login-title" class="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-2">
          Iniciar sesión
        </h1>
        <p class="text-sm text-slate-600 mb-6">
          Ingresa con tu correo y contraseña para acceder al panel.
        </p>

        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <!-- EMAIL -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="email">Correo electrónico</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autofocus
              autocomplete="email"
              :aria-invalid="!!fieldError('email')"
              :class="inputClass(fieldError('email'))"
              placeholder="ejemplo@correo.com"
            />
            <p v-if="fieldError('email')" class="mt-1 text-xs text-red-600" role="alert">
              {{ fieldError('email') }}
            </p>
          </div>

          <!-- PASSWORD -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="password">Contraseña</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :aria-invalid="!!fieldError('password')"
                :class="inputClass(fieldError('password'))"
                placeholder="********"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-2 px-2 flex items-center text-sm text-slate-500"
                :aria-pressed="showPassword"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <p v-if="fieldError('password')" class="mt-1 text-xs text-red-600" role="alert">
              {{ fieldError('password') }}
            </p>
          </div>

          <!-- BUTTON -->
          <div>
            <button
              :disabled="loading"
              type="submit"
              class="w-full flex items-center justify-center gap-3 py-2 rounded-lg text-white font-semibold transition-colors"
              :class="loading ? 'bg-[#005A82] cursor-wait' : 'bg-[var(--primary)] hover:bg-[#004d73]'"
              :aria-busy="loading"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-20"></circle>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
              </svg>

              <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
            </button>
          </div>

          <!-- Mensajes -->
          <div aria-live="polite" class="min-h-[1.5rem]">
            <p v-if="errorMessage" class="text-sm text-red-600 text-center">{{ errorMessage }}</p>
            <p v-else-if="infoMessage" class="text-sm text-slate-600 text-center">{{ infoMessage }}</p>
          </div>

          <div class="flex items-center justify-between text-sm text-slate-600">
            <a href="#" class="hover:underline">¿Olvidaste tu contraseña?</a>
            <router-link to="/registro" class="text-[var(--primary)] underline">Crear cuenta</router-link>
          </div>
        </form>
      </section>
    </div>

    <!-- 🔔 Notificación emergente -->
    <transition name="fade">
      <div
        v-if="showToast"
        class="fixed top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50"
      >
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import logo from "@/assets/logo_freelaworld.png";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const infoMessage = ref("");
const showToast = ref(false);
const toastMessage = ref("");

const errors = reactive({});

// Toast simple
const showNotification = (msg) => {
  toastMessage.value = msg;
  showToast.value = true;
  clearTimeout(showNotification.timeoutId);
  showNotification.timeoutId = setTimeout(() => {
    showToast.value = false;
  }, 5000);
};

const inputClass = (hasError) =>
  [
    "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2",
    "transition-shadow duration-150",
    hasError ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-[var(--accent)]",
  ].join(" ");

const fieldError = (field) => errors[field] || "";

// Login
const handleLogin = async () => {
  errorMessage.value = "";
  infoMessage.value = "";
  Object.keys(errors).forEach((k) => delete errors[k]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    const msg = "Por favor, ingresa un correo electrónico válido.";
    errorMessage.value = msg;
    showNotification(msg);
    return;
  }

  if (!password.value) {
    const msg = "La contraseña es obligatoria.";
    errorMessage.value = msg;
    showNotification(msg);
    return;
  }

  loading.value = true;
  try {
    // Usamos try interno para evitar que el store limpie los campos
    await auth.login({ email: email.value, password: password.value });
    router.replace({ name: "dashboard" });
  } catch (err) {
    // Manejamos errores sin reiniciar el componente
    console.error("Error login:", err);
    let msg = "Error al iniciar sesión. Inténtalo nuevamente.";

    if (err?.response) {
      const status = err.response.status;
      if (status === 401) msg = "Correo o contraseña incorrectos.";
      else if (status === 422) msg = "Revisa los campos indicados.";
      else if (err.response.data?.message) msg = err.response.data.message;
    }

    // 🔴 No reinicia los valores, solo muestra alerta
    errorMessage.value = msg;
    showNotification(msg);
  } finally {
    loading.value = false;
  }
};
</script>

<style>
:root {
  --primary: #002A4E;
  --accent: #00C8E5;
  --bg: #F9FAFB;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
