// TODO: datos de prueba. Reemplazar por la API cuando el backend esté listo.

export const ORDER_STATUSES = ["Recibido", "En diagnóstico", "En reparación", "Listo", "Entregado"];

export const ORDER_STATUS_STYLES = {
    "Recibido": "border-blue-200 bg-blue-50 text-blue-700",
    "En diagnóstico": "border-violet-200 bg-violet-50 text-violet-700",
    "En reparación": "border-amber-200 bg-amber-50 text-amber-700",
    "Listo": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Entregado": "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export const DEVICE_TYPES = ["Laptop", "Celular", "Tablet", "PC de escritorio", "Consola", "Otro"];

export const TECHNICIANS = ["Sin asignar", "Pedro Ramírez", "José Castillo", "Daniela Rojas"];

export const orders = [
    {
        id: "OS-1042",
        customer: "María González",
        deviceType: "Laptop",
        device: "HP Pavilion 15",
        serial: "5CD1234XYZ",
        issue: "No enciende, posible falla en el cargador",
        technician: "Pedro Ramírez",
        status: "Recibido",
        estimatedCost: 45,
        receivedAt: "2026-11-05",
    },
    {
        id: "OS-1041",
        customer: "Carlos Pérez",
        deviceType: "Celular",
        device: "iPhone 13",
        serial: "F2LXK9ABCD12",
        issue: "Pantalla rota",
        technician: "José Castillo",
        status: "En reparación",
        estimatedCost: 180,
        receivedAt: "2026-11-04",
    },
    {
        id: "OS-1040",
        customer: "Ana Rodríguez",
        deviceType: "Celular",
        device: "Samsung Galaxy S22",
        serial: "R58T20ABC1",
        issue: "Batería se descarga muy rápido",
        technician: "Daniela Rojas",
        status: "Listo",
        estimatedCost: 60,
        receivedAt: "2026-11-04",
    },
    {
        id: "OS-1039",
        customer: "Luis Martínez",
        deviceType: "PC de escritorio",
        device: "Dell OptiPlex 7090",
        serial: "DL7090-88123",
        issue: "Se reinicia solo, posible sobrecalentamiento",
        technician: "Pedro Ramírez",
        status: "En diagnóstico",
        estimatedCost: 35,
        receivedAt: "2026-11-03",
    },
    {
        id: "OS-1038",
        customer: "Sofía Herrera",
        deviceType: "Tablet",
        device: "iPad Air 4",
        serial: "DMPX12345678",
        issue: "No carga",
        technician: "José Castillo",
        status: "Entregado",
        estimatedCost: 50,
        receivedAt: "2026-11-02",
    },
    {
        id: "OS-1037",
        customer: "Carlos Pérez",
        deviceType: "Consola",
        device: "PlayStation 5",
        serial: "PS5-00981233",
        issue: "Mantenimiento y cambio de pasta térmica",
        technician: "Sin asignar",
        status: "Recibido",
        estimatedCost: 40,
        receivedAt: "2026-11-01",
    },
];
