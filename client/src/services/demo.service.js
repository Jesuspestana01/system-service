import { calculateOrderTotals } from "@/data/orders";

export const DEMO_MODE_KEY = "demo_mode";
export const DEMO_DB_KEY = "system_service_demo_db";
export const DEMO_SESSION_EVENT = "demo-session-change";

const DEMO_ROLES = {
    administrador: {
        id: 1,
        name: "Alejandro",
        lastName: "Morales",
        username: "amorales",
        email: "admin@ispot-demo.com",
        role: "administrador",
        label: "Administrador",
    },
    "técnico": {
        id: 2,
        name: "Pedro",
        lastName: "Ramírez",
        username: "pramirez",
        email: "tecnico@ispot-demo.com",
        role: "técnico",
        label: "Técnico",
    },
    "recepción": {
        id: 4,
        name: "Valeria",
        lastName: "Gómez",
        username: "vgomez",
        email: "vendedor@ispot-demo.com",
        role: "recepción",
        label: "Vendedor",
    },
};

// build initial fictional dataset for portfolio preview
const createInitialDemoDb = () => ({
    nextIds: {
        user: 6,
        client: 7,
        equipment: 7,
        order: 7,
        orderNumber: 1043,
        report: 10,
        usedPart: 10,
        inventory: 9,
        model: 18,
    },
    users: [
        {
            id: 1,
            name: "Alejandro",
            lastName: "Morales",
            username: "amorales",
            email: "admin@ispot-demo.com",
            role: "administrador",
            status: "activo",
            createdAt: "2026-08-01T09:00:00Z",
        },
        {
            id: 2,
            name: "Pedro",
            lastName: "Ramírez",
            username: "pramirez",
            email: "pedro.ramirez@ispot-demo.com",
            role: "técnico",
            status: "activo",
            createdAt: "2026-08-10T10:15:00Z",
        },
        {
            id: 3,
            name: "José",
            lastName: "Castillo",
            username: "jcastillo",
            email: "jose.castillo@ispot-demo.com",
            role: "técnico",
            status: "activo",
            createdAt: "2026-08-18T11:30:00Z",
        },
        {
            id: 4,
            name: "Valeria",
            lastName: "Gómez",
            username: "vgomez",
            email: "valeria.gomez@ispot-demo.com",
            role: "recepción",
            status: "activo",
            createdAt: "2026-09-02T08:45:00Z",
        },
        {
            id: 5,
            name: "Daniela",
            lastName: "Rojas",
            username: "drojas",
            email: "daniela.rojas@ispot-demo.com",
            role: "técnico",
            status: "activo",
            createdAt: "2026-09-14T14:20:00Z",
        },
    ],
    clients: [
        {
            id: 6,
            name: "María",
            lastName: "González",
            identityDocument: "18456789",
            email: "maria.gonzalez@gmail.com",
            phone: "04145551234",
            address: "Av. Libertador, Caracas",
            createdAt: "2026-11-05T10:00:00Z",
        },
        {
            id: 5,
            name: "Carlos",
            lastName: "Pérez",
            identityDocument: "20123456",
            email: "carlos.perez@hotmail.com",
            phone: "04245559876",
            address: "Calle 5, Valencia",
            createdAt: "2026-10-28T15:30:00Z",
        },
        {
            id: 4,
            name: "Ana",
            lastName: "Rodríguez",
            identityDocument: "15987654",
            email: "ana.rodriguez@gmail.com",
            phone: "04125554567",
            address: "Urb. El Parral, Valencia",
            createdAt: "2026-10-15T11:20:00Z",
        },
        {
            id: 3,
            name: "Luis",
            lastName: "Martínez",
            identityDocument: "24881230",
            email: "luis.martinez@empresa.com",
            phone: "04165557890",
            address: "Zona Industrial, Maracay",
            createdAt: "2026-09-30T09:10:00Z",
        },
        {
            id: 2,
            name: "Sofía",
            lastName: "Herrera",
            identityDocument: "22654321",
            email: "sofia.herrera@gmail.com",
            phone: "04145553210",
            address: "Av. Bolívar, Barquisimeto",
            createdAt: "2026-09-12T16:40:00Z",
        },
        {
            id: 1,
            name: "Jorge",
            lastName: "Mendoza",
            identityDocument: "12345678",
            email: "jorge.mendoza@yahoo.com",
            phone: "04265551122",
            address: "Centro, Caracas",
            createdAt: "2026-08-20T12:00:00Z",
        },
    ],
    deviceModels: [
        { id: 1, deviceType: "iPhone", name: "iPhone 16 Pro Max - 2024", createdAt: "2026-08-01T10:00:00Z" },
        { id: 2, deviceType: "iPhone", name: "iPhone 15 Pro - 2023", createdAt: "2026-08-01T10:00:00Z" },
        { id: 3, deviceType: "iPhone", name: "iPhone 14 Pro Max - 2022", createdAt: "2026-08-01T10:00:00Z" },
        { id: 4, deviceType: "iPhone", name: "iPhone 13 - 2021", createdAt: "2026-08-01T10:00:00Z" },
        { id: 5, deviceType: "MacBook", name: 'MacBook Pro 14" - M4 - 2024', createdAt: "2026-08-01T10:00:00Z" },
        { id: 6, deviceType: "MacBook", name: 'MacBook Air 13" - M2 - 2022', createdAt: "2026-08-01T10:00:00Z" },
        { id: 7, deviceType: "MacBook", name: 'MacBook Pro 16" - M1 Pro - 2021', createdAt: "2026-08-01T10:00:00Z" },
        { id: 8, deviceType: "iPad", name: 'iPad Pro 11" - M4 - 2024', createdAt: "2026-08-01T10:00:00Z" },
        { id: 9, deviceType: "iPad", name: "iPad Air 5ª gen - M1 - 2022", createdAt: "2026-08-01T10:00:00Z" },
        { id: 10, deviceType: "iMac", name: 'iMac 24" - M3 - 2023', createdAt: "2026-08-01T10:00:00Z" },
        { id: 11, deviceType: "iMac", name: 'iMac 24" - M1 - 2021', createdAt: "2026-08-01T10:00:00Z" },
        { id: 12, deviceType: "Mac mini / Mac Studio", name: "Mac mini - M4 - 2024", createdAt: "2026-08-01T10:00:00Z" },
        { id: 13, deviceType: "Mac mini / Mac Studio", name: "Mac Studio - M2 Max - 2023", createdAt: "2026-08-01T10:00:00Z" },
        { id: 14, deviceType: "Apple Watch", name: "Apple Watch Series 10 - 2024", createdAt: "2026-08-01T10:00:00Z" },
        { id: 15, deviceType: "Apple Watch", name: "Apple Watch Series 9 - 2023", createdAt: "2026-08-01T10:00:00Z" },
        { id: 16, deviceType: "AirPods", name: "AirPods Pro 2 - 2022", createdAt: "2026-08-01T10:00:00Z" },
        { id: 17, deviceType: "AirPods", name: "AirPods 4 - 2024", createdAt: "2026-08-01T10:00:00Z" },
    ],
    inventory: [
        {
            id: 8,
            sku: "INV-008",
            name: "Pantalla iPhone 15 Pro OLED",
            description: "Panel OLED Super Retina XDR 120Hz",
            category: "Pantallas",
            brand: "Apple OEM",
            quantity: 5,
            minimumStock: 2,
            unitPrice: 185,
            trackStock: true,
            status: "disponible",
            createdAt: "2026-10-12T10:00:00Z",
        },
        {
            id: 7,
            sku: "INV-007",
            name: "Pantalla iPhone 13 OLED",
            description: "Panel OLED compatible con transferencia de True Tone",
            category: "Pantallas",
            brand: "TecnoPartes",
            quantity: 2,
            minimumStock: 2,
            unitPrice: 120,
            trackStock: true,
            status: "disponible",
            createdAt: "2026-10-10T10:00:00Z",
        },
        {
            id: 6,
            sku: "INV-006",
            name: "Batería MacBook Air 13\" M2",
            description: "Celdas originales A2681 52.6Wh",
            category: "Baterías",
            brand: "Apple OEM",
            quantity: 4,
            minimumStock: 2,
            unitPrice: 110,
            trackStock: true,
            status: "disponible",
            createdAt: "2026-10-08T10:00:00Z",
        },
        {
            id: 5,
            sku: "INV-005",
            name: "Batería iPhone 14 Pro",
            description: "Batería de alta capacidad con flex BMS",
            category: "Baterías",
            brand: "CellParts",
            quantity: 1,
            minimumStock: 3,
            unitPrice: 55,
            trackStock: true,
            status: "disponible",
            createdAt: "2026-10-05T10:00:00Z",
        },
        {
            id: 4,
            sku: "INV-004",
            name: "Flex de carga iPad Air USB-C",
            description: "Conector USB-C de reemplazo soldable",
            category: "Otros",
            brand: "CellParts",
            quantity: 0,
            minimumStock: 2,
            unitPrice: 18,
            trackStock: true,
            status: "agotado",
            createdAt: "2026-10-01T10:00:00Z",
        },
        {
            id: 3,
            sku: "INV-003",
            name: "Cargador MagSafe 3 USB-C 70W",
            description: "Adaptador + cable trenzado MagSafe 3",
            category: "Cargadores",
            brand: "Apple OEM",
            quantity: 9,
            minimumStock: 3,
            unitPrice: 75,
            trackStock: true,
            status: "disponible",
            createdAt: "2026-09-20T10:00:00Z",
        },
        {
            id: 2,
            sku: "INV-002",
            name: "Asesoría técnica especializada",
            description: "Consultoría de configuración, migración o recuperación iCloud",
            category: "Servicios",
            brand: "iSpot Lab",
            quantity: 0,
            minimumStock: 0,
            unitPrice: 20,
            trackStock: false,
            status: "disponible",
            createdAt: "2026-09-15T10:00:00Z",
        },
        {
            id: 1,
            sku: "INV-001",
            name: "Diagnóstico electrónico en placa lógica",
            description: "Medición térmica, trazado de líneas e inspección microscópica",
            category: "Servicios",
            brand: "iSpot Lab",
            quantity: 0,
            minimumStock: 0,
            unitPrice: 25,
            trackStock: false,
            status: "disponible",
            createdAt: "2026-09-10T10:00:00Z",
        },
    ],
    orders: [
        {
            id: 6,
            orderNumber: "OS-1042",
            clientId: 6,
            assignedTechnician: 2,
            receivedBy: 4,
            status: "Recibido",
            priority: "normal",
            reportedProblem: "El equipo no enciende ni muestra luz en el conector MagSafe al conectarlo a la corriente.",
            diagnosis: "Pendiente de revisión en banco. Consumo inicial en fuente USB-C: 5V / 0.02A.",
            discountPercent: 0,
            receivedAt: "2026-11-18T14:20:00Z",
            updatedAt: "2026-11-18T15:20:00Z",
            equipment: {
                id: 6,
                deviceType: "MacBook",
                brand: "Apple",
                model: 'MacBook Air 13" - M2 - 2022',
                serialNumber: "C02FK3XLQ6L4",
                color: "Medianoche",
                accessories: "Cargador MagSafe 3 y cable trenzado",
                physicalCondition: "Rayón leve en la esquina inferior derecha, pantalla intacta.",
            },
            history: [
                {
                    id: 1,
                    userId: 2,
                    action: "Informe técnico · Pedro Ramírez",
                    description: "Equipo recibido en recepción. Se verifica número de serie en chasis y se ingresa a cola de diagnóstico.",
                    createdAt: "2026-11-18T15:30:00Z",
                },
            ],
            usedParts: [
                {
                    id: 1,
                    itemType: "service",
                    inventoryItemId: null,
                    code: "SRV-DIAG",
                    name: "Diagnóstico electrónico en placa lógica",
                    quantity: 1,
                    unitPrice: 25,
                    discountPercent: 0,
                },
            ],
        },
        {
            id: 5,
            orderNumber: "OS-1041",
            clientId: 5,
            assignedTechnician: 3,
            receivedBy: 4,
            status: "En reparación",
            priority: "alta",
            reportedProblem: "Caída frontal. La pantalla parpadea en verde y el táctil no responde en la mitad superior.",
            diagnosis: "Panel OLED dañado. Face ID, cámaras y bocinas funcionan correctamente. Salud de batería al 84%.",
            discountPercent: 5,
            receivedAt: "2026-11-17T10:15:00Z",
            updatedAt: "2026-11-18T09:45:00Z",
            equipment: {
                id: 5,
                deviceType: "iPhone",
                brand: "Apple",
                model: "iPhone 13 - 2021",
                serialNumber: "356789104523871",
                color: "Azul medianoche",
                accessories: "Forro de silicona, sin SIM",
                physicalCondition: "Cristal frontal astillado en la parte superior. Marco con golpes leves.",
            },
            history: [
                {
                    id: 2,
                    userId: 3,
                    action: "Informe técnico · José Castillo",
                    description: "Se realiza prueba con pantalla de test: el equipo da imagen normal y el táctil responde al 100%. Face ID operativo.",
                    createdAt: "2026-11-17T11:20:00Z",
                },
                {
                    id: 3,
                    userId: 3,
                    action: "Informe técnico · José Castillo",
                    description: "Cliente aprueba presupuesto. Se retira pantalla dañada, se transfiere IC para conservar True Tone y se instala sello impermeable nuevo.",
                    createdAt: "2026-11-18T09:45:00Z",
                },
            ],
            usedParts: [
                {
                    id: 2,
                    itemType: "inventory",
                    inventoryItemId: 7,
                    code: "INV-007",
                    name: "Pantalla iPhone 13 OLED",
                    quantity: 1,
                    unitPrice: 120,
                    discountPercent: 0,
                },
                {
                    id: 3,
                    itemType: "service",
                    inventoryItemId: null,
                    code: "SRV-MO",
                    name: "Mano de obra instalación de pantalla + programación True Tone",
                    quantity: 1,
                    unitPrice: 40,
                    discountPercent: 10,
                },
            ],
        },
        {
            id: 4,
            orderNumber: "OS-1040",
            clientId: 4,
            assignedTechnician: 5,
            receivedBy: 1,
            status: "Listo",
            priority: "normal",
            reportedProblem: "Se calienta al cargar y la batería dura menos de medio día.",
            diagnosis: "Batería degradada con 710 ciclos (77% de capacidad). Sin cortos en línea VDD_MAIN.",
            discountPercent: 0,
            receivedAt: "2026-11-16T09:00:00Z",
            updatedAt: "2026-11-16T16:30:00Z",
            equipment: {
                id: 4,
                deviceType: "iPhone",
                brand: "Apple",
                model: "iPhone 15 Pro - 2023",
                serialNumber: "353912116789024",
                color: "Titanio natural",
                accessories: "Sin accesorios",
                physicalCondition: "Excelente estado estético, sin rayones visibles.",
            },
            history: [
                {
                    id: 4,
                    userId: 5,
                    action: "Informe técnico · Daniela Rojas",
                    description: "Reemplazo de batería completado. Prueba de carga USB-C a 20W estable y temperatura máxima de 36 °C. Listo para entregar.",
                    createdAt: "2026-11-16T16:30:00Z",
                },
            ],
            usedParts: [
                {
                    id: 4,
                    itemType: "service",
                    inventoryItemId: null,
                    code: "SRV-BAT",
                    name: "Reemplazo de batería iPhone 15 Pro (repuesto incluido)",
                    quantity: 1,
                    unitPrice: 85,
                    discountPercent: 0,
                },
            ],
        },
        {
            id: 3,
            orderNumber: "OS-1039",
            clientId: 3,
            assignedTechnician: 2,
            receivedBy: 4,
            status: "En diagnóstico",
            priority: "normal",
            reportedProblem: "Se apaga repentinamente luego de 20 minutos de uso continuo.",
            diagnosis: "Temperaturas elevadas en SoC M1. Posible obstrucción del sistema de ventilación o pasta térmica seca.",
            discountPercent: 0,
            receivedAt: "2026-11-15T11:30:00Z",
            updatedAt: "2026-11-15T17:10:00Z",
            equipment: {
                id: 3,
                deviceType: "iMac",
                brand: "Apple",
                model: 'iMac 24" - M1 - 2021',
                serialNumber: "C02G81ZHQ6X1",
                color: "Plata",
                accessories: "Fuente de poder con puerto Ethernet",
                physicalCondition: "Buen estado general, polvo acumulado en las rejillas inferiores.",
            },
            history: [
                {
                    id: 5,
                    userId: 2,
                    action: "Informe técnico · Pedro Ramírez",
                    description: "Se desmonta pantalla con kit de corte adhesivo. Ventiladores con obstrucción severa de polvo.",
                    createdAt: "2026-11-15T17:10:00Z",
                },
            ],
            usedParts: [],
        },
        {
            id: 2,
            orderNumber: "OS-1038",
            clientId: 2,
            assignedTechnician: 3,
            receivedBy: 4,
            status: "Entregado",
            priority: "normal",
            reportedProblem: "El cable USB-C queda flojo y solo carga haciendo presión hacia un lado.",
            diagnosis: "Pines del puerto USB-C desgastados. Requiere reemplazo de flex de carga.",
            discountPercent: 0,
            receivedAt: "2026-11-12T10:00:00Z",
            updatedAt: "2026-11-12T17:40:00Z",
            deliveredAt: "2026-11-13T11:00:00Z",
            equipment: {
                id: 2,
                deviceType: "iPad",
                brand: "Apple",
                model: "iPad Air 5ª gen - M1 - 2022",
                serialNumber: "DMPXK2Q4LMR1",
                color: "Blanco estelar",
                accessories: "Cable USB-C",
                physicalCondition: "Sin golpes.",
            },
            history: [
                {
                    id: 6,
                    userId: 3,
                    action: "Informe técnico · José Castillo",
                    description: "Flex USB-C reemplazado y probado en ambos sentidos. Equipo entregado a conformidad.",
                    createdAt: "2026-11-12T17:40:00Z",
                },
            ],
            usedParts: [
                {
                    id: 5,
                    itemType: "inventory",
                    inventoryItemId: 4,
                    code: "INV-004",
                    name: "Flex de carga iPad Air USB-C",
                    quantity: 1,
                    unitPrice: 18,
                    discountPercent: 0,
                },
                {
                    id: 6,
                    itemType: "service",
                    inventoryItemId: null,
                    code: "SRV-MO",
                    name: "Mano de obra microsoldadura / reemplazo de puerto",
                    quantity: 1,
                    unitPrice: 35,
                    discountPercent: 0,
                },
            ],
        },
        {
            id: 1,
            orderNumber: "OS-1037",
            clientId: 5,
            assignedTechnician: null,
            receivedBy: 4,
            status: "Recibido",
            priority: "baja",
            reportedProblem: "",
            diagnosis: "",
            discountPercent: 0,
            receivedAt: "2026-11-10T09:15:00Z",
            updatedAt: "2026-11-10T09:15:00Z",
            equipment: {
                id: 1,
                deviceType: "Apple Watch",
                brand: "Apple",
                model: "Apple Watch Series 9 - 2023",
                serialNumber: "358120093345671",
                color: "Medianoche",
                accessories: "Solo cápsula (sin correas)",
                physicalCondition: "Rayones superficiales en el cristal.",
            },
            history: [],
            usedParts: [],
        },
    ],
});

