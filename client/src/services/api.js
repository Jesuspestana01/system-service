// Normaliza la URL base para que siempre termine en `/api` sin barra final,
// incluso si en `.env` se configuró solo el dominio (ej: "https://system-service-eizd.onrender.com")
const rawBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3010/api").trim().replace(/\/+$/, "");
const API_BASE_URL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;
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
