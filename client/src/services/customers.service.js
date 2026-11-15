import { apiRequest } from "@/services/api";
import { mapOrderFromApi } from "@/services/orders.service";

// normalize backend client record into ui customer format
export const mapCustomerFromApi = (client) => {
  if (!client) return null;
  const fullName = `${client.name ?? ""} ${
    client.lastName && client.lastName !== "-" ? client.lastName : ""
  }`.trim();

  const rawEmail = client.email ?? "";
  const email = rawEmail.endsWith("@ispot.local") ? "" : rawEmail;

  const rawOrders = Array.isArray(client.serviceOrders)
    ? client.serviceOrders
    : Array.isArray(client.orders)
      ? client.orders
      : [];

  const orders = rawOrders.map((o) =>
    mapOrderFromApi({
      ...o,
      client: o.client ?? {
        id: client.id,
        name: client.name,
        lastName: client.lastName,
      },
    })
  );

  return {
    id: client.id,
    code: `CL-${String(client.id).padStart(3, "0")}`,
    name: fullName || client.name || "—",
    firstName: client.name ?? "",
    lastName: client.lastName ?? "",
    document: client.identityDocument ?? client.document ?? "",
    email,
    phone: client.phone ?? "",
    address: client.address ?? "",
    ordersCount: Array.isArray(client.serviceOrders)
      ? client.serviceOrders.length
      : (client.ordersCount ?? orders.length ?? 0),
    orders,
    createdAt: client.createdAt,
  };
};

// split full name into name and lastName for backend model
const buildClientPayload = (data) => {
  const rawName = String(data.name ?? "").trim();
  const parts = rawName.split(/\s+/);
  const firstName = parts[0] || "Cliente";
  const lastName = data.lastName
    ? String(data.lastName).trim()
    : parts.slice(1).join(" ") || "-";
  const identityDocument = String(data.identityDocument ?? data.document ?? "").trim();
  const cleanDoc =
    identityDocument.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || Date.now();
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

// fetch single customer and their full service orders by id
export async function getCustomerById(customerId) {
  const [clientRes, ordersRes] = await Promise.allSettled([
    apiRequest(`/clients/${encodeURIComponent(customerId)}`),
    apiRequest(`/service-orders?clientId=${encodeURIComponent(customerId)}&limit=100`),
  ]);

  const rawClient =
    clientRes.status === "fulfilled" ? clientRes.value?.data : null;
  if (!rawClient) return null;

  const customer = mapCustomerFromApi(rawClient);

  if (
    ordersRes.status === "fulfilled" &&
    Array.isArray(ordersRes.value?.data) &&
    ordersRes.value.data.length > 0
  ) {
    customer.orders = ordersRes.value.data.map(mapOrderFromApi);
    customer.ordersCount = customer.orders.length;
  }

  return customer;
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
