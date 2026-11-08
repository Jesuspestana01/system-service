import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderStatusDropdown } from "@/components/orders/OrderStatusDropdown";
import { OrderEquipmentCard } from "@/components/orders/OrderEquipmentCard";
import { OrderDiagnosisCard } from "@/components/orders/OrderDiagnosisCard";
import { OrderReportsCard } from "@/components/orders/OrderReportsCard";
import { OrderBillingCard } from "@/components/orders/OrderBillingCard";
import { nextId } from "@/hooks/useCrudState";
import { nowISO, todayISO } from "@/lib/format";
import { orders as initialOrders, withOrderDefaults } from "@/data/orders";
import { customers as initialCustomers } from "@/data/customers";
import { products as initialProducts } from "@/data/inventory";

/**
 * Vista individual de una orden de servicio (`/orders/:orderId`).
 * Reúne:
 * 1. Diagnóstico inicial al recibir el equipo (`OrderDiagnosisCard`).
 * 2. Informes del técnico a medida que lo revisa (`OrderReportsCard`).
 * 3. Cobros con repuestos del inventario, creación de productos/servicios y descuentos (`OrderBillingCard`).
 * 4. Edición del equipo ingresado si hubo una equivocación (`OrderEquipmentCard` + `OrderFormDialog`).
 * 5. Botón desplegable para cambiar el estado de servicio (`OrderStatusDropdown`).
 */
