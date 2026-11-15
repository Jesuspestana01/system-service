import { apiRequest } from "@/services/api";

// normalize device model record from backend
export const mapDeviceModelFromApi = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        deviceType: row.deviceType ?? "",
        name: row.name ?? "",
        createdAt: row.createdAt,
    };
};

// fetch all equipment models from backend
export async function getDeviceModels(deviceType) {
    const query = deviceType ? `?deviceType=${encodeURIComponent(deviceType)}` : "";
    const response = await apiRequest(`/equipment/models${query}`);
    const rows = Array.isArray(response?.data) ? response.data : [];
    return rows.map(mapDeviceModelFromApi).filter(Boolean);
}

// create a new model under a specific deviceType (iPhone, MacBook, etc.) in backend
export async function createDeviceModel({ deviceType, name }) {
    const cleanType = String(deviceType ?? "").trim();
    const cleanName = String(name ?? "").trim();

    const response = await apiRequest("/equipment/models", {
        method: "POST",
        body: {
            deviceType: cleanType,
            name: cleanName,
        },
    });
    return mapDeviceModelFromApi(response?.data);
}

// delete an equipment model by id in backend
export async function deleteDeviceModel(id) {
    await apiRequest(`/equipment/models/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    return true;
}
