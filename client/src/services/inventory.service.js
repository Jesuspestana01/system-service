import { apiRequest } from "@/services/api";

// normalize backend inventory record into ui product format
export const mapProductFromApi = (item) => {
  if (!item) return null;
  const code = item.sku || `INV-${String(item.id).padStart(3, "0")}`;
  const trackStock = item.trackStock !== false;
  return {
    id: item.id,
    code,
    sku: code,
    name: item.name ?? "",
    description: item.description ?? "",
    category: item.category ?? "Otros",
    supplier: item.brand ?? item.supplier ?? "",
    trackStock,
    stock: trackStock ? Number(item.quantity ?? item.stock ?? 0) : 0,
    minStock: trackStock ? Number(item.minimumStock ?? item.minStock ?? 0) : 0,
    price: Number(item.unitPrice ?? item.price ?? 0),
    status: item.status ?? "disponible",
  };
};

// build backend inventory payload from ui product fields
const buildProductPayload = (data, isUpdate = false) => {
  const trackStock = data.trackStock !== false && data.trackStock !== "false";
  const quantity = trackStock ? Math.max(0, Number(data.quantity ?? data.stock ?? 0)) : 0;
  const payload = {
    name: String(data.name ?? "").trim(),
    description: data.description ? String(data.description).trim() : null,
    category: String(data.category ?? "Otros").trim(),
    brand: String(data.brand ?? data.supplier ?? "").trim() || "General",
    trackStock,
    quantity,
    minimumStock: trackStock ? Math.max(0, Number(data.minimumStock ?? data.minStock ?? 1)) : 0,
    unitPrice: Math.max(0, Number(data.unitPrice ?? data.price ?? 0)),
    status: !trackStock || quantity > 0 ? "disponible" : "agotado",
  };

  if (data.sku) {
    payload.sku = data.sku;
  } else if (!isUpdate) {
    payload.sku = `INV-${Date.now().toString().slice(-4)}`;
  }

  return payload;
};

// fetch all inventory products
export async function getProducts() {
  const response = await apiRequest("/inventory?limit=100");
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.map(mapProductFromApi);
}

// create new inventory product
export async function createProduct(data) {
  const payload = buildProductPayload(data, false);
  const response = await apiRequest("/inventory", {
    method: "POST",
    body: payload,
  });
  return mapProductFromApi(response?.data);
}

// update existing inventory product
export async function updateProduct(id, data) {
  const payload = buildProductPayload(data, true);
  const response = await apiRequest(`/inventory/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapProductFromApi(response?.data);
}

// adjust product stock by delta or target quantity
export async function adjustProductStock(id, delta, nextQuantity, reason = "Ajuste manual") {
  const performedBy = Number(localStorage.getItem("id")) || undefined;
  try {
    const response = await apiRequest(`/inventory/${id}/stock`, {
      method: "PATCH",
      body: { delta, quantity: nextQuantity, reason, performedBy },
    });
    return mapProductFromApi(response?.data);
  } catch {
    const response = await apiRequest(`/inventory/${id}`, {
      method: "PUT",
      body: {
        quantity: nextQuantity,
        status: nextQuantity > 0 ? "disponible" : "agotado",
      },
    });
    return mapProductFromApi(response?.data);
  }
}

// delete inventory product by id
export async function deleteProduct(id) {
  return apiRequest(`/inventory/${id}`, { method: "DELETE" });
}