const OrderDetail = () => {
    const { orderId } = useParams();
    const location = useLocation();

    // TODO [BACKEND - GET /api/orders/:id, GET /api/clients, GET /api/inventory]:
    // Reemplazar este estado local por un `useEffect` que cargue `getOrderById(orderId)`,
    // `getCustomers()` y `getProducts()` desde `src/services/`.
    // Mientras no hay backend, si vienes de crear una orden en `Orders.jsx`, también se lee `location.state?.order`.
    const [order, setOrder] = useState(() => {
        const found = initialOrders.find((o) => o.id === orderId) ?? location.state?.order;
        return found ? withOrderDefaults(found) : null;
    });
    const [customers, setCustomers] = useState(initialCustomers);
    const [products, setProducts] = useState(initialProducts);
    const [editEquipmentOpen, setEditEquipmentOpen] = useState(false);

    if (!order) {
        return (
            <DashboardLayout>
                <Card className="shadow-xs">
                    <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                        <p className="text-lg font-semibold">No se encontró la orden &ldquo;{orderId}&rdquo;</p>
                        <p className="text-sm text-muted-foreground">
                            Verifica el código de la orden o regresa al listado general.
                        </p>
                        <Button variant="outline" nativeButton={false} render={<Link to="/orders" />}>
                            <ArrowLeft />
                            Volver a órdenes
                        </Button>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    const customer = customers.find((c) => c.id === order.customerId);

    // 5. Cambiar estado de la orden
    const handleStatusChange = (status) => {
        // TODO [BACKEND - PATCH /api/orders/:id/status]:
        // await updateOrderStatus(order.id, status);
        setOrder((prev) => ({ ...prev, status }));
    };

    // 4. Editar equipo ingresado
    const handleUpdateEquipment = (data) => {
        // TODO [BACKEND - PUT /api/orders/:id/equipment]:
        // await updateOrderEquipment(order.id, data);
        setOrder((prev) => ({ ...prev, ...data }));
        setEditEquipmentOpen(false);
    };

    const handleCreateCustomer = (data) => {
        // TODO [BACKEND - POST /api/clients]:
        // const newCustomer = await createCustomer(data);
        const newCustomer = {
            ...data,
            id: nextId(customers, "CL"),
            ordersCount: 1,
            createdAt: todayISO(),
        };
        setCustomers((prev) => [newCustomer, ...prev]);
        return newCustomer;
    };

    // 1. Guardar diagnóstico inicial
    const handleSaveDiagnosis = ({ reportedProblem, diagnosis }) => {
        // TODO [BACKEND - PATCH /api/orders/:id/diagnosis]:
        // await updateOrderDiagnosis(order.id, { reportedProblem, diagnosis });
        setOrder((prev) => ({
            ...prev,
            initialDiagnosis: {
                reportedProblem,
                diagnosis,
                updatedAt: nowISO(),
            },
        }));
    };

    // 2. Agregar / eliminar informe del técnico
    const handleAddReport = ({ author, note }) => {
        // TODO [BACKEND - POST /api/orders/:id/reports]:
        // const created = await addOrderReport(order.id, { description: note });
        const newReport = {
            id: `REP-${Date.now()}`,
            author,
            createdAt: nowISO(),
            note,
        };
        setOrder((prev) => ({
            ...prev,
            reports: [newReport, ...prev.reports],
        }));
    };

    const handleDeleteReport = (reportId) => {
        // TODO [BACKEND - DELETE /api/orders/:id/reports/:reportId]:
        // await deleteOrderReport(order.id, reportId);
        setOrder((prev) => ({
            ...prev,
            reports: prev.reports.filter((r) => r.id !== reportId),
        }));
    };

    // 3. Cobros, repuestos del inventario y descuentos
    const handleAddBillingItem = (item) => {
        // TODO [BACKEND - POST /api/orders/:id/items]:
        // await addOrderBillingItem(order.id, item);
        setOrder((prev) => {
            const existing =
                item.type === "inventory" &&
                prev.billing.items.find((i) => i.inventoryItemId === item.inventoryItemId);

            const items = existing
                ? prev.billing.items.map((i) =>
                      i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
                  )
                : [...prev.billing.items, { ...item, id: `ITEM-${Date.now()}` }];

            return {
                ...prev,
                billing: { ...prev.billing, items },
            };
        });

        // Descontar del stock local cuando es un repuesto del inventario
        if (item.type === "inventory" && item.inventoryItemId) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === item.inventoryItemId
                        ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
                        : p
                )
            );
        }
    };

    const handleUpdateBillingItem = (itemId, changes) => {
        // TODO [BACKEND - PATCH /api/orders/:id/items/:itemId]:
        // await updateOrderBillingItem(order.id, itemId, changes);
        setOrder((prev) => ({
            ...prev,
            billing: {
                ...prev.billing,
                items: prev.billing.items.map((item) =>
                    item.id === itemId ? { ...item, ...changes } : item
                ),
            },
        }));
    };

    const handleRemoveBillingItem = (itemId) => {
        // TODO [BACKEND - DELETE /api/orders/:id/items/:itemId]:
        // await removeOrderBillingItem(order.id, itemId);
        const removed = order.billing.items.find((i) => i.id === itemId);
        if (removed?.type === "inventory" && removed.inventoryItemId) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === removed.inventoryItemId
                        ? { ...p, stock: p.stock + removed.quantity }
                        : p
                )
            );
        }

        setOrder((prev) => ({
            ...prev,
            billing: {
                ...prev.billing,
                items: prev.billing.items.filter((item) => item.id !== itemId),
            },
        }));
    };

    const handleGlobalDiscountChange = (discountPercent) => {
        // TODO [BACKEND - PATCH /api/orders/:id/billing]:
        // await updateOrderBillingDiscount(order.id, discountPercent);
        setOrder((prev) => ({
            ...prev,
            billing: { ...prev.billing, discountPercent },
        }));
    };

    const handleCreateInventoryProduct = (productData) => {
        // TODO [BACKEND - POST /api/inventory]:
        // const created = await createProduct(productData);
        const created = {
            ...productData,
            id: nextId(products, "INV"),
        };
        setProducts((prev) => [created, ...prev]);
        return created;
    };

    return (
        <DashboardLayout>
            <PageHeader
                backTo="/orders"
                backLabel="Volver a órdenes"
                title={`Orden ${order.id}`}
                description={`${order.device} · ${order.customer}`}
                actions={
                    <>
                        {/* 4. Botón rápido para editar el equipo si hubo alguna equivocación */}
                        <Button variant="outline" onClick={() => setEditEquipmentOpen(true)}>
                            <Pencil />
                            Editar equipo
                        </Button>
                        {/* 5. Botón de estado de servicio */}
                        <OrderStatusDropdown status={order.status} onStatusChange={handleStatusChange} />
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                {/* Columna lateral: equipo ingresado y cliente */}
                <div className="space-y-6">
                    <OrderEquipmentCard
                        order={order}
                        customer={customer}
                        onEditEquipment={() => setEditEquipmentOpen(true)}
                    />
                </div>

                {/* Columna principal: diagnóstico inicial, informes del técnico y cobros */}
                <div className="space-y-6">
                    <OrderDiagnosisCard
                        key={order.id}
                        initialDiagnosis={order.initialDiagnosis}
                        onSave={handleSaveDiagnosis}
                    />

                    <OrderReportsCard
                        reports={order.reports}
                        defaultTechnician={order.technician}
                        onAddReport={handleAddReport}
                        onDeleteReport={handleDeleteReport}
                    />

                    <OrderBillingCard
                        billing={order.billing}
                        products={products}
                        onAddItem={handleAddBillingItem}
                        onUpdateItem={handleUpdateBillingItem}
                        onRemoveItem={handleRemoveBillingItem}
                        onDiscountChange={handleGlobalDiscountChange}
                        onCreateInventoryProduct={handleCreateInventoryProduct}
                    />
                </div>
            </div>

            <OrderFormDialog
                open={editEquipmentOpen}
                onOpenChange={setEditEquipmentOpen}
                order={order}
                customers={customers}
                onCreateCustomer={handleCreateCustomer}
                onSubmit={handleUpdateEquipment}
            />
        </DashboardLayout>
    );
};

export default OrderDetail;
