import { apiRequest } from "@/services/api";

export const USER_ROLES = [
    { value: "técnico", label: "Técnico" },
    { value: "recepción", label: "Vendedor" },
    { value: "administrador", label: "Administrador" },
];

// Fetch del registro
export const register = async({ name, lastName, username, email, password, role }) => {
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

// Fetch del login
export const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await apiRequest("/users/login", {
        method: "POST",
        body: { email: normalizedEmail, password },
    });

    if (response.status === "ok" || response.success) {
        const user = { ...response.data };

        if (!user.name && user.id) {
            try {
                const profileResponse = await apiRequest(`/users/${user.id}`);
                if (profileResponse?.data?.name) {
                    user.name = profileResponse.data.name;
                    user.lastName = profileResponse.data.lastName;
                }
            } catch {
                // ignore fallback error
            }
        }

        localStorage.setItem("id", user.id);
        localStorage.setItem("role", user.role);
        if (user.name) {
            localStorage.setItem("name", user.name);
        } else {
            localStorage.removeItem("name");
        }
        localStorage.setItem("auth_user", JSON.stringify(user));
        return user;
    }

    throw new Error(response.message || "No se pudo iniciar sesión");
};

// Fetch to get current user
export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("auth_user");
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore parse error
    }
    const name = localStorage.getItem("name");
    const id = localStorage.getItem("id");
    const role = localStorage.getItem("role");
    return id ? { id, name, role } : null;
}

// Logout function
export const logout = () => {
    localStorage.clear();
    window.location.href = "/"
}

// Get all technicians
export const getTechnicians = async() => {
    const response = await apiRequest("/users?role=técnico&status=activo&limit=100");
    return response.data ?? [];
}
