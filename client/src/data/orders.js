// TODO [BACKEND - ServiceOrder / Equipment / ServiceHistory / UsedPart]:
// Datos de prueba. Reemplazar por la capa de servicios en `src/services/orders.service.js`.
//
// Correspondencia con los modelos del servidor (`server/models/`):
// - Orden: `ServiceOrder` (orderNumber, clientId, equipmentId, assignedTechnician, reportedProblem,
//   diagnosis, solution, status, estimatedCost, finalCost, receivedAt, deliveredAt)
// - Equipo: `Equipment` (deviceType, brand="Apple", model, serialNumber, color, accessories,
//   physicalCondition, observations)
// - Informes del técnico: `ServiceHistory` (serviceOrderId, userId, action, description, createdAt)
// - Cargos / repuestos: `UsedPart` (serviceOrderId, inventoryItemId, quantity, unitPrice)
//
// ⚠️ Discrepancias entre la UI y los modelos actuales del backend que debes contemplar al crear los endpoints:
// 1. `ServiceOrder.reportedProblem` tiene `allowNull: false` en Sequelize, pero al crear la orden desde el modal
//    solo se pide cliente, equipo, serial y técnico. El backend debe permitir `null`/`""` al crear o asignar
//    un valor por defecto ("Pendiente de diagnóstico inicial") hasta que se llene en la vista de detalle.
// 2. Estados: el modelo Sequelize define `ENUM('recibido', 'en revisión', 'en reparación', 'pendiente', 'resuelto', 'entregado', 'cancelado')`.
//    Conviene unificar ese ENUM con `ORDER_STATUSES` o mapearlo en el servicio.
// 3. Cobros (`billing.items` y `billing.discountPercent`): `UsedPart` hoy solo referencia `inventoryItemId` (no nulo)
//    y no guarda descuentos ni cargos por mano de obra/servicios personalizados. Para soportar esta vista, en el
//    backend conviene: (a) permitir `inventoryItemId: null` + campos `description`, `itemType` ('part'|'service') y
//    `discountPercent` en `UsedPart` (o crear tabla `order_Charges`), y (b) agregar `discountPercent` a `ServiceOrder`.

export const ORDER_STATUSES = ["Recibido", "En diagnóstico", "En reparación", "Listo", "Entregado"];

// Estado con el que se crea toda orden nueva
export const DEFAULT_ORDER_STATUS = "Recibido";

export const ORDER_STATUS_STYLES = {
    "Recibido": "border-blue-200 bg-blue-50 text-blue-700",
    "En diagnóstico": "border-violet-200 bg-violet-50 text-violet-700",
    "En reparación": "border-amber-200 bg-amber-50 text-amber-700",
    "Listo": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Entregado": "border-zinc-200 bg-zinc-100 text-zinc-600",
};

// TODO [BACKEND - GET /api/users?role=técnico]: cargar técnicos activos desde la tabla `users`
export const TECHNICIANS = ["Sin asignar", "Pedro Ramírez", "José Castillo", "Daniela Rojas"];

