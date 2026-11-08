/**
 * Servicio de Autenticación y Usuarios -> Modelo Sequelize: `User` (`server/models/userModel.js`)
 * Campos del modelo: id, name, lastName, username, email, password, role ('administrador'|'técnico'|'recepción'), status ('activo'|'inactivo')
 */
import { apiRequest, tokenStorage } from "@/services/api";

// TODO [BACKEND - POST /api/auth/login]:
// Validar credenciales contra `users`, verificar `status === 'activo'` y devolver `{ token, user }`.
export async function login(credentials) {
    const data = await apiRequest("/auth/login", { method: "POST", body: credentials });
    tokenStorage.set(data.token);
    return data.user;
}

// TODO [BACKEND - POST /api/auth/register]:
// Crear usuario en `users` con contraseña encriptada (bcrypt).
// Nota: el modelo `User` exige `name`, `lastName`, `username`, `email`, `password` y `role`.
export function register(payload) {
    return apiRequest("/auth/register", { method: "POST", body: payload });
}

// TODO [BACKEND - POST /api/auth/logout]:
// Limpiar el token local y, si usas sesiones/refresh tokens en el servidor, invalidarlos.
export function logout() {
    tokenStorage.clear();
}

// TODO [BACKEND - GET /api/auth/me]:
// Devolver el usuario autenticado a partir del JWT para mostrar su nombre y rol en `Main.jsx` y `AppHeader.jsx`.
export function getCurrentUser() {
    return apiRequest("/auth/me");
}

// TODO [BACKEND - GET /api/users?role=técnico&status=activo]:
// Listar los técnicos activos para los selectores de técnico asignado en `OrderFormDialog` y `OrderDetail`.
export function getTechnicians() {
    return apiRequest("/users?role=técnico&status=activo");
}
