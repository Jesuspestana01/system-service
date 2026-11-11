import { apiRequest } from "@/services/api";

export const USER_ROLES = [
    { value: "técnico", label: "Técnico" },
    { value: "recepción", label: "Vendedor" },
    { value: "administrador", label: "Administrador" },
];

export async function register({ name, lastName, username, email, password, role }) {
    const response = await apiRequest("/users", {
        method: "POST",
        body: {
            name: name.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
        },
    });
    return response.data;
}

export const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await apiRequest("/users/login", {
        method: "POST",
        body: { email: normalizedEmail, password },
    });

    if (response.status === "ok" || response.success) {
        const user = response.data;
        localStorage.setItem("id", user.id);
        localStorage.setItem("role", user.role);
        if (user.name) localStorage.setItem("name", user.name);
        localStorage.setItem("auth_user", JSON.stringify(user));
        return user;
    }

    throw new Error(response.message || "No se pudo iniciar sesión");
};

export function getCurrentUser() {
    try {
        const raw = localStorage.getItem("auth_user");
        if (raw) return JSON.parse(raw);
    } catch {
        // Ignorar errores de parseo
    }
    const name = localStorage.getItem("name");
    const id = localStorage.getItem("id");
    const role = localStorage.getItem("role");
    return id ? { id, name, role } : null;
}

export function logout() {
    localStorage.clear();
    window.location.href = "/"
}

export async function getTechnicians() {
    const response = await apiRequest("/users?role=técnico&status=activo&limit=100");
    return response.data ?? [];
}