export const orders = [
    {
        id: "OS-1042",
        customerId: "CL-006",
        customer: "María González",
        deviceType: "MacBook",
        device: 'MacBook Air 13" - M2 - 2022',
        serial: "C02FK3XLQ6L4",
        color: "Medianoche",
        accessories: "Cargador MagSafe 3 y cable trenzado",
        physicalCondition: "Rayón leve en la esquina inferior derecha, pantalla intacta.",
        technician: "Pedro Ramírez",
        status: "Recibido",
        receivedAt: "2026-11-05",
        initialDiagnosis: {
            reportedProblem: "El equipo no enciende ni muestra luz en el conector MagSafe al conectarlo a la corriente.",
            diagnosis: "Pendiente de revisión en banco. Consumo inicial en fuente USB-C: 5V / 0.02A.",
            updatedAt: "2026-11-05T15:20:00",
        },
        reports: [
            {
                id: "REP-1",
                author: "Pedro Ramírez",
                createdAt: "2026-11-05T15:30:00",
                note: "Equipo recibido en recepción. Se verifica número de serie en chasis y se ingresa a cola de diagnóstico.",
            },
        ],
        billing: {
            discountPercent: 0,
            items: [
                {
                    id: "ITEM-1",
                    type: "service",
                    inventoryItemId: null,
                    code: "SRV-DIAG",
                    name: "Diagnóstico electrónico en placa lógica",
                    quantity: 1,
                    unitPrice: 25,
                    discountPercent: 0,
                },
            ],
        },
    },
    {
        id: "OS-1041",
        customerId: "CL-005",
        customer: "Carlos Pérez",
        deviceType: "iPhone",
        device: "iPhone 13 - 2021",
        serial: "356789104523871",
        color: "Azul medianoche",
        accessories: "Forro de silicona, sin SIM",
        physicalCondition: "Cristal frontal astillado en la parte superior. Marco con golpes leves.",
        technician: "José Castillo",
        status: "En reparación",
        receivedAt: "2026-11-04",
        initialDiagnosis: {
            reportedProblem: "Caída frontal. La pantalla parpadea en verde y el táctil no responde en la mitad superior.",
            diagnosis: "Panel OLED dañado. Face ID, cámaras y bocinas funcionan correctamente. Salud de batería al 84%.",
            updatedAt: "2026-11-04T11:15:00",
        },
        reports: [
            {
                id: "REP-201",
                author: "José Castillo",
                createdAt: "2026-11-04T11:20:00",
                note: "Se realiza prueba con pantalla de test: el equipo da imagen normal y el táctil responde al 100%. Face ID operativo.",
            },
            {
                id: "REP-202",
                author: "José Castillo",
                createdAt: "2026-11-05T09:45:00",
                note: "Cliente aprueba presupuesto. Se retira pantalla dañada, se transfiere IC para conservar True Tone y se instala sello impermeable nuevo.",
            },
        ],
        billing: {
            discountPercent: 5,
            items: [
                {
                    id: "ITEM-201",
                    type: "inventory",
                    inventoryItemId: "INV-008",
                    code: "INV-008",
                    name: "Pantalla iPhone 13 OLED",
                    quantity: 1,
                    unitPrice: 120,
                    discountPercent: 0,
                },
                {
                    id: "ITEM-202",
                    type: "service",
                    inventoryItemId: null,
                    code: "SRV-MO",
                    name: "Mano de obra instalación de pantalla + programación True Tone",
                    quantity: 1,
                    unitPrice: 40,
                    discountPercent: 10,
                },
            ],
        },
    },
    {
        id: "OS-1040",
        customerId: "CL-004",
        customer: "Ana Rodríguez",
        deviceType: "iPhone",
        device: "iPhone 15 Pro - 2023",
        serial: "353912116789024",
        color: "Titanio natural",
        accessories: "Sin accesorios",
        physicalCondition: "Excelente estado estético, sin rayones visibles.",
        technician: "Daniela Rojas",
        status: "Listo",
        receivedAt: "2026-11-04",
        initialDiagnosis: {
            reportedProblem: "Se calienta al cargar y la batería dura menos de medio día.",
            diagnosis: "Batería degradada con 710 ciclos (77% de capacidad). Sin cortos en línea VDD_MAIN.",
            updatedAt: "2026-11-04T14:00:00",
        },
        reports: [
            {
                id: "REP-301",
                author: "Daniela Rojas",
                createdAt: "2026-11-04T16:30:00",
                note: "Reemplazo de batería completado. Prueba de carga USB-C a 20W estable y temperatura máxima de 36 °C. Listo para entregar.",
            },
        ],
        billing: {
            discountPercent: 0,
            items: [
                {
                    id: "ITEM-301",
                    type: "service",
                    inventoryItemId: null,
                    code: "SRV-BAT",
                    name: "Reemplazo de batería iPhone 15 Pro (repuesto incluido)",
                    quantity: 1,
                    unitPrice: 85,
                    discountPercent: 0,
                },
            ],
        },
    },
    {
        id: "OS-1039",
        customerId: "CL-003",
        customer: "Luis Martínez",
        deviceType: "iMac",
        device: 'iMac 24" - M1 - 2021',
        serial: "C02G81ZHQ6X1",
        color: "Plata",
        accessories: "Fuente de poder con puerto Ethernet",
        physicalCondition: "Buen estado general, polvo acumulado en las rejillas inferiores.",
        technician: "Pedro Ramírez",
        status: "En diagnóstico",
        receivedAt: "2026-11-03",
        initialDiagnosis: {
            reportedProblem: "Se apaga repentinamente luego de 20 minutos de uso continuo.",
            diagnosis: "Temperaturas elevadas en SoC M1. Posible obstrucción del sistema de ventilación o pasta térmica seca.",
            updatedAt: "2026-11-03T17:10:00",
        },
        reports: [
            {
                id: "REP-401",
                author: "Pedro Ramírez",
                createdAt: "2026-11-04T10:00:00",
                note: "Se desmonta pantalla con kit de corte adhesivo. Ventiladores con obstrucción severa de polvo.",
            },
        ],
        billing: {
            discountPercent: 0,
            items: [],
        },
    },
    {
        id: "OS-1038",
        customerId: "CL-002",
        customer: "Sofía Herrera",
        deviceType: "iPad",
        device: "iPad Air 5ª gen - M1 - 2022",
        serial: "DMPXK2Q4LMR1",
        color: "Blanco estelar",
        accessories: "Cable USB-C",
        physicalCondition: "Sin golpes.",
        technician: "José Castillo",
        status: "Entregado",
        receivedAt: "2026-11-02",
        initialDiagnosis: {
            reportedProblem: "El cable USB-C queda flojo y solo carga haciendo presión hacia un lado.",
            diagnosis: "Pines del puerto USB-C desgastados. Requiere reemplazo de flex de carga.",
            updatedAt: "2026-11-02T12:00:00",
        },
        reports: [
            {
                id: "REP-501",
                author: "José Castillo",
                createdAt: "2026-11-02T17:40:00",
                note: "Flex USB-C reemplazado y probado en ambos sentidos. Equipo entregado a conformidad.",
            },
        ],
        billing: {
            discountPercent: 0,
            items: [
                {
                    id: "ITEM-501",
                    type: "inventory",
                    inventoryItemId: "INV-002",
                    code: "INV-002",
                    name: "Puerto de carga iPad Air",
                    quantity: 1,
                    unitPrice: 18,
                    discountPercent: 0,
                },
                {
                    id: "ITEM-502",
                    type: "service",
                    inventoryItemId: null,
                    code: "SRV-MO",
                    name: "Mano de obra microsoldadura / reemplazo de puerto",
                    quantity: 1,
                    unitPrice: 35,
                    discountPercent: 0,
                },
            ],
        },
    },
    {
        id: "OS-1037",
        customerId: "CL-005",
        customer: "Carlos Pérez",
        deviceType: "Apple Watch",
        device: "Apple Watch Series 9 - 2023",
        serial: "358120093345671",
        color: "Medianoche",
        accessories: "Solo cápsula (sin correas)",
        physicalCondition: "Rayones superficiales en el cristal.",
        technician: "Sin asignar",
        status: "Recibido",
        receivedAt: "2026-11-01",
        initialDiagnosis: {
            reportedProblem: "",
            diagnosis: "",
            updatedAt: null,
        },
        reports: [],
        billing: {
            discountPercent: 0,
            items: [],
        },
    },
];

