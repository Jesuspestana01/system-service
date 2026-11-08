/**
 * Servicio de Clientes -> Modelo Sequelize: `Client` (`server/models/clientModel.js`)
 * Campos del modelo: id, name, lastName, identityDocument, email, phone, address
 *
 * ⚠️ Nota de mapeo UI <-> Backend:
 * - En la UI actual se usa `name` (nombre completo) y `document` (cédula/RIF).
 * - En Sequelize el modelo tiene `name` + `lastName` separados e `identityDocument`, y `email` es obligatorio (`allowNull: false`).
 *   Al conectar el backend puedes separar nombre/apellido en este servicio o ajustar `clientModel.js`.
 */
import { apiRequest } from "@/services/api";

// TODO [BACKEND - GET /api/clients]:
// Listar clientes incluyendo el conteo de órdenes (`ServiceOrder`) para la columna "Órdenes" de `Customers.jsx`.
export function getCustomers() {
    return apiRequest("/clients");
}

// TODO [BACKEND - POST /api/clients]:
// Crear cliente desde `Customers.jsx` o desde el botón "+" dentro de `OrderFormDialog.jsx`.
export function createCustomer(data) {
    return apiRequest("/clients", { method: "POST", body: data });
}

// TODO [BACKEND - PUT /api/clients/:id]:
// Actualizar datos de contacto del cliente.
export function updateCustomer(id, data) {
    return apiRequest(`/clients/${id}`, { method: "PUT", body: data });
}

// TODO [BACKEND - DELETE /api/clients/:id]:
// Eliminar cliente (en `clientModel` las órdenes y equipos asociados tienen `onDelete: 'CASCADE'`).
export function deleteCustomer(id) {
    return apiRequest(`/clients/${id}`, { method: "DELETE" });
}
