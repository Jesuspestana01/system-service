/**
 * Cliente HTTP centralizado para comunicarse con el backend (`server/`).
 *
 * Configura `VITE_API_URL` en `client/.env` (ej: `VITE_API_URL=http://localhost:3010/api`).
 * Todas las funciones de `src/services/*.service.js` deben pasar por `apiRequest` para que
 * la autenticación (JWT), los headers y el manejo de errores queden en un único lugar.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3010/api";
const TOKEN_KEY = "auth_token";

export const tokenStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => (token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const apiRequest = async (endpoint, { method = "GET", body, headers } = {}) => {
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

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
};
