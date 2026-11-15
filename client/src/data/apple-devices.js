// supported apple device categories
export const APPLE_DEVICE_TYPES = [
    "iPhone",
    "MacBook",
    "iPad",
    "iMac",
    "Mac mini / Mac Studio",
    "Apple Watch",
    "AirPods",
];

export const NO_MODELS_LABEL = "Sin modelos";

// return created model names for a specific device category
export const getModelsByType = (type, modelsList = []) => {
    const filtered = modelsList
        .filter((item) => item.deviceType === type)
        .map((item) => item.name)
        .filter(Boolean);
    return filtered.length > 0 ? filtered : [NO_MODELS_LABEL];
};

// device types that support imei (cellular connectivity)
const IMEI_TYPES = ["iPhone", "iPad", "Apple Watch"];

export const getSerialPlaceholder = (type) =>
    IMEI_TYPES.includes(type) ? "IMEI (15 dígitos) o N° de serie" : "N° de serie (Ej: C02XL0GHJGH5)";
