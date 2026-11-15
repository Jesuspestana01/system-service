import { apiRequest } from "@/services/api";

// normalize backend inventory record into ui product format
export const mapProductFromApi = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    sku: item.sku || `INV-${item.id}`,
    name: item.name ?? "",
    description: item.description ?? "",
    category: item.category ?? "Repuestos",
    supplier: item.brand ?? item.supplier ?? "Apple",
    stock: Number(item.quantity ?? item.stock ?? 0),
    minStock: Number(item.minimumStock ?? item.minStock ?? 0),
    price: Number(item.unitPrice ?? item.price ?? 0),
    status: item.status ?? "disponible",
  };
};

// build backend inventory payload from ui product fields
const buildProductPayload = (data) => {
  const quantity = Number(data.quantity ?? data.stock ?? 0);
  return {
    name: String(data.name ?? "").trim(),
    description: data.description ? String(data.description).trim() : null,
    category: String(data.category ?? "Repuestos").trim(),
    brand: String(data.brand ?? data.supplier ?? "Apple").trim() || "Apple",
    sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
    quantity,
    minimumStock: Number(data.minimumStock ?? data.minStock ?? 1),
    unitPrice: Number(data.unitPrice ?? data.price ?? 0),
    status: quantity > 0 ? "disponible" : "agotado",
  };
};

// fetch all inventory products
export async function getProducts() {
  const response = await apiRequest("/inventory?limit=100");
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.map(mapProductFromApi);
}

// create new inventory product
export async function createProduct(data) {
  const payload = buildProductPayload(data);
  const response = await apiRequest("/inventory", {
    method: "POST",
    body: payload,
  });
  return mapProductFromApi(response?.data);
}

// update inventory product
export async function updateProduct(id, data) {
  const payload = buildProductPayload(data);
  const response = await apiRequest(`/inventory/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapProductFromApi(response?.data);
}

// adjust product stock
export async function adjustProductStock(id, delta, reason = "Ajuste manual") {
  return apiRequest(`/inventory/${id}/stock`, {
    method: "PATCH",
    body: { delta, reason },
  });
}

// delete inventory product
export async function deleteProduct(id) {
  return apiRequest(`/inventory/${id}`, { method: "DELETE" });
}
