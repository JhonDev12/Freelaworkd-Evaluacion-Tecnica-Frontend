// Servicio de autenticación: maneja la comunicación con Laravel
import api from "./axios";
import type { User } from "@/types/User";

/**
 * Inicia sesión del usuario en Laravel
 */
export async function login(email: string, password: string) {
  return await api.post<{ user: User }>("/login", { email, password });
}

/**
 * Cierra la sesión actual
 */
export async function logout() {
  return await api.post("/logout");
}

/**
 * Obtiene la información del usuario autenticado
 */
export async function getUser() {
  return await api.get<User>("/user");
}
