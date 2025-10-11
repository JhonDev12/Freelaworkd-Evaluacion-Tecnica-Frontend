# FREELAWORKD — EVALUACIÓN TÉCNICA FRONTEND

## Descripción
Aplicación frontend desarrollada con **Vue 3, Vite, Pinia y Tailwind CSS** como parte de la evaluación técnica **Full Stack (Laravel/Vue.js)** para **Iyata**.  
Este proyecto consume la API REST del backend de **Freelaworkd**, implementado en **Laravel Sanctum**, y ofrece una interfaz limpia, moderna y funcional para la gestión de usuarios, roles, proyectos, propuestas y habilidades.

---

## CREDENCIALES DE ACCESO (ENTORNO LOCAL / DEMO)

Usuario Super Admin (creado desde los seeders del backend):  
Email: `jhon@example.com`  
Contraseña: `12345678`

Estas credenciales permiten acceder al panel principal y probar todas las vistas del sistema.  
No deben usarse en producción.

---

## REQUISITOS PREVIOS

Antes de instalar el frontend, asegúrate de tener el siguiente entorno configurado:

- Node.js v20.x o superior  
- npm v10.x o superior  
- Git  
- Backend de Freelaworkd corriendo en Laravel (`http://localhost:8000` o dominio configurado)  
- Navegador moderno compatible con ES2023 (Chrome, Edge, Firefox, Safari)

---

## CLONACIÓN DEL REPOSITORIO

```bash
git clone https://github.com/JhonDev12/Freelaworkd-Evaluacion-Tecnica-Frontend.git
cd Freelaworkd-Evaluacion-Tecnica-Frontend
```

---

## INSTALACIÓN DE DEPENDENCIAS

Ejecutar en la raíz del proyecto:

```bash
npm install
```

Esto instalará todas las dependencias definidas en package.json, incluyendo:

- vue  
- vite  
- pinia  
- vue-router  
- axios  
- tailwindcss  
- postcss  
- autoprefixer

---

## CONFIGURACIÓN DE TAILWIND CSS

Tailwind CSS ya está integrado en el proyecto, pero si es necesario reinstalarlo o reconfigurarlo manualmente, sigue los pasos:

Instalar Tailwind y sus dependencias:  
```bash
npm install -D tailwindcss postcss autoprefixer
```

Generar los archivos de configuración:  
```bash
npx tailwindcss init -p
```

En `tailwind.config.js`, definir las rutas del contenido:  
```js
content: [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}",
],
```

En `src/assets/main.css` o `src/style.css` agregar:  
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Ejecutar el servidor para verificar que Tailwind funcione:  
```bash
npm run dev
```

---

## CONFIGURACIÓN DE AXIOS

Axios se usa para conectar el frontend con el backend Laravel (Sanctum).

Instalar:  
```bash
npm install axios
```

Crear el archivo `src/api/axios.js` con la configuración recomendada:  
```js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export default api
```

Para autenticación Sanctum:  
- Asegúrate de que el backend tenga configurado `SANCTUM_STATEFUL_DOMAINS`.  
- En el frontend, Axios debe enviar las cookies de sesión con `withCredentials: true`.  
- En el archivo de login, usar:  
```js
await api.post('/auth/login', { email, password })
```

---

## ESTRUCTURA DEL PROYECTO

```
src/
│
├── api/
│   └── axios.js → cliente HTTP centralizado
│
├── stores/
│   ├── authStore.js → manejo de autenticación y usuario actual
│   ├── proyectosStore.js → CRUD de proyectos
│   ├── propuestasStore.js → CRUD de propuestas
│   ├── habilidadesStore.js → CRUD de habilidades
│   └── rolesStore.js → manejo de roles
│
├── router/
│   └── index.js → rutas principales con protección (beforeEach)
│
├── views/
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── ProyectosView.vue
│   ├── PropuestasView.vue
│   ├── HabilidadesView.vue
│   ├── UsuariosView.vue
│   └── RolesView.vue
│
├── components/
│   ├── Navbar.vue
│   ├── Sidebar.vue
│   ├── ProyectoCard.vue
│   ├── PropuestaCard.vue
│   └── UserProfile.vue
│
└── App.vue → componente raíz
```