// Estructura base para las órdenes recién creadas desde el modal
export const withOrderDefaults = (order) => ({
    color: "",
    accessories: "",
    physicalCondition: "",
    initialDiagnosis: {
        reportedProblem: "",
        diagnosis: "",
        updatedAt: null,
    },
    reports: [],
    billing: {
        discountPercent: 0,
        items: [],
    },
    ...order,
});

// Cálculo de totales de facturación de una orden
export const calculateOrderTotals = (billing = { discountPercent: 0, items: [] }) => {
    const items = billing.items ?? [];

    const grossSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const lineDiscountTotal = items.reduce((sum, item) => {
        const lineGross = item.quantity * item.unitPrice;
        return sum + lineGross * ((Number(item.discountPercent) || 0) / 100);
    }, 0);

    const netAfterLineDiscounts = grossSubtotal - lineDiscountTotal;
    const globalDiscountPercent = Number(billing.discountPercent) || 0;
    const globalDiscountAmount = netAfterLineDiscounts * (globalDiscountPercent / 100);
    const total = Math.max(0, netAfterLineDiscounts - globalDiscountAmount);

    return {
        grossSubtotal,
        lineDiscountTotal,
        netAfterLineDiscounts,
        globalDiscountPercent,
        globalDiscountAmount,
        total,
    };
};
