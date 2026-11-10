/**
 * Cliente HTTP centralizado para comunicarse con el backend (`server/`).
 *
 * Configura `VITE_API_URL` en `client/.env` (ej: `VITE_API_URL=http://localhost:3000/api`).
 * Todas las funciones de `src/services/*.service.js` deben pasar por `apiRequest` para que
 * la autenticación (JWT), los headers y el manejo de errores queden en un único lugar.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://system-service-eizd.onrender.com/api";
const TOKEN_KEY = "auth_token";

export const tokenStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * TODO [BACKEND - Middleware de autenticación y formato de errores]:
 * Cuando actives el backend, asegúrate de que:
 * 1. Configure CORS permitiendo el origen de Vite (`http://localhost:5173`).
 * 2. Reciba el token en el header `Authorization: Bearer <token>`.
 * 3. Devuelva errores JSON con la forma `{ message: "..." }`.
 */
export async function apiRequest(endpoint, { method = "GET", body, headers } = {}) {
    const token = tokenStorage.get();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
        // TODO [BACKEND - Sesión expirada]: limpiar token y redirigir a "/" si el backend responde 401
        tokenStorage.clear();
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}
