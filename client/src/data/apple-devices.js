// Catálogo de equipos Apple: tipo de equipo -> modelos.
// Para agregar un modelo nuevo basta con añadirlo a la lista correspondiente.

export const OTHER_MODEL = "Otro modelo (no listado)";

const catalog = {
    iPhone: [
        "iPhone 17 Pro Max - 2025",
        "iPhone 17 Pro - 2025",
        "iPhone Air - 2025",
        "iPhone 17 - 2025",
        "iPhone 16 Pro Max - 2024",
        "iPhone 16 Pro - 2024",
        "iPhone 16 Plus - 2024",
        "iPhone 16 - 2024",
        "iPhone 16e - 2025",
        "iPhone 15 Pro Max - 2023",
        "iPhone 15 Pro - 2023",
        "iPhone 15 Plus - 2023",
        "iPhone 15 - 2023",
        "iPhone 14 Pro Max - 2022",
        "iPhone 14 Pro - 2022",
        "iPhone 14 Plus - 2022",
        "iPhone 14 - 2022",
        "iPhone 13 Pro Max - 2021",
        "iPhone 13 Pro - 2021",
        "iPhone 13 - 2021",
        "iPhone 13 mini - 2021",
        "iPhone 12 Pro Max - 2020",
        "iPhone 12 Pro - 2020",
        "iPhone 12 - 2020",
        "iPhone 12 mini - 2020",
        "iPhone 11 Pro Max - 2019",
        "iPhone 11 Pro - 2019",
        "iPhone 11 - 2019",
        "iPhone SE 3ª gen - 2022",
        "iPhone SE 2ª gen - 2020",
    ],
    MacBook: [
        'MacBook Pro 14" - M5 - 2025',
        'MacBook Air 15" - M4 - 2025',
        'MacBook Air 13" - M4 - 2025',
        'MacBook Pro 16" - M4 Pro/Max - 2024',
        'MacBook Pro 14" - M4 - 2024',
        'MacBook Air 15" - M3 - 2024',
        'MacBook Air 13" - M3 - 2024',
        'MacBook Pro 16" - M3 Pro/Max - 2023',
        'MacBook Pro 14" - M3 - 2023',
        'MacBook Air 15" - M2 - 2023',
        'MacBook Pro 16" - M2 Pro/Max - 2023',
        'MacBook Pro 14" - M2 Pro/Max - 2023',
        'MacBook Air 13" - M2 - 2022',
        'MacBook Pro 13" - M2 - 2022',
        'MacBook Pro 16" - M1 Pro/Max - 2021',
        'MacBook Pro 14" - M1 Pro/Max - 2021',
        'MacBook Air 13" - M1 - 2020',
        'MacBook Pro 13" - M1 - 2020',
        'MacBook Air 13" - Intel - 2020',
        'MacBook Pro 13" - Intel - 2020',
        'MacBook Pro 16" - Intel - 2019',
    ],
    iPad: [
        'iPad Pro 13" - M5 - 2025',
        'iPad Pro 11" - M5 - 2025',
        'iPad Air 13" - M3 - 2025',
        'iPad Air 11" - M3 - 2025',
        "iPad 11ª gen - A16 - 2025",
        'iPad Pro 13" - M4 - 2024',
        'iPad Pro 11" - M4 - 2024',
        'iPad Air 13" - M2 - 2024',
        'iPad Air 11" - M2 - 2024',
        "iPad mini 7ª gen - A17 Pro - 2024",
        'iPad Pro 12.9" 6ª gen - M2 - 2022',
        'iPad Pro 11" 4ª gen - M2 - 2022',
        "iPad Air 5ª gen - M1 - 2022",
        "iPad 10ª gen - 2022",
        "iPad 9ª gen - 2021",
        "iPad mini 6ª gen - 2021",
    ],
    iMac: [
        'iMac 24" - M4 - 2024',
        'iMac 24" - M3 - 2023',
        'iMac 24" - M1 - 2021',
        'iMac 27" - Intel - 2020',
        'iMac 21.5" - Intel - 2019',
    ],
    "Mac mini / Mac Studio": [
        "Mac Studio - M4 Max / M3 Ultra - 2025",
        "Mac mini - M4 / M4 Pro - 2024",
        "Mac Studio - M2 Max / M2 Ultra - 2023",
        "Mac mini - M2 / M2 Pro - 2023",
        "Mac Studio - M1 Max / M1 Ultra - 2022",
        "Mac mini - M1 - 2020",
        "Mac mini - Intel - 2018",
    ],
    "Apple Watch": [
        "Apple Watch Series 11 - 2025",
        "Apple Watch Ultra 3 - 2025",
        "Apple Watch SE 3 - 2025",
        "Apple Watch Series 10 - 2024",
        "Apple Watch Series 9 - 2023",
        "Apple Watch Ultra 2 - 2023",
        "Apple Watch Series 8 - 2022",
        "Apple Watch Ultra - 2022",
        "Apple Watch SE 2ª gen - 2022",
        "Apple Watch Series 7 - 2021",
    ],
    AirPods: [
        "AirPods Pro 3 - 2025",
        "AirPods 4 - 2024",
        "AirPods Max USB-C - 2024",
        "AirPods Pro 2 - 2022",
        "AirPods 3ª gen - 2021",
        "AirPods Max - 2020",
        "AirPods 2ª gen - 2019",
    ],
};

export const APPLE_DEVICE_TYPES = Object.keys(catalog);

// Modelos de un tipo de equipo, siempre con la opción "Otro modelo" al final
export const getModelsByType = (type) => [...(catalog[type] ?? []), OTHER_MODEL];

// Tipos de equipo que usan IMEI (con conexión celular)
const IMEI_TYPES = ["iPhone", "iPad", "Apple Watch"];

export const getSerialPlaceholder = (type) =>
    IMEI_TYPES.includes(type) ? "IMEI (15 dígitos) o N° de serie" : "N° de serie (Ej: C02XL0GHJGH5)";