---

## RUTAS PRINCIPALES

- `/login` → página de autenticación  
- `/dashboard` → panel principal (resumen de usuario, proyectos, habilidades)  
- `/proyectos` → gestión de proyectos  
- `/propuestas` → postulaciones y ofertas  
- `/habilidades` → catálogo de habilidades  
- `/usuarios` → gestión de usuarios (solo admin)  
- `/roles` → administración de roles (solo super admin)

Las rutas están protegidas mediante `meta.requiresAuth` y guard global con `authStore`.

---

## GESTIÓN DE ESTADO (PINIA)

Pinia centraliza la información de autenticación, usuario actual y entidades principales (proyectos, propuestas, etc.).

Instalación:  
```bash
npm install pinia
```

Configuración básica en `main.js`:  
```js
import { createPinia } from 'pinia'
app.use(createPinia())
```

Ejemplo de store (`authStore.js`):  
```js
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      await api.get('/sanctum/csrf-cookie')
      const response = await api.post('/auth/login', { email, password })
      this.user = response.data.user
      this.isAuthenticated = true
    },
    async logout() {
      await api.post('/auth/logout')
      this.user = null
      this.isAuthenticated = false
    },
    async fetchUser() {
      const response = await api.get('/auth/user')
      this.user = response.data
      this.isAuthenticated = true
    }
  }
})
```

---

## EJECUCIÓN LOCAL

1. Clonar el repositorio.  
2. Instalar dependencias con `npm install`.  
3. Configurar la URL del backend en `src/api/axios.js` (por defecto `http://localhost:8000/api`).  
4. Iniciar el servidor de desarrollo:  
```bash
npm run dev
```

Por defecto se ejecuta en `http://localhost:5173`.  

Iniciar sesión con:  
Email: `jhon@example.com`  
Contraseña: `12345678`

---

## CONSTRUCCIÓN PARA PRODUCCIÓN

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para ser desplegada en un servidor estático o CDN.

---

## PRÁCTICAS DE DISEÑO Y USABILIDAD

- Layout responsive basado en Tailwind CSS.  
- Componentes reutilizables con diseño limpio y minimalista.  
- Paleta coherente con la marca Freelaworkd.  
- Animaciones suaves con clases Tailwind (`animate-pulse`, `transition`, `hover`).  
- Tipografía legible, espaciado generoso y jerarquía visual clara.  
- Enfoque UX accesible: contraste adecuado, tamaños adaptativos y semántica HTML cuidada.

---

## BUENAS PRÁCTICAS TÉCNICAS

- Estructura modular, escalable y mantenible.  
- Comunicación con backend desacoplada mediante Axios centralizado.  
- Stores de Pinia organizados por dominio.  
- Uso de `meta.requiresAuth` y router guard global.  
- Componentes limpios y nombrados en español (según lineamientos de evaluación).  
- Variables y métodos autodescriptivos.  
- Cumplimiento de convenciones de Vue 3 (Composition API opcional).

---

## AUTOR

Desarrollador: **Jhon Smith Meneses**  
Rol: **Frontend Developer**  
Stack: **Vue 3, Vite, Pinia, Tailwind CSS, Axios**  
Repositorio: **Freelaworkd — Evaluación Técnica Frontend**

---

## CONCLUSIÓN

Este frontend se encuentra completamente funcional y sincronizado con el backend Laravel de Freelaworkd.  
La estructura, componentes y stores cumplen los criterios técnicos y visuales exigidos en la evaluación, priorizando claridad, escalabilidad y coherencia UX/UI.
