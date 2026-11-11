import { apiRequest } from "@/services/api";

export const EMPLOYEE_ROLES = [
    { value: "administrador", label: "Administrador" },
    { value: "técnico", label: "Técnico" },
    { value: "recepción", label: "Vendedor" },
];

export const EMPLOYEE_STATUSES = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
];

export const ROLE_LABELS = {
    administrador: "Administrador",
    técnico: "Técnico",
    recepción: "Vendedor",
    vendedor: "Vendedor",
};

export const ROLE_STYLES = {
    administrador: "border-violet-200 bg-violet-50 text-violet-700",
    técnico: "border-blue-200 bg-blue-50 text-blue-700",
    recepción: "border-amber-200 bg-amber-50 text-amber-700",
    vendedor: "border-amber-200 bg-amber-50 text-amber-700",
};

export const STATUS_STYLES = {
    activo: "border-emerald-200 bg-emerald-50 text-emerald-700",
    inactivo: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

// obtener todos los usuarios
export const getUsers = async(filters = {}) => {
    const params = new URLSearchParams({ limit: "100" });
    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
    });

    const response = await apiRequest(`/users?${params.toString()}`);
    return response.data ?? [];
}

// crear usuario
export const createUser = async(payload) => {
    const response = await apiRequest("/users", {
        method: "POST",
        body: payload,
    });
    return response.data;
}

// actualiza usuario
export const updateUser = async(id, payload) => {
    const cleanPayload = { ...payload };
    delete cleanPayload.id;
    if (!cleanPayload.password) {
        delete cleanPayload.password;
    }

    const response = await apiRequest(`/users/${id}`, {
        method: "PUT",
        body: cleanPayload,
    });
    return response.data;
}

// elimina usuario
export const deleteUser = async(id) => {
    return apiRequest(`/users/${id}`, {
        method: "DELETE",
    });
}
