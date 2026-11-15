// normalize role string stored in localStorage
export const getNormalizedRole = () => {
    const raw = String(localStorage.getItem("role") ?? "")
        .trim()
        .toLowerCase();

    if (raw === "administrador" || raw === "admin") return "administrador";
    if (raw === "técnico" || raw === "tecnico") return "técnico";
    if (raw === "recepción" || raw === "recepcion" || raw === "vendedor") return "vendedor";
    return raw;
};

// role-based permission flags for views and actions
export const getRolePermissions = () => {
    const role = getNormalizedRole();
    const isAdmin = role === "administrador";
    const isTechnician = role === "técnico";
    const isSeller = role === "vendedor";

    return {
        role,
        isAdmin,
        isTechnician,
        isSeller,
        // only admin can manage users/employees
        canManageUsers: isAdmin,
        // only admin can create, edit or delete inventory products
        canManageInventory: isAdmin,
        // admin and technician can delete orders/customers; seller cannot delete anything
        canDelete: isAdmin || isTechnician,
    };
};
