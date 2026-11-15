import { apiRequest } from "@/services/api";

// normalize backend service order into ui order structure
export const mapOrderFromApi = (raw) => {
  if (!raw) return null;
  if (raw.initialDiagnosis && raw.billing && !raw.orderNumber && !raw.clientId) {
    return raw;
  }

  const clientName = raw.client
    ? `${raw.client.name ?? ""} ${
        raw.client.lastName && raw.client.lastName !== "-" ? raw.client.lastName : ""
      }`.trim()
    : (raw.customer ?? "—");

  const techUser = raw.assignedTechnicianUser;
  const technicianName = techUser
    ? `${techUser.name ?? ""} ${techUser.lastName ?? ""}`.trim()
    : (raw.technician || "Sin asignar");

  const historyList = Array.isArray(raw.history) ? raw.history : [];
  const reports = [...historyList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((entry) => {
      const userFullName = entry.user
        ? `${entry.user.name ?? ""} ${entry.user.lastName ?? ""}`.trim()
        : "";
      const actionAuthor = String(entry.action ?? "").includes("·")
        ? entry.action.split("·")[1].trim()
        : "";
      return {
        id: entry.id,
        author: actionAuthor || userFullName || technicianName || "Técnico",
        createdAt: entry.createdAt,
        note: entry.description || entry.action || "",
      };
    });

  const usedPartsList = Array.isArray(raw.usedParts) ? raw.usedParts : [];
  const items = usedPartsList.map((part) => {
    const inv = part.inventoryItem;
    const isService = part.itemType === "service" || !part.inventoryItemId;
    return {
      id: part.id,
      type: isService ? "service" : "inventory",
      inventoryItemId: part.inventoryItemId ?? null,
      code:
        part.code ||
        inv?.sku ||
        (isService ? "SERVICIO" : `INV-${part.inventoryItemId}`),
      name: part.name || inv?.name || "Cargo de servicio",
      quantity: Number(part.quantity) || 1,
      unitPrice: Number(part.unitPrice ?? inv?.unitPrice) || 0,
      discountPercent: Number(part.discountPercent) || 0,
    };
  });

  return {
    id: raw.orderNumber || String(raw.id),
    dbId: raw.id,
    orderNumber: raw.orderNumber || String(raw.id),
    customerId: raw.clientId ?? raw.customerId ?? null,
    customer: clientName,
    client: raw.client ?? null,
    equipmentId: raw.equipmentId ?? raw.equipment?.id ?? null,
    deviceType: raw.equipment?.deviceType ?? raw.deviceType ?? "iPhone",
    device: raw.equipment?.model ?? raw.device ?? "—",
    serial: raw.equipment?.serialNumber ?? raw.serial ?? "—",
    color: raw.equipment?.color ?? raw.color ?? "",
    accessories: raw.equipment?.accessories ?? raw.accessories ?? "",
    physicalCondition:
      raw.equipment?.physicalCondition ?? raw.physicalCondition ?? "",
    technicianId: raw.assignedTechnician ?? null,
    technician: technicianName,
    status: raw.status || "Recibido",
    receivedAt: raw.receivedAt || raw.createdAt,
    estimatedCost: Number(raw.estimatedCost) || 0,
    finalCost: Number(raw.finalCost) || 0,
    initialDiagnosis: {
      reportedProblem: raw.reportedProblem ?? "",
      diagnosis: raw.diagnosis ?? "",
      updatedAt: raw.updatedAt || raw.receivedAt || null,
    },
    reports,
    billing: {
      discountPercent: Number(raw.discountPercent) || 0,
      items,
    },
  };
};

// fetch all service orders
export const getOrders = async () => {
  const response = await apiRequest("/service-orders?limit=100");
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.map(mapOrderFromApi);
};

// fetch last 5 service orders for main dashboard
export const getLastOrders = () => {
  return apiRequest("/service-orders?limit=5");
};

// fetch single order by id or orderNumber
export const getOrderById = async (orderId) => {
  try {
    const response = await apiRequest(`/service-orders/${encodeURIComponent(orderId)}`);
    if (response?.data) return mapOrderFromApi(response.data);
  } catch {
    // fallback search by orderNumber query if server only supports numeric /:id
    const listResponse = await apiRequest(
      `/service-orders?orderNumber=${encodeURIComponent(orderId)}&limit=1`
    );
    const match = listResponse?.data?.[0];
    if (match) {
      const full = await apiRequest(`/service-orders/${match.id}`);
      return mapOrderFromApi(full?.data ?? match);
    }
  }
  return null;
};

// create a new service order (with equipment creation fallback)
export const createOrder = async (payload) => {
  const receivedBy = Number(localStorage.getItem("id")) || undefined;
  const clientId = Number(payload.customerId ?? payload.clientId);
  const serialNumber = String(payload.serial ?? payload.serialNumber ?? "")
    .trim()
    .toUpperCase();

  try {
    const response = await apiRequest("/service-orders", {
      method: "POST",
      body: {
        ...payload,
        clientId,
        serialNumber,
        model: payload.device ?? payload.model,
        receivedBy,
      },
    });
    return mapOrderFromApi(response?.data);
  } catch {
    // fallback if server requires equipmentId and orderNumber upfront
    let equipmentId = payload.equipmentId;
    if (!equipmentId) {
      const eqSearch = await apiRequest(
        `/equipment?serialNumber=${encodeURIComponent(serialNumber)}&limit=1`
      );
      if (eqSearch?.data?.[0]?.id) {
        equipmentId = eqSearch.data[0].id;
      } else {
        const eqCreated = await apiRequest("/equipment", {
          method: "POST",
          body: {
            clientId,
            deviceType: payload.deviceType || "iPhone",
            brand: "Apple",
            model: payload.device || payload.model || "Apple Device",
            serialNumber,
          },
        });
        equipmentId = eqCreated?.data?.id;
      }
    }

    const orderNumber = `OS-${Date.now().toString().slice(-4)}`;
    const created = await apiRequest("/service-orders", {
      method: "POST",
      body: {
        orderNumber,
        clientId,
        equipmentId,
        receivedBy: receivedBy || 1,
        assignedTechnician: payload.technicianId || null,
        reportedProblem: payload.reportedProblem || "Pendiente de diagnóstico",
        status: "Recibido",
      },
    });
    const full = await apiRequest(`/service-orders/${created?.data?.id}`);
    return mapOrderFromApi(full?.data ?? created?.data);
  }
};

// update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/status`, {
      method: "PATCH",
      body: { status },
    });
    return mapOrderFromApi(response?.data);
  } catch {
    const response = await apiRequest(`/service-orders/${orderId}`, {
      method: "PUT",
      body: { status },
    });
    return mapOrderFromApi(response?.data);
  }
};

