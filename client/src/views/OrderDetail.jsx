import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderStatusDropdown } from "@/components/orders/OrderStatusDropdown";
import { OrderEquipmentCard } from "@/components/orders/OrderEquipmentCard";
import { OrderDiagnosisCard } from "@/components/orders/OrderDiagnosisCard";
import { OrderReportsCard } from "@/components/orders/OrderReportsCard";
import { OrderBillingCard } from "@/components/orders/OrderBillingCard";
import { nowISO } from "@/lib/format";
import { getRolePermissions } from "@/lib/permissions";
import { withOrderDefaults } from "@/data/orders";
import {
    addOrderBillingItem,
    addOrderReport,
    deleteOrderReport,
    getOrderById,
    mapOrderFromApi,
    removeOrderBillingItem,
    updateOrderBillingDiscount,
    updateOrderBillingItem,
    updateOrderDiagnosis,
    updateOrderEquipment,
    updateOrderStatus,
} from "@/services/orders.service";
import {
    createCustomer,
    getCustomers,
    mapCustomerFromApi,
} from "@/services/customers.service";
import { createProduct, getProducts } from "@/services/inventory.service";
import {
    createDeviceModel,
    deleteDeviceModel,
    getDeviceModels,
} from "@/services/equipment.service";

// individual service order detail view (/orders/:orderId)
const OrderDetail = () => {
    const { orderId } = useParams();
    const location = useLocation();
    // role permissions: seller cannot delete items/reports; only admin can create inventory products
    const { canDelete, canManageInventory } = getRolePermissions();

    // initialize order from navigation state if available while fetching fresh data
    const [order, setOrder] = useState(() => {
        const passed = location.state?.order;
        return passed ? withOrderDefaults(mapOrderFromApi(passed)) : null;
    });
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [deviceModels, setDeviceModels] = useState([]);
    const [editEquipmentOpen, setEditEquipmentOpen] = useState(false);

    // load order, customers, inventory products and device models from api
    useEffect(() => {
        let active = true;
        const loadDetail = async () => {
            setLoading(true);
            try {
                const [orderRes, customersRes, productsRes, modelsRes] = await Promise.allSettled([
                    getOrderById(orderId),
                    getCustomers(),
                    getProducts(),
                    getDeviceModels(),
                ]);

                if (!active) return;

                if (orderRes.status === "fulfilled" && orderRes.value) {
                    setOrder(withOrderDefaults(orderRes.value));
                }
                if (customersRes.status === "fulfilled" && Array.isArray(customersRes.value)) {
                    setCustomers(customersRes.value);
                }
                if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
                    setProducts(productsRes.value);
                }
                if (modelsRes.status === "fulfilled" && Array.isArray(modelsRes.value)) {
                    setDeviceModels(modelsRes.value);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDetail();
        return () => {
            active = false;
        };
    }, [orderId]);

    // not found state when order does not exist after loading
    if (!loading && !order) {
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

    const targetOrderId = order?.dbId ?? order?.id ?? orderId;
    const customer =
        customers.find((c) => String(c.id) === String(order?.customerId)) ??
        (order?.client ? mapCustomerFromApi(order.client) : null);

    // update order status in api
    const handleStatusChange = async (status) => {
        setOrder((prev) => ({ ...prev, status }));
        try {
            const updated = await updateOrderStatus(targetOrderId, status);
            if (updated) setOrder(withOrderDefaults(updated));
        } catch (error) {
            console.error("failed to update order status:", error);
        }
    };

    // update equipment and customer assignment in api
    const handleUpdateEquipment = async (data) => {
        try {
            const updated = await updateOrderEquipment(targetOrderId, {
                ...order,
                ...data,
            });
            if (updated) {
                setOrder(withOrderDefaults(updated));
            } else {
                setOrder((prev) => ({ ...prev, ...data }));
            }
            setEditEquipmentOpen(false);
        } catch (error) {
            console.error("failed to update equipment:", error);
        }
    };

    // create a new customer in api from equipment edit dialog
    const handleCreateCustomer = async (data) => {
        const newCustomer = await createCustomer(data);
        if (newCustomer) {
            setCustomers((prev) => [newCustomer, ...prev]);
        }
        return newCustomer;
    };

    // create a new equipment model in api from equipment edit dialog
    const handleCreateDeviceModel = async (payload) => {
        const created = await createDeviceModel(payload);
        if (created) {
            setDeviceModels((prev) => {
                const exists = prev.some(
                    (m) =>
                        m.deviceType === created.deviceType &&
                        m.name.toLowerCase() === created.name.toLowerCase()
                );
                return exists ? prev : [...prev, created];
            });
        }
        return created;
    };

    // delete an equipment model from api
    const handleDeleteDeviceModel = async (id) => {
        await deleteDeviceModel(id);
        setDeviceModels((prev) => prev.filter((m) => String(m.id) !== String(id)));
    };

    // save initial diagnosis and reported problem to api
    const handleSaveDiagnosis = async ({ reportedProblem, diagnosis }) => {
        setOrder((prev) => ({
            ...prev,
            initialDiagnosis: {
                reportedProblem,
                diagnosis,
                updatedAt: nowISO(),
            },
        }));
        try {
            const updated = await updateOrderDiagnosis(targetOrderId, {
                reportedProblem,
                diagnosis,
            });
            if (updated) setOrder(withOrderDefaults(updated));
        } catch (error) {
            console.error("failed to save diagnosis:", error);
        }
    };

    // add technician report to service history
    const handleAddReport = async ({ author, note }) => {
        try {
            const created = await addOrderReport(targetOrderId, { author, note });
            setOrder((prev) => ({
                ...prev,
                reports: [created, ...prev.reports],
            }));
        } catch (error) {
            console.error("failed to add report:", error);
        }
    };

    // delete technician report from service history
    const handleDeleteReport = async (reportId) => {
        setOrder((prev) => ({
            ...prev,
            reports: prev.reports.filter((r) => r.id !== reportId),
        }));
        try {
            await deleteOrderReport(targetOrderId, reportId);
        } catch (error) {
            console.error("failed to delete report:", error);
        }
    };

    // add inventory part or custom service to order billing
    const handleAddBillingItem = async (item) => {
        if (item.type === "inventory" && item.inventoryItemId) {
            setProducts((prev) =>
                prev.map((p) =>
                    String(p.id) === String(item.inventoryItemId)
                        ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
                        : p
                )
            );
        }

        try {
            const updated = await addOrderBillingItem(targetOrderId, item);
            if (updated) {
                setOrder(withOrderDefaults(updated));
                return;
            }
        } catch (error) {
            console.error("failed to add billing item:", error);
        }

        // local state update fallback
        setOrder((prev) => {
            const existing =
                item.type === "inventory" &&
                prev.billing.items.find(
                    (i) => String(i.inventoryItemId) === String(item.inventoryItemId)
                );

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
    };

    // update billing line quantity, unitPrice or discountPercent
    const handleUpdateBillingItem = async (itemId, changes) => {
        setOrder((prev) => ({
            ...prev,
            billing: {
                ...prev.billing,
                items: prev.billing.items.map((item) =>
                    item.id === itemId ? { ...item, ...changes } : item
                ),
            },
        }));

        try {
            const updated = await updateOrderBillingItem(targetOrderId, itemId, changes);
            if (updated) setOrder(withOrderDefaults(updated));
        } catch (error) {
            console.error("failed to update billing item:", error);
        }
    };

    // remove billing line and restore product stock if applicable
    const handleRemoveBillingItem = async (itemId) => {
        const removed = order.billing.items.find((i) => i.id === itemId);
        if (removed?.type === "inventory" && removed.inventoryItemId) {
            setProducts((prev) =>
                prev.map((p) =>
                    String(p.id) === String(removed.inventoryItemId)
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

        try {
            const updated = await removeOrderBillingItem(targetOrderId, itemId);
            if (updated) setOrder(withOrderDefaults(updated));
        } catch (error) {
            console.error("failed to remove billing item:", error);
        }
    };

    // update global order discount percent
    const handleGlobalDiscountChange = async (discountPercent) => {
        setOrder((prev) => ({
            ...prev,
            billing: { ...prev.billing, discountPercent },
        }));

        try {
            await updateOrderBillingDiscount(targetOrderId, discountPercent);
        } catch (error) {
            console.error("failed to update global discount:", error);
        }
    };

    // create new product in inventory from billing card
    const handleCreateInventoryProduct = async (productData) => {
        const created = await createProduct(productData);
        if (created) {
            setProducts((prev) => [created, ...prev]);
        }
        return created;
    };

    return (
        <DashboardLayout>
            {/* header with equipment edit button and status dropdown */}
            <PageHeader
                backTo="/orders"
                backLabel="Volver a órdenes"
                title={`Orden ${order?.id ?? orderId}`}
                description={
                    loading ? (
                        <Skeleton className="mt-1 h-4 w-48 rounded-md" />
                    ) : (
                        <span className="animate-in fade-in duration-500">
                            {order.device} · {order.customer}
                        </span>
                    )
                }
                actions={
                    loading ? (
                        <>
                            <Skeleton className="h-9 w-32 rounded-md" />
                            <Skeleton className="h-9 w-36 rounded-md" />
                        </>
                    ) : (
                        <div className="animate-in fade-in duration-500 flex items-center gap-2">
                            <Button variant="outline" onClick={() => setEditEquipmentOpen(true)}>
                                <Pencil />
                                Editar equipo
                            </Button>
                            <OrderStatusDropdown status={order.status} onStatusChange={handleStatusChange} />
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                {/* left column: equipment and customer summary */}
                <div className="space-y-6">
                    <OrderEquipmentCard
                        order={order}
                        customer={customer}
                        loading={loading}
                        onEditEquipment={() => setEditEquipmentOpen(true)}
                    />
                </div>

                {/* right column: diagnosis, technician reports and billing */}
                <div className="space-y-6">
                    <OrderDiagnosisCard
                        initialDiagnosis={order?.initialDiagnosis}
                        loading={loading}
                        onSave={handleSaveDiagnosis}
                    />

                    <OrderReportsCard
                        reports={order?.reports ?? []}
                        defaultTechnician={order?.technician}
                        loading={loading}
                        onAddReport={handleAddReport}
                        onDeleteReport={canDelete ? handleDeleteReport : undefined}
                    />

                    <OrderBillingCard
                        billing={order?.billing}
                        products={products}
                        loading={loading}
                        onAddItem={handleAddBillingItem}
                        onUpdateItem={handleUpdateBillingItem}
                        onRemoveItem={canDelete ? handleRemoveBillingItem : undefined}
                        onDiscountChange={handleGlobalDiscountChange}
                        onCreateInventoryProduct={canManageInventory ? handleCreateInventoryProduct : undefined}
                    />
                </div>
            </div>

            {/* modal to edit order equipment and customer */}
            {order && (
                <OrderFormDialog
                    open={editEquipmentOpen}
                    onOpenChange={setEditEquipmentOpen}
                    order={order}
                    customers={customers}
                    deviceModels={deviceModels}
                    onCreateCustomer={handleCreateCustomer}
                    onCreateDeviceModel={handleCreateDeviceModel}
                    onDeleteDeviceModel={canDelete ? handleDeleteDeviceModel : undefined}
                    onSubmit={handleUpdateEquipment}
                />
            )}
        </DashboardLayout>
    );
};

export default OrderDetail;
