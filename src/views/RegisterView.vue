<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--bg,#F9FAFB)] p-6">
    <div
      class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <!-- LADO IZQUIERDO (Branding) -->
      <aside
        class="relative hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-[color:var(--primary)]/95 to-[color:var(--accent)]/60"
        aria-hidden="true"
      >
        <div class="flex flex-col items-center text-center text-white">
          <img
            :src="logo"
            alt="Freelaworkd"
            class="w-72 h-auto drop-shadow-2xl transform transition-transform duration-500 hover:scale-105"
            loading="eager"
          />
          <h2 class="mt-6 text-3xl font-extrabold tracking-tight">Freelaworkd</h2>
          <p class="mt-2 max-w-xs leading-relaxed text-sm opacity-90">
            Regístrate y comienza a conectar con proyectos reales y oportunidades freelance.
          </p>
        </div>

        <div class="absolute -bottom-6 -right-6 w-36 h-36 rounded-full opacity-20 blur-2xl bg-white/20"></div>
      </aside>

      <!-- LADO DERECHO (Formulario) -->
      <section class="p-8 md:p-10 flex flex-col justify-center">
        <div class="mb-6 md:mb-8">
          <img :src="logo" alt="Freelaworkd" class="mx-auto md:hidden w-40 h-auto" />
        </div>

        <h1 id="registro-title" class="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-2">
          Crear cuenta
        </h1>
        <p class="text-sm text-slate-600 mb-6">
          Completa la información para registrarte en la plataforma.
        </p>

        <form @submit.prevent="handleRegistro" class="space-y-4" novalidate>
          <!-- NOMBRE -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="nombre">
              Nombre completo
            </label>
            <input
              id="nombre"
              v-model.trim="nombre"
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              :aria-invalid="!!errores.nombre"
              :class="inputClass(errores.nombre)"
            />
            <p v-if="errores.nombre" class="mt-1 text-xs text-red-600">{{ errores.nombre }}</p>
          </div>

          <!-- CORREO -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="email">
              Correo electrónico
            </label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              required
              placeholder="ejemplo@correo.com"
              :aria-invalid="!!errores.email"
              :class="inputClass(errores.email)"
            />
            <p v-if="errores.email" class="mt-1 text-xs text-red-600">{{ errores.email }}</p>
          </div>

          <!-- CONTRASEÑA -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="password">
              Contraseña
            </label>
            <input
              id="password"
              v-model.trim="password"
              type="password"
              required
              minlength="6"
              placeholder="********"
              :aria-invalid="!!errores.password"
              :class="inputClass(errores.password)"
            />
            <p v-if="errores.password" class="mt-1 text-xs text-red-600">{{ errores.password }}</p>
          </div>

          <!-- CONFIRMAR CONTRASEÑA -->
          <div>
            <label class="block text-sm font-semibold text-[var(--primary)] mb-1" for="password_confirmation">
              Confirmar contraseña
            </label>
            <input
              id="password_confirmation"
              v-model.trim="password_confirmation"
              type="password"
              required
              placeholder="********"
              :aria-invalid="!!errores.password_confirmation"
              :class="inputClass(errores.password_confirmation)"
            />
            <p v-if="errores.password_confirmation" class="mt-1 text-xs text-red-600">
              {{ errores.password_confirmation }}
            </p>
          </div>

          <!-- BOTÓN -->
          <div>
            <button
              :disabled="cargando"
              type="submit"
              class="w-full flex items-center justify-center gap-3 py-2 rounded-lg text-white font-semibold transition-colors"
              :class="cargando ? 'bg-[#005A82] cursor-wait' : 'bg-[var(--primary)] hover:bg-[#004d73]'"
            >
              <svg
                v-if="cargando"
                class="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-20"></circle>
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                ></path>
              </svg>
              <span>{{ cargando ? 'Creando cuenta...' : 'Registrarme' }}</span>
            </button>
          </div>

          <!-- MENSAJES -->
          <div aria-live="polite" class="min-h-[1.5rem]">
            <p v-if="mensajeError" class="text-sm text-red-600 text-center">{{ mensajeError }}</p>
            <p v-else-if="mensajeExito" class="text-sm text-green-600 text-center">{{ mensajeExito }}</p>
          </div>

          <!-- ENLACE -->
          <div class="flex items-center justify-center text-sm text-slate-600">
            <span>¿Ya tienes cuenta?</span>
            <router-link to="/login" class="text-[var(--primary)] underline ml-1">Inicia sesión</router-link>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/axios";
import logo from "@/assets/logo_freelaworld.png";

const router = useRouter();

// Campos del formulario
const nombre = ref("");
const email = ref("");
const password = ref("");
const password_confirmation = ref("");
const cargando = ref(false);

// Estados de mensaje
const mensajeError = ref("");
const mensajeExito = ref("");
const errores = reactive({});

// Clases de input dinámicas
const inputClass = (tieneError) =>
  [
    "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-shadow duration-150",
    tieneError
      ? "border-red-400 focus:ring-red-300"
      : "border-gray-300 focus:ring-[var(--accent)]",
  ].join(" ");

// Manejo del registro
const handleRegistro = async () => {
  mensajeError.value = "";
  mensajeExito.value = "";
  Object.keys(errores).forEach((k) => delete errores[k]);

  if (password.value !== password_confirmation.value) {
    errores.password_confirmation = "Las contraseñas no coinciden.";
    return;
  }

  cargando.value = true;

  try {
    const { data } = await api.post("/auth/registro", {
      name: nombre.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });

    mensajeExito.value = data?.mensaje || "Cuenta creada correctamente.";
    setTimeout(() => router.replace({ name: "login" }), 1800);
  } catch (err) {
    if (err?.response?.status === 422 && err.response.data?.errors) {
      const backendErrors = err.response.data.errors;
      Object.keys(backendErrors).forEach((k) => {
        errores[k] = Array.isArray(backendErrors[k])
          ? backendErrors[k][0]
          : backendErrors[k];
      });
      mensajeError.value = "Revisa los campos indicados.";
    } else if (err?.response?.data?.mensaje) {
      mensajeError.value = err.response.data.mensaje;
    } else {
      mensajeError.value = "Error al crear la cuenta. Inténtalo nuevamente.";
    }
  } finally {
    cargando.value = false;
  }
};
</script>

<style>
:root {
  --primary: #002A4E;
  --accent: #00C8E5;
  --bg: #F9FAFB;
}
</style>
