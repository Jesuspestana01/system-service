import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Eye, Inbox, Plus, RefreshCw, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { RowActions } from "@/components/dashboard/RowActions";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { formatDate } from "@/lib/format";
import { getRolePermissions } from "@/lib/permissions";
import { ORDER_STATUSES, ORDER_STATUS_STYLES } from "@/data/orders";
import {
    createOrder,
    deleteOrder,
    getOrders,
    updateOrderEquipment,
    updateOrderStatus,
} from "@/services/orders.service";
import { createCustomer, getCustomers } from "@/services/customers.service";

// status filter options for toolbar select
const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status })),
];

const Orders = () => {
    const navigate = useNavigate();
    // seller role cannot delete orders; admin and technician have full access
    const { canDelete } = getRolePermissions();

    // orders, customers and ui state
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [formState, setFormState] = useState({ open: false, item: null });
    const [itemToDelete, setItemToDelete] = useState(null);

    // fetch orders and customers on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [ordersResult, customersResult] = await Promise.allSettled([
                    getOrders(),
                    getCustomers(),
                ]);
                if (ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)) {
                    setOrders(ordersResult.value);
                }
                if (customersResult.status === "fulfilled" && Array.isArray(customersResult.value)) {
                    setCustomers(customersResult.value);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // filter orders by search term and selected status
    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const matchesSearch =
                !term ||
                [order.id, order.customer, order.device, order.serial].some((value) =>
                    String(value ?? "").toLowerCase().includes(term)
                );
            return matchesStatus && matchesSearch;
        });
    }, [orders, search, statusFilter]);

    // compute summary counters by order status
    const stats = useMemo(() => {
        const countBy = (...statuses) => orders.filter((o) => statuses.includes(o.status)).length;
        return {
            total: orders.length,
            received: countBy("Recibido"),
            inProgress: countBy("En diagnóstico", "En reparación"),
            ready: countBy("Listo"),
        };
    }, [orders]);

    // open modal to create a new order
    const openCreate = () => setFormState({ open: true, item: null });

    // open modal to edit an existing order
    const openEdit = (order) => setFormState({ open: true, item: order });

    // create or update order in api
    const handleSave = async (data) => {
        if (formState.item) {
            const targetId = formState.item.dbId ?? formState.item.id;
            const updated = await updateOrderEquipment(targetId, {
                ...formState.item,
                ...data,
            });
            if (updated) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === formState.item.id ? updated : o))
                );
            }
            setFormState({ open: false, item: null });
            return;
        }

        const created = await createOrder(data);
        if (created) {
            setOrders((prev) => [created, ...prev]);
            setFormState({ open: false, item: null });
            navigate(`/orders/${created.id}`, { state: { order: created } });
        }
    };

    // update order status from row actions menu
    const handleStatusChange = async (order, status) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, status } : o))
        );
        try {
            const updated = await updateOrderStatus(order.dbId ?? order.id, status);
            if (updated) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === order.id ? updated : o))
                );
            }
        } catch (error) {
            console.error("failed to update status:", error);
        }
    };

    // delete order from api and remove from state
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const target = itemToDelete;
        setItemToDelete(null);
        try {
            await deleteOrder(target.dbId ?? target.id);
            setOrders((prev) => prev.filter((o) => o.id !== target.id));
        } catch (error) {
            console.error("failed to delete order:", error);
        }
    };

    // create a customer from order modal and append to state
    const handleCreateCustomer = async (data) => {
        const newCustomer = await createCustomer(data);
        if (newCustomer) {
            setCustomers((prev) => [newCustomer, ...prev]);
        }
        return newCustomer;
    };

    return (
        <DashboardLayout>
            {/* page title and create order button */}
            <PageHeader
                title="Órdenes de servicio"
                description="Gestiona los equipos ingresados y el avance de cada reparación."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        Nueva orden
                    </Button>
                }
            />

            {/* status counter cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de órdenes" value={stats.total} icon={ClipboardList} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Recibidas" value={stats.received} hint="Pendientes por revisar" icon={Inbox} color="bg-sky-500/10 text-sky-600" />
                <StatCard title="En proceso" value={stats.inProgress} hint="Diagnóstico o reparación" icon={Wrench} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Listas para entregar" value={stats.ready} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-600" />
            </div>

            {/* orders table card */}
            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de órdenes"
                        description={`${filteredOrders.length} de ${orders.length} órdenes`}
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Buscar orden, cliente o equipo..."
                    >
                        <SimpleSelect
                            options={statusFilterOptions}
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            className="sm:w-44"
                        />
                    </DataToolbar>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Orden</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Ingreso</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* skeleton rows while loading */}
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-6 rounded-md" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <EmptyTableRow colSpan={7} />
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="animate-in fade-in duration-300">
                                        <TableCell className="font-medium">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                state={{ order }}
                                                className="text-primary underline-offset-4 hover:underline"
                                            >
                                                {order.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/orders/${order.id}`}
                                                state={{ order }}
                                                className="font-medium hover:underline"
                                            >
                                                {order.device}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">
                                                {order.deviceType} · <span className="font-mono">{order.serial}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{order.technician}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={ORDER_STATUS_STYLES[order.status]}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(order.receivedAt)}</TableCell>
                                        <TableCell>
                                            <RowActions
                                                onEdit={() => openEdit(order)}
                                                onDelete={canDelete ? () => setItemToDelete(order) : undefined}
                                            >
                                                <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`, { state: { order } })}>
                                                    <Eye />
                                                    Ver detalle de la orden
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <RefreshCw />
                                                        Cambiar estado
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup
                                                            value={order.status}
                                                            onValueChange={(status) => handleStatusChange(order, status)}
                                                        >
                                                            {ORDER_STATUSES.map((status) => (
                                                                <DropdownMenuRadioItem key={status} value={status} closeOnClick>
                                                                    {status}
                                                                </DropdownMenuRadioItem>
                                                            ))}
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            </RowActions>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* create or edit order modal */}
            <OrderFormDialog
                open={formState.open}
                onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
                order={formState.item}
                customers={customers}
                onCreateCustomer={handleCreateCustomer}
                onSubmit={handleSave}
            />

            {/* delete confirmation dialog (admin and technician only) */}
            {canDelete && (
                <ConfirmDeleteDialog
                    open={Boolean(itemToDelete)}
                    onOpenChange={(open) => !open && setItemToDelete(null)}
                    title={`¿Eliminar la orden ${itemToDelete?.id ?? ""}?`}
                    description="Se eliminará la orden y su historial. Esta acción no se puede deshacer."
                    onConfirm={handleConfirmDelete}
                />
            )}
        </DashboardLayout>
    );
};

export default Orders;