const readDemoDb = () => {
    try {
        const raw = sessionStorage.getItem(DEMO_DB_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore storage errors
    }
    const fresh = createInitialDemoDb();
    writeDemoDb(fresh);
    return fresh;
};

const writeDemoDb = (db) => {
    try {
        sessionStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
    } catch {
        // ignore storage errors
    }
};

const emitDemoChange = () => {
    window.dispatchEvent(new CustomEvent(DEMO_SESSION_EVENT));
};

const writeSessionUser = (roleKey) => {
    const profile = DEMO_ROLES[roleKey] ?? DEMO_ROLES.administrador;
    localStorage.setItem(DEMO_MODE_KEY, "true");
    localStorage.setItem("id", String(profile.id));
    localStorage.setItem("role", profile.role);
    localStorage.setItem("name", profile.name);
    localStorage.setItem("auth_user", JSON.stringify(profile));
};

export const isDemoMode = () => localStorage.getItem(DEMO_MODE_KEY) === "true";

// launch interactive portfolio demo with fictional data
export const startDemoSession = (role = "administrador") => {
    if (!sessionStorage.getItem(DEMO_DB_KEY)) {
        writeDemoDb(createInitialDemoDb());
    }
    writeSessionUser(role);
    emitDemoChange();
};

// switch active role inside demo mode to preview role restrictions live
export const switchDemoRole = (role) => {
    if (!isDemoMode()) return;
    writeSessionUser(role);
    emitDemoChange();
};

// restore fictional dataset to its initial state
export const resetDemoData = () => {
    writeDemoDb(createInitialDemoDb());
    emitDemoChange();
};

// exit demo mode and remove demo markers
export const exitDemoSession = () => {
    localStorage.removeItem(DEMO_MODE_KEY);
    sessionStorage.removeItem(DEMO_DB_KEY);
};

export const DEMO_ROLE_OPTIONS = Object.values(DEMO_ROLES);

const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

// hydrate normalized order with nested client, technician, history and billing totals
const hydrateOrder = (db, order) => {
    const client = db.clients.find((c) => Number(c.id) === Number(order.clientId)) ?? null;
    const assignedTechnicianUser = order.assignedTechnician
        ? db.users.find((u) => Number(u.id) === Number(order.assignedTechnician)) ?? null
        : null;
    const receivedByUser = order.receivedBy
        ? db.users.find((u) => Number(u.id) === Number(order.receivedBy)) ?? null
        : null;

    const history = (order.history ?? []).map((entry) => ({
        ...entry,
        user: entry.userId ? db.users.find((u) => Number(u.id) === Number(entry.userId)) ?? null : null,
    }));

    const usedParts = (order.usedParts ?? []).map((part) => ({
        ...part,
        inventoryItem: part.inventoryItemId
            ? db.inventory.find((inv) => Number(inv.id) === Number(part.inventoryItemId)) ?? null
            : null,
    }));

    const totals = calculateOrderTotals({
        discountPercent: Number(order.discountPercent) || 0,
        items: usedParts.map((part) => ({
            quantity: Number(part.quantity) || 1,
            unitPrice: Number(part.unitPrice) || 0,
            discountPercent: Number(part.discountPercent) || 0,
        })),
    });

    return {
        ...order,
        client,
        assignedTechnicianUser,
        receivedByUser,
        history,
        usedParts,
        estimatedCost: Number(totals.grossSubtotal.toFixed(2)),
        finalCost: Number(totals.total.toFixed(2)),
    };
};

// hydrate customer with associated service orders
const hydrateClient = (db, client) => {
    const clientOrders = db.orders
        .filter((o) => Number(o.clientId) === Number(client.id))
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((o) => hydrateOrder(db, o));
    return {
        ...client,
        serviceOrders: clientOrders,
        ordersCount: clientOrders.length,
    };
};

const findOrderIndex = (db, identifier) => {
    const raw = String(identifier ?? "").trim();
    return db.orders.findIndex(
        (o) => String(o.id) === raw || String(o.orderNumber).toLowerCase() === raw.toLowerCase()
    );
};

// resolve technician id from id or full name in demo users
const resolveDemoTechnicianId = (db, value) => {
    if (!value || value === "Sin asignar") return null;
    if (/^\d+$/.test(String(value))) {
        const matched = db.users.find((u) => Number(u.id) === Number(value));
        return matched ? matched.id : null;
    }
    const target = String(value).trim().toLowerCase();
    const matched = db.users.find((u) => {
        const fullName = `${u.name ?? ""} ${u.lastName && u.lastName !== "-" ? u.lastName : ""}`
            .trim()
            .toLowerCase();
        return fullName === target || String(u.name ?? "").trim().toLowerCase() === target;
    });
    return matched ? matched.id : null;
};

// handle simulated backend requests against sessionStorage demo database
export const demoApiRequest = async (endpoint, { method = "GET", body } = {}) => {
    await sleep();

    const [pathPart, queryPart = ""] = endpoint.split("?");
    const path = pathPart.replace(/\/+$/, "") || "/";
    const params = new URLSearchParams(queryPart);
    const upperMethod = String(method).toUpperCase();
    const db = readDemoDb();

    // dashboard summary
    if (path === "/dashboard/summary" && upperMethod === "GET") {
        const lowStockCount = db.inventory.filter(
            (item) => item.trackStock !== false && Number(item.quantity) <= Number(item.minimumStock)
        ).length;
        return {
            success: true,
            count: {
                orders: db.orders.length,
                customers: db.clients.length,
                inventory: lowStockCount,
            },
        };
    }

    // users collection
    if (path === "/users") {
        if (upperMethod === "GET") {
            let list = [...db.users].sort((a, b) => Number(b.id) - Number(a.id));
            const role = params.get("role");
            const status = params.get("status");
            if (role && role !== "all") {
                list = list.filter((u) => u.role === role);
            }
            if (status && status !== "all") {
                list = list.filter((u) => u.status === status);
            }
            return { success: true, data: list };
        }
        if (upperMethod === "POST") {
            const email = String(body?.email ?? "").trim().toLowerCase();
            if (db.users.some((u) => u.email.toLowerCase() === email)) {
                throw new Error("Ya existe un usuario con ese correo electrónico.");
            }
            const created = {
                id: db.nextIds.user++,
                name: String(body?.name ?? "").trim() || "Usuario",
                lastName: String(body?.lastName ?? "-").trim() || "-",
                username: String(body?.username ?? `user${Date.now().toString().slice(-3)}`).trim(),
                email,
                role: body?.role === "vendedor" ? "recepción" : (body?.role || "recepción"),
                status: body?.status || "activo",
                createdAt: new Date().toISOString(),
            };
            db.users.unshift(created);
            writeDemoDb(db);
            return { success: true, data: created };
        }
    }

    // single user
    const userMatch = path.match(/^\/users\/([^/]+)$/);
    if (userMatch) {
        const id = Number(userMatch[1]);
        const idx = db.users.findIndex((u) => Number(u.id) === id);
        if (idx === -1) throw new Error("Usuario no encontrado.");

        if (upperMethod === "GET") {
            return { success: true, data: db.users[idx] };
        }
        if (upperMethod === "PUT") {
            const updated = {
                ...db.users[idx],
                ...body,
                id: db.users[idx].id,
            };
            delete updated.password;
            db.users[idx] = updated;
            writeDemoDb(db);
            return { success: true, data: updated };
        }
        if (upperMethod === "DELETE") {
            const hasOrders = db.orders.some(
                (o) => Number(o.assignedTechnician) === id || Number(o.receivedBy) === id
            );
            if (hasOrders) {
                throw new Error(
                    "No se puede eliminar porque tiene órdenes asociadas (puedes cambiar su estado a Inactivo)."
                );
            }
            db.users.splice(idx, 1);
            writeDemoDb(db);
            return { success: true };
        }
    }

    // clients collection
    if (path === "/clients") {
        if (upperMethod === "GET") {
            const list = [...db.clients]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map((client) => hydrateClient(db, client));
            return { success: true, data: list };
        }
        if (upperMethod === "POST") {
            const created = {
                id: db.nextIds.client++,
                name: String(body?.name ?? "").trim(),
                lastName: String(body?.lastName ?? "-").trim() || "-",
                identityDocument: String(body?.identityDocument ?? "").trim(),
                email: String(body?.email ?? "").trim().toLowerCase(),
                phone: String(body?.phone ?? "").trim(),
                address: body?.address ? String(body.address).trim() : "",
                createdAt: new Date().toISOString(),
            };
            db.clients.unshift(created);
            writeDemoDb(db);
            return { success: true, data: hydrateClient(db, created) };
        }
    }

    // single client
    const clientMatch = path.match(/^\/clients\/([^/]+)$/);
    if (clientMatch) {
        const id = Number(clientMatch[1]);
        const idx = db.clients.findIndex((c) => Number(c.id) === id);
        if (idx === -1) throw new Error("Cliente no encontrado.");

        if (upperMethod === "GET") {
            return { success: true, data: hydrateClient(db, db.clients[idx]) };
        }
        if (upperMethod === "PUT") {
            const updated = {
                ...db.clients[idx],
                ...body,
                id: db.clients[idx].id,
            };
            db.clients[idx] = updated;
            writeDemoDb(db);
            return { success: true, data: hydrateClient(db, updated) };
        }
        if (upperMethod === "DELETE") {
            db.orders = db.orders.filter((o) => Number(o.clientId) !== id);
            db.clients.splice(idx, 1);
            writeDemoDb(db);
            return { success: true };
        }
    }

    // equipment models catalog
    if (path === "/equipment/models") {
        if (upperMethod === "GET") {
            const deviceType = params.get("deviceType");
            let list = [...db.deviceModels];
            if (deviceType) {
                list = list.filter((m) => m.deviceType === deviceType);
            }
            list.sort((a, b) =>
                a.deviceType.localeCompare(b.deviceType) || a.name.localeCompare(b.name)
            );
            return { success: true, data: list };
        }
        if (upperMethod === "POST") {
            const deviceType = String(body?.deviceType ?? "").trim();
            const name = String(body?.name ?? "").trim();
            if (!deviceType || !name) {
                throw new Error("Tipo de equipo y nombre del modelo son requeridos.");
            }
            const existing = db.deviceModels.find(
                (m) =>
                    m.deviceType === deviceType &&
                    m.name.toLowerCase() === name.toLowerCase()
            );
            if (existing) {
                return { success: true, data: existing };
            }
            const created = {
                id: db.nextIds.model++,
                deviceType,
                name,
                createdAt: new Date().toISOString(),
            };
            db.deviceModels.push(created);
            writeDemoDb(db);
            return { success: true, data: created };
        }
    }

    const modelMatch = path.match(/^\/equipment\/models\/([^/]+)$/);
    if (modelMatch && upperMethod === "DELETE") {
        const id = Number(modelMatch[1]);
        db.deviceModels = db.deviceModels.filter((m) => Number(m.id) !== id);
        writeDemoDb(db);
        return { success: true };
    }

    // inventory collection
    if (path === "/inventory") {
        if (upperMethod === "GET") {
            const list = [...db.inventory].sort((a, b) => Number(b.id) - Number(a.id));
            return { success: true, data: list };
        }
        if (upperMethod === "POST") {
            const trackStock = body?.trackStock !== false;
            const maxNum = db.inventory.reduce((max, item) => {
                const match = String(item.sku ?? "").match(/^INV-(\d+)$/i);
                return match ? Math.max(max, Number(match[1])) : max;
            }, 0);
            const sku = `INV-${String(maxNum + 1).padStart(3, "0")}`;
            const quantity = trackStock ? Math.max(0, Number(body?.quantity) || 0) : 0;
            const created = {
                id: db.nextIds.inventory++,
                sku,
                name: String(body?.name ?? "").trim(),
                description: body?.description ?? null,
                category: String(body?.category ?? "Otros").trim(),
                brand: String(body?.brand ?? "General").trim() || "General",
                trackStock,
                quantity,
                minimumStock: trackStock ? Math.max(0, Number(body?.minimumStock) || 0) : 0,
                unitPrice: Math.max(0, Number(body?.unitPrice) || 0),
                status: !trackStock || quantity > 0 ? "disponible" : "agotado",
                createdAt: new Date().toISOString(),
            };
            db.inventory.unshift(created);
            writeDemoDb(db);
            return { success: true, data: created };
        }
    }

    const invStockMatch = path.match(/^\/inventory\/([^/]+)\/stock$/);
    if (invStockMatch && upperMethod === "PATCH") {
        const id = Number(invStockMatch[1]);
        const idx = db.inventory.findIndex((i) => Number(i.id) === id);
        if (idx === -1) throw new Error("Producto no encontrado.");
        const current = db.inventory[idx];
        const nextQty =
            body?.quantity !== undefined
                ? Math.max(0, Number(body.quantity) || 0)
                : Math.max(0, Number(current.quantity) + (Number(body?.delta) || 0));
        const updated = {
            ...current,
            quantity: nextQty,
            status: current.trackStock === false || nextQty > 0 ? "disponible" : "agotado",
        };
        db.inventory[idx] = updated;
        writeDemoDb(db);
        return { success: true, data: updated };
    }

    const invMatch = path.match(/^\/inventory\/([^/]+)$/);
    if (invMatch) {
        const id = Number(invMatch[1]);
        const idx = db.inventory.findIndex((i) => Number(i.id) === id);
        if (idx === -1) throw new Error("Producto no encontrado.");

        if (upperMethod === "GET") {
            return { success: true, data: db.inventory[idx] };
        }
        if (upperMethod === "PUT") {
            const trackStock =
                body?.trackStock !== undefined
                    ? body.trackStock !== false
                    : db.inventory[idx].trackStock !== false;
            const quantity = trackStock
                ? Math.max(0, Number(body?.quantity ?? db.inventory[idx].quantity) || 0)
                : 0;
            const minimumStock = trackStock
                ? Math.max(0, Number(body?.minimumStock ?? db.inventory[idx].minimumStock) || 0)
                : 0;
            const updated = {
                ...db.inventory[idx],
                ...body,
                id: db.inventory[idx].id,
                trackStock,
                quantity,
                minimumStock,
                status: !trackStock || quantity > 0 ? "disponible" : "agotado",
            };
            db.inventory[idx] = updated;
            writeDemoDb(db);
            return { success: true, data: updated };
        }
        if (upperMethod === "DELETE") {
            db.inventory.splice(idx, 1);
            writeDemoDb(db);
            return { success: true };
        }
    }

    // service orders collection
    if (path === "/service-orders") {
        if (upperMethod === "GET") {
            let list = [...db.orders].sort((a, b) => Number(b.id) - Number(a.id));
            const clientId = params.get("clientId");
            const status = params.get("status");
            const orderNumber = params.get("orderNumber");
            const limit = Number(params.get("limit"));

            if (clientId) {
                list = list.filter((o) => Number(o.clientId) === Number(clientId));
            }
            if (status) {
                list = list.filter((o) => o.status === status);
            }
            if (orderNumber) {
                const needle = orderNumber.toLowerCase();
                list = list.filter((o) => o.orderNumber.toLowerCase().includes(needle));
            }
            if (Number.isFinite(limit) && limit > 0) {
                list = list.slice(0, limit);
            }

            return {
                success: true,
                data: list.map((o) => hydrateOrder(db, o)),
            };
        }

        if (upperMethod === "POST") {
            const orderId = db.nextIds.order++;
            const orderNumber = `OS-${db.nextIds.orderNumber++}`;
            const technicianId = resolveDemoTechnicianId(
                db,
                body?.technicianId ?? body?.assignedTechnician ?? body?.technician
            );
            const created = {
                id: orderId,
                orderNumber,
                clientId: Number(body?.customerId ?? body?.clientId),
                assignedTechnician: technicianId,
                receivedBy: Number(body?.receivedBy) || 1,
                status: "Recibido",
                priority: "normal",
                reportedProblem: body?.reportedProblem ?? "",
                diagnosis: "",
                discountPercent: 0,
                receivedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                equipment: {
                    id: db.nextIds.equipment++,
                    deviceType: body?.deviceType || "iPhone",
                    brand: "Apple",
                    model: body?.device || body?.model || "Apple Device",
                    serialNumber: String(body?.serialNumber ?? body?.serial ?? "")
                        .trim()
                        .toUpperCase(),
                    color: body?.color ?? "",
                    accessories: body?.accessories ?? "",
                    physicalCondition: body?.physicalCondition ?? "",
                },
                history: [],
                usedParts: [],
            };
            db.orders.unshift(created);
            writeDemoDb(db);
            return { success: true, data: hydrateOrder(db, created) };
        }
    }

    // service order nested mutations
    const statusMatch = path.match(/^\/service-orders\/([^/]+)\/status$/);
    if (statusMatch && upperMethod === "PATCH") {
        const idx = findOrderIndex(db, statusMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        db.orders[idx] = {
            ...db.orders[idx],
            status: body?.status || db.orders[idx].status,
            updatedAt: new Date().toISOString(),
        };
        writeDemoDb(db);
        return { success: true, data: hydrateOrder(db, db.orders[idx]) };
    }

    const equipMatch = path.match(/^\/service-orders\/([^/]+)\/equipment$/);
    if (equipMatch && upperMethod === "PUT") {
        const idx = findOrderIndex(db, equipMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        const current = db.orders[idx];
        const technicianId = resolveDemoTechnicianId(
            db,
            body?.technicianId !== undefined
                ? body.technicianId
                : (body?.assignedTechnician ?? body?.technician)
        );
        db.orders[idx] = {
            ...current,
            clientId: Number(body?.clientId ?? body?.customerId ?? current.clientId),
            assignedTechnician: technicianId,
            updatedAt: new Date().toISOString(),
            equipment: {
                ...current.equipment,
                deviceType: body?.deviceType ?? current.equipment.deviceType,
                model: body?.model ?? body?.device ?? current.equipment.model,
                serialNumber: String(
                    body?.serialNumber ?? body?.serial ?? current.equipment.serialNumber
                )
                    .trim()
                    .toUpperCase(),
                color: body?.color ?? current.equipment.color,
                accessories: body?.accessories ?? current.equipment.accessories,
                physicalCondition:
                    body?.physicalCondition ?? current.equipment.physicalCondition,
            },
        };
        writeDemoDb(db);
        return { success: true, data: hydrateOrder(db, db.orders[idx]) };
    }

    const diagMatch = path.match(/^\/service-orders\/([^/]+)\/diagnosis$/);
    if (diagMatch && upperMethod === "PATCH") {
        const idx = findOrderIndex(db, diagMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        db.orders[idx] = {
            ...db.orders[idx],
            reportedProblem: body?.reportedProblem ?? db.orders[idx].reportedProblem,
            diagnosis: body?.diagnosis ?? db.orders[idx].diagnosis,
            updatedAt: new Date().toISOString(),
        };
        writeDemoDb(db);
        return { success: true, data: hydrateOrder(db, db.orders[idx]) };
    }

    const reportCreateMatch = path.match(/^\/service-orders\/([^/]+)\/reports$/);
    if (reportCreateMatch && upperMethod === "POST") {
        const idx = findOrderIndex(db, reportCreateMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        const author = String(body?.author ?? "Técnico").trim();
        const created = {
            id: db.nextIds.report++,
            userId: Number(body?.userId) || Number(localStorage.getItem("id")) || 1,
            action: `Informe técnico · ${author}`,
            description: String(body?.note ?? "").trim(),
            createdAt: new Date().toISOString(),
        };
        db.orders[idx].history = [created, ...(db.orders[idx].history ?? [])];
        db.orders[idx].updatedAt = new Date().toISOString();
        writeDemoDb(db);
        return { success: true, data: created };
    }

    const reportDeleteMatch = path.match(/^\/service-orders\/([^/]+)\/reports\/([^/]+)$/);
    if (reportDeleteMatch && upperMethod === "DELETE") {
        const idx = findOrderIndex(db, reportDeleteMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        const reportId = String(reportDeleteMatch[2]);
        db.orders[idx].history = (db.orders[idx].history ?? []).filter(
            (r) => String(r.id) !== reportId
        );
        writeDemoDb(db);
        return { success: true };
    }

    const itemAddMatch = path.match(/^\/service-orders\/([^/]+)\/items$/);
    if (itemAddMatch && upperMethod === "POST") {
        const idx = findOrderIndex(db, itemAddMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        const order = db.orders[idx];
        const itemType = body?.type === "service" ? "service" : "inventory";
        const quantity = Math.max(1, Number(body?.quantity) || 1);

        if (itemType === "inventory" && body?.inventoryItemId) {
            const invIdx = db.inventory.findIndex(
                (i) => Number(i.id) === Number(body.inventoryItemId)
            );
            if (invIdx === -1) throw new Error("Repuesto no encontrado.");
            const inv = db.inventory[invIdx];

            if (inv.trackStock !== false) {
                if (Number(inv.quantity) < quantity) {
                    throw new Error("Stock insuficiente en inventario.");
                }
                const nextQty = Number(inv.quantity) - quantity;
                db.inventory[invIdx] = {
                    ...inv,
                    quantity: nextQty,
                    status: nextQty > 0 ? "disponible" : "agotado",
                };
            }

            const existingPart = (order.usedParts ?? []).find(
                (p) =>
                    p.itemType === "inventory" &&
                    Number(p.inventoryItemId) === Number(inv.id)
            );
            if (existingPart) {
                existingPart.quantity = Number(existingPart.quantity) + quantity;
            } else {
                order.usedParts = [
                    ...(order.usedParts ?? []),
                    {
                        id: db.nextIds.usedPart++,
                        itemType: "inventory",
                        inventoryItemId: inv.id,
                        code: inv.sku || `INV-${inv.id}`,
                        name: inv.name,
                        quantity,
                        unitPrice: Number(body?.unitPrice ?? inv.unitPrice) || 0,
                        discountPercent: Math.min(100, Math.max(0, Number(body?.discountPercent) || 0)),
                    },
                ];
            }
        } else {
            order.usedParts = [
                ...(order.usedParts ?? []),
                {
                    id: db.nextIds.usedPart++,
                    itemType: "service",
                    inventoryItemId: null,
                    code: body?.code || "SERVICIO",
                    name: String(body?.name ?? "Servicio técnico").trim(),
                    quantity,
                    unitPrice: Math.max(0, Number(body?.unitPrice) || 0),
                    discountPercent: Math.min(100, Math.max(0, Number(body?.discountPercent) || 0)),
                },
            ];
        }

        order.updatedAt = new Date().toISOString();
        writeDemoDb(db);
        return { success: true, data: hydrateOrder(db, order) };
    }

    const itemUpdateMatch = path.match(/^\/service-orders\/([^/]+)\/items\/([^/]+)$/);
    if (itemUpdateMatch) {
        const idx = findOrderIndex(db, itemUpdateMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        const order = db.orders[idx];
        const itemId = String(itemUpdateMatch[2]);
        const partIdx = (order.usedParts ?? []).findIndex((p) => String(p.id) === itemId);
        if (partIdx === -1) throw new Error("Ítem no encontrado.");
        const part = order.usedParts[partIdx];

        if (upperMethod === "PATCH") {
            if (body?.quantity !== undefined && part.inventoryItemId) {
                const nextQty = Math.max(1, Number(body.quantity) || 1);
                const delta = nextQty - Number(part.quantity);
                const invIdx = db.inventory.findIndex(
                    (i) => Number(i.id) === Number(part.inventoryItemId)
                );
                if (invIdx !== -1 && db.inventory[invIdx].trackStock !== false && delta !== 0) {
                    const inv = db.inventory[invIdx];
                    if (delta > 0 && Number(inv.quantity) < delta) {
                        throw new Error("Stock insuficiente en inventario.");
                    }
                    const nextStock = Math.max(0, Number(inv.quantity) - delta);
                    db.inventory[invIdx] = {
                        ...inv,
                        quantity: nextStock,
                        status: nextStock > 0 ? "disponible" : "agotado",
                    };
                }
            }

            order.usedParts[partIdx] = {
                ...part,
                quantity:
                    body?.quantity !== undefined
                        ? Math.max(1, Number(body.quantity) || 1)
                        : part.quantity,
                unitPrice:
                    body?.unitPrice !== undefined
                        ? Math.max(0, Number(body.unitPrice) || 0)
                        : part.unitPrice,
                discountPercent:
                    body?.discountPercent !== undefined
                        ? Math.min(100, Math.max(0, Number(body.discountPercent) || 0))
                        : part.discountPercent,
            };
            order.updatedAt = new Date().toISOString();
            writeDemoDb(db);
            return { success: true, data: hydrateOrder(db, order) };
        }

        if (upperMethod === "DELETE") {
            if (part.inventoryItemId) {
                const invIdx = db.inventory.findIndex(
                    (i) => Number(i.id) === Number(part.inventoryItemId)
                );
                if (invIdx !== -1 && db.inventory[invIdx].trackStock !== false) {
                    const nextStock = Number(db.inventory[invIdx].quantity) + Number(part.quantity);
                    db.inventory[invIdx] = {
                        ...db.inventory[invIdx],
                        quantity: nextStock,
                        status: nextStock > 0 ? "disponible" : "agotado",
                    };
                }
            }
            order.usedParts.splice(partIdx, 1);
            order.updatedAt = new Date().toISOString();
            writeDemoDb(db);
            return { success: true, data: hydrateOrder(db, order) };
        }
    }

    const billingMatch = path.match(/^\/service-orders\/([^/]+)\/billing$/);
    if (billingMatch && upperMethod === "PATCH") {
        const idx = findOrderIndex(db, billingMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");
        db.orders[idx] = {
            ...db.orders[idx],
            discountPercent: Math.min(100, Math.max(0, Number(body?.discountPercent) || 0)),
            updatedAt: new Date().toISOString(),
        };
        writeDemoDb(db);
        return { success: true, data: hydrateOrder(db, db.orders[idx]) };
    }

    // single service order
    const orderMatch = path.match(/^\/service-orders\/([^/]+)$/);
    if (orderMatch) {
        const idx = findOrderIndex(db, orderMatch[1]);
        if (idx === -1) throw new Error("Orden no encontrada.");

        if (upperMethod === "GET") {
            return { success: true, data: hydrateOrder(db, db.orders[idx]) };
        }
        if (upperMethod === "PUT") {
            db.orders[idx] = {
                ...db.orders[idx],
                ...body,
                id: db.orders[idx].id,
                updatedAt: new Date().toISOString(),
            };
            writeDemoDb(db);
            return { success: true, data: hydrateOrder(db, db.orders[idx]) };
        }
        if (upperMethod === "DELETE") {
            db.orders.splice(idx, 1);
            writeDemoDb(db);
            return { success: true };
        }
    }

    return { success: true, data: null };
};
