import { apiRequest } from "@/services/api";

// normalize backend client record into ui customer format
export const mapCustomerFromApi = (client) => {
  if (!client) return null;
  const fullName = `${client.name ?? ""} ${
    client.lastName && client.lastName !== "-" ? client.lastName : ""
  }`.trim();

  return {
    id: client.id,
    name: fullName || client.name || "—",
    firstName: client.name ?? "",
    lastName: client.lastName ?? "",
    document: client.identityDocument ?? client.document ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    ordersCount: Array.isArray(client.serviceOrders)
      ? client.serviceOrders.length
      : (client.ordersCount ?? 0),
    createdAt: client.createdAt,
  };
};

// split full name into name and lastName for backend model
const buildClientPayload = (data) => {
  const rawName = String(data.name ?? "").trim();
  const parts = rawName.split(/\s+/);
  const firstName = parts[0] || "Cliente";
  const lastName = data.lastName ? String(data.lastName).trim() : parts.slice(1).join(" ") || "-";
  const identityDocument = String(data.identityDocument ?? data.document ?? "").trim();
  const cleanDoc = identityDocument.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || Date.now();
  const email =
    data.email && String(data.email).trim()
      ? String(data.email).trim().toLowerCase()
      : `cliente.${cleanDoc}@ispot.local`;

  return {
    name: firstName,
    lastName,
    identityDocument,
    email,
    phone: String(data.phone ?? "").trim(),
    address: data.address ? String(data.address).trim() : null,
  };
};

// fetch all customers from api
export async function getCustomers() {
  const response = await apiRequest("/clients?limit=100");
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.map(mapCustomerFromApi);
}

// create customer in api
export async function createCustomer(data) {
  const payload = buildClientPayload(data);
  const response = await apiRequest("/clients", {
    method: "POST",
    body: payload,
  });
  return mapCustomerFromApi(response?.data);
}

// update existing customer in api
export async function updateCustomer(id, data) {
  const payload = buildClientPayload(data);
  const response = await apiRequest(`/clients/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapCustomerFromApi(response?.data);
}

// delete customer by id
export async function deleteCustomer(id) {
  return apiRequest(`/clients/${id}`, { method: "DELETE" });
}
