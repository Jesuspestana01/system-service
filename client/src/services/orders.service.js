/**
 * Servicio de Órdenes -> Modelos Sequelize relacionados:
 * - `ServiceOrder` (`server/models/serviceOrderModel.js`)
 * - `Equipment` (`server/models/equipmentModel.js`)
 * - `ServiceHistory` (`server/models/serviceHistoryModel.js`)
 * - `UsedPart` (`server/models/usedPartModel.js`)
 * - `Payment` (`server/models/paymentModel.js`)
 */
import { apiRequest } from "@/services/api";

// TODO [BACKEND - GET /api/orders]:
// Listar órdenes con `include: ['client', 'equipment', 'assignedTechnicianUser']` para `Orders.jsx` y `Main.jsx`.
export function getOrders() {
    return apiRequest("/orders");
}

// TODO [BACKEND - GET /api/orders/:id]:
// Obtener el detalle completo de una orden para `OrderDetail.jsx`, incluyendo:
// `client`, `equipment`, `assignedTechnicianUser`, `history` (informes del técnico) y `usedParts` (cargos/repuestos).
export function getOrderById(orderId) {
    return apiRequest(`/orders/${orderId}`);
}

// TODO [BACKEND - POST /api/orders]:
// En una transacción Sequelize:
// 1. Buscar o crear el `Equipment` por `serialNumber` (`clientId`, `deviceType`, `brand: 'Apple'`, `model`, `serialNumber`).
// 2. Crear la `ServiceOrder` en estado `'recibido'` con `receivedBy: req.user.id`.
// 3. Crear el primer evento en `ServiceHistory` (`action: 'Orden creada'`, `newStatus: 'Recibido'`).
export function createOrder(payload) {
    return apiRequest("/orders", { method: "POST", body: payload });
}

// TODO [BACKEND - PATCH /api/orders/:id/status]:
// Actualizar `ServiceOrder.status` (y `deliveredAt = new Date()` cuando pase a `'Entregado'`)
// y registrar el cambio en `ServiceHistory` con `previousStatus` y `newStatus`.
export function updateOrderStatus(orderId, status) {
    return apiRequest(`/orders/${orderId}/status`, { method: "PATCH", body: { status } });
}

// TODO [BACKEND - PUT /api/orders/:id/equipment]:
// Actualizar los datos del equipo (`Equipment`: `deviceType`, `model`, `serialNumber`, `color`, `accessories`, `physicalCondition`)
// y/o el cliente y técnico asignado en `ServiceOrder` cuando hubo una equivocación al ingresarlo.
export function updateOrderEquipment(orderId, payload) {
    return apiRequest(`/orders/${orderId}/equipment`, { method: "PUT", body: payload });
}

// TODO [BACKEND - PATCH /api/orders/:id/diagnosis]:
// Guardar `reportedProblem` y `diagnosis` en `ServiceOrder` (Sección 1 de `OrderDetail.jsx`).
export function updateOrderDiagnosis(orderId, payload) {
    return apiRequest(`/orders/${orderId}/diagnosis`, { method: "PATCH", body: payload });
}

// TODO [BACKEND - POST /api/orders/:id/reports]:
// Crear un nuevo informe técnico en `ServiceHistory` (`serviceOrderId`, `userId: req.user.id`, `action: 'Informe técnico'`, `description`).
export function addOrderReport(orderId, payload) {
    return apiRequest(`/orders/${orderId}/reports`, { method: "POST", body: payload });
}

// TODO [BACKEND - DELETE /api/orders/:id/reports/:reportId]:
// Eliminar un informe técnico de `ServiceHistory`.
export function deleteOrderReport(orderId, reportId) {
    return apiRequest(`/orders/${orderId}/reports/${reportId}`, { method: "DELETE" });
}

// TODO [BACKEND - POST /api/orders/:id/items]:
// Agregar un repuesto o mano de obra a la orden (`UsedPart`).
// Si `type === 'inventory'`, en la misma transacción descontar `quantity` de `Inventory` y crear un `InventoryMovement` de tipo `'salida'`.
export function addOrderBillingItem(orderId, item) {
    return apiRequest(`/orders/${orderId}/items`, { method: "POST", body: item });
}

// TODO [BACKEND - PATCH /api/orders/:id/items/:itemId]:
// Actualizar cantidad, precio unitario o `%` de descuento por línea de un cargo, y recalcular `ServiceOrder.finalCost`.
export function updateOrderBillingItem(orderId, itemId, changes) {
    return apiRequest(`/orders/${orderId}/items/${itemId}`, { method: "PATCH", body: changes });
}

// TODO [BACKEND - DELETE /api/orders/:id/items/:itemId]:
// Quitar un cargo de la orden. Si provenía de inventario, reintegrar la cantidad a `Inventory` y registrar `InventoryMovement` de `'entrada'`.
export function removeOrderBillingItem(orderId, itemId) {
    return apiRequest(`/orders/${orderId}/items/${itemId}`, { method: "DELETE" });
}

// TODO [BACKEND - PATCH /api/orders/:id/billing]:
// Guardar el porcentaje de descuento global y actualizar `estimatedCost` / `finalCost` en `ServiceOrder`.
export function updateOrderBillingDiscount(orderId, discountPercent) {
    return apiRequest(`/orders/${orderId}/billing`, { method: "PATCH", body: { discountPercent } });
}

// TODO [BACKEND - DELETE /api/orders/:id]:
// Eliminar una orden de servicio.
export function deleteOrder(orderId) {
    return apiRequest(`/orders/${orderId}`, { method: "DELETE" });
}