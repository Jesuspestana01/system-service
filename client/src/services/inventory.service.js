/**
 * Servicio de Inventario -> Modelos Sequelize:
 * - `Inventory` (`server/models/inventoryModel.js`): id, name, description, category, brand, sku, quantity, minimumStock, unitPrice, status
 * - `InventoryMovement` (`server/models/inventoryMovementModel.js`): inventoryItemId, movementType ('entrada'|'salida'|'ajuste'), quantity, reason, performedBy
 *
 * ⚠️ Nota de mapeo UI <-> Backend:
 * En la UI actual los campos se llaman `id` (código/SKU), `stock`, `minStock`, `price` y `supplier`.
 * En `Inventory` se llaman `sku`, `quantity`, `minimumStock`, `unitPrice` y `brand`.
 */
import { apiRequest } from "@/services/api";

// TODO [BACKEND - GET /api/inventory]:
// Listar productos del inventario (usado en `Inventory.jsx` y en el selector de repuestos de `OrderDetail.jsx`).
export function getProducts() {
    return apiRequest("/inventory");
}

// TODO [BACKEND - POST /api/inventory]:
// Crear un nuevo repuesto o accesorio en `inventory` (desde `Inventory.jsx` o al crear un repuesto desde `OrderDetail.jsx`).
export function createProduct(data) {
    return apiRequest("/inventory", { method: "POST", body: data });
}

// TODO [BACKEND - PUT /api/inventory/:id]:
// Editar datos de un producto existente.
export function updateProduct(id, data) {
    return apiRequest(`/inventory/${id}`, { method: "PUT", body: data });
}

// TODO [BACKEND - PATCH /api/inventory/:id/stock]:
// Ajustar stock con los botones - / + de `Inventory.jsx` y registrar el movimiento en `inventory_movements`
// (`movementType: 'entrada' | 'salida' | 'ajuste'`, `performedBy: req.user.id`).
export function adjustProductStock(id, delta, reason = "Ajuste manual") {
    return apiRequest(`/inventory/${id}/stock`, { method: "PATCH", body: { delta, reason } });
}

// TODO [BACKEND - DELETE /api/inventory/:id]:
// Eliminar producto del inventario.
export function deleteProduct(id) {
    return apiRequest(`/inventory/${id}`, { method: "DELETE" });
}
