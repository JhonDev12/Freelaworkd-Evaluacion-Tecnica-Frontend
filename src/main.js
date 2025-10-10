// src/main.js
import "./style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/authStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// inicializar auth antes de montar (restaurar token + opcionalmente fetchUser)
const auth = useAuthStore();
auth.init({ fetchUser: true }).finally(() => {
  app.mount("#app");
});
