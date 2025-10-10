// src/main.js
import "./style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import api from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";
import { useLoaderStore } from "@/stores/loaderStore";
import { instalarAxiosLoader } from "@/plugins/axiosLoader";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// muestra el LoaderOverlay)
instalarAxiosLoader(api, useLoaderStore());


const auth = useAuthStore();
auth.init({ fetchUser: true }).finally(() => {
  app.mount("#app");
});
