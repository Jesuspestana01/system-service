// TODO: datos de prueba. Reemplazar por la API cuando el backend esté listo.

export const PRODUCT_CATEGORIES = ["Pantallas", "Baterías", "Cargadores", "Almacenamiento", "Memorias RAM", "Accesorios", "Otros"];

export const products = [
    { id: "INV-008", name: "Pantalla iPhone 13 OLED", category: "Pantallas", stock: 3, minStock: 2, price: 120, supplier: "TecnoPartes" },
    { id: "INV-007", name: "Batería Samsung Galaxy S22", category: "Baterías", stock: 1, minStock: 3, price: 35, supplier: "CellParts" },
    { id: "INV-006", name: "Cargador USB-C 65W", category: "Cargadores", stock: 12, minStock: 5, price: 25, supplier: "TecnoPartes" },
    { id: "INV-005", name: "SSD Kingston 480GB", category: "Almacenamiento", stock: 8, minStock: 4, price: 38, supplier: "CompuMayor" },
    { id: "INV-004", name: "Memoria RAM DDR4 8GB", category: "Memorias RAM", stock: 0, minStock: 4, price: 22, supplier: "CompuMayor" },
    { id: "INV-003", name: "Pasta térmica Arctic MX-4", category: "Accesorios", stock: 15, minStock: 5, price: 8, supplier: "CompuMayor" },
    { id: "INV-002", name: "Puerto de carga iPad Air", category: "Otros", stock: 2, minStock: 2, price: 18, supplier: "CellParts" },
    { id: "INV-001", name: "Batería HP Pavilion 15", category: "Baterías", stock: 4, minStock: 2, price: 55, supplier: "TecnoPartes" },
];

// "ok" | "low" | "out"
export const getStockStatus = (product) => {
    if (product.stock <= 0) return "out";
    if (product.stock <= product.minStock) return "low";
    return "ok";
};
