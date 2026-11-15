import { apiRequest } from "@/services/api";

export const USER_ROLES = [
    { value: "técnico", label: "Técnico" },
    { value: "recepción", label: "Vendedor" },
    { value: "administrador", label: "Administrador" },
];

// register a new user (defaults to seller role 'recepción')
export const register = async ({ name, lastName, username, email, password, role = "recepción" }) => {
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const rawName = String(name ?? "").trim();
    const parts = rawName.split(/\s+/);
    const firstName = lastName ? rawName : (parts[0] || "Usuario");
    const resolvedLastName = lastName
        ? String(lastName).trim()
        : (parts.slice(1).join(" ") || "-");
    const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9._]/g, "") || "user";
    const resolvedUsername = username
        ? String(username).trim()
        : `${emailPrefix}${Math.floor(100 + Math.random() * 900)}`;

    const response = await apiRequest("/users", {
        method: "POST",
        body: {
            name: firstName,
            lastName: resolvedLastName,
            username: resolvedUsername,
            email: cleanEmail,
            password,
            role: role === "vendedor" ? "recepción" : role,
        },
    });
    return response.data;
};

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

// clear user session from localStorage
export const logout = () => {
    localStorage.clear();
};

// Get all technicians
export const getTechnicians = async() => {
    const response = await apiRequest("/users?role=técnico&status=activo&limit=100");
    return response.data ?? [];
}