// update order equipment, client and assigned technician
export const updateOrderEquipment = async (orderId, payload) => {
  const clientId = Number(payload.customerId ?? payload.clientId);
  try {
    const response = await apiRequest(`/service-orders/${orderId}/equipment`, {
      method: "PUT",
      body: {
        ...payload,
        clientId,
        model: payload.device ?? payload.model,
        serialNumber: payload.serial ?? payload.serialNumber,
      },
    });
    return mapOrderFromApi(response?.data);
  } catch {
    if (payload.equipmentId) {
      await apiRequest(`/equipment/${payload.equipmentId}`, {
        method: "PUT",
        body: {
          clientId,
          deviceType: payload.deviceType,
          model: payload.device ?? payload.model,
          serialNumber: payload.serial ?? payload.serialNumber,
          color: payload.color,
          accessories: payload.accessories,
          physicalCondition: payload.physicalCondition,
        },
      });
    }
    const response = await apiRequest(`/service-orders/${orderId}`, {
      method: "PUT",
      body: {
        clientId,
        assignedTechnician: payload.technicianId ?? null,
      },
    });
    return mapOrderFromApi(response?.data);
  }
};

// save order reportedProblem and initial diagnosis
export const updateOrderDiagnosis = async (orderId, { reportedProblem, diagnosis }) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/diagnosis`, {
      method: "PATCH",
      body: { reportedProblem, diagnosis },
    });
    return mapOrderFromApi(response?.data);
  } catch {
    const response = await apiRequest(`/service-orders/${orderId}`, {
      method: "PUT",
      body: { reportedProblem, diagnosis },
    });
    return mapOrderFromApi(response?.data);
  }
};

// add technician report to order history
export const addOrderReport = async (orderId, { author, note, userId }) => {
  const currentUserId = userId || Number(localStorage.getItem("id")) || 1;
  try {
    const response = await apiRequest(`/service-orders/${orderId}/reports`, {
      method: "POST",
      body: { author, note, userId: currentUserId },
    });
    const entry = response?.data;
    return {
      id: entry?.id ?? `REP-${Date.now()}`,
      author: author || "Técnico",
      createdAt: entry?.createdAt || new Date().toISOString(),
      note,
    };
  } catch {
    const response = await apiRequest("/service-history", {
      method: "POST",
      body: {
        serviceOrderId: Number(orderId),
        userId: currentUserId,
        action: author ? `Informe técnico · ${author}` : "Informe técnico",
        description: note,
      },
    });
    const entry = response?.data;
    return {
      id: entry?.id ?? `REP-${Date.now()}`,
      author: author || "Técnico",
      createdAt: entry?.createdAt || new Date().toISOString(),
      note,
    };
  }
};

// delete technician report from order history
export const deleteOrderReport = async (orderId, reportId) => {
  try {
    return await apiRequest(`/service-orders/${orderId}/reports/${reportId}`, {
      method: "DELETE",
    });
  } catch {
    return apiRequest(`/service-history/${reportId}`, {
      method: "DELETE",
    });
  }
};

// add billing item to order
export const addOrderBillingItem = async (orderId, item) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/items`, {
      method: "POST",
      body: item,
    });
    return mapOrderFromApi(response?.data);
  } catch {
    if (item.inventoryItemId) {
      await apiRequest("/used-parts", {
        method: "POST",
        body: {
          serviceOrderId: Number(orderId),
          inventoryItemId: Number(item.inventoryItemId),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        },
      });
      return getOrderById(orderId);
    }
    return null;
  }
};

// update billing item quantity, unitPrice or discountPercent
export const updateOrderBillingItem = async (orderId, itemId, changes) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/items/${itemId}`, {
      method: "PATCH",
      body: changes,
    });
    return mapOrderFromApi(response?.data);
  } catch {
    await apiRequest(`/used-parts/${itemId}`, {
      method: "PUT",
      body: changes,
    });
    return getOrderById(orderId);
  }
};

// remove billing item from order
export const removeOrderBillingItem = async (orderId, itemId) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/items/${itemId}`, {
      method: "DELETE",
    });
    return mapOrderFromApi(response?.data);
  } catch {
    await apiRequest(`/used-parts/${itemId}`, {
      method: "DELETE",
    });
    return getOrderById(orderId);
  }
};

// update global discount percent on order
export const updateOrderBillingDiscount = async (orderId, discountPercent) => {
  try {
    const response = await apiRequest(`/service-orders/${orderId}/billing`, {
      method: "PATCH",
      body: { discountPercent },
    });
    return mapOrderFromApi(response?.data);
  } catch {
    return null;
  }
};

// delete service order by id or orderNumber
export const deleteOrder = async (orderId) => {
  return apiRequest(`/service-orders/${orderId}`, { method: "DELETE" });
};
