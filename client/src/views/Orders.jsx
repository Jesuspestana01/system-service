import { useMemo, useState } from "react";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { RowActions } from "@/components/dashboard/RowActions";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { useCrudState, nextId } from "@/hooks/useCrudState";
import { formatDate, todayISO } from "@/lib/format";
import {
    orders as initialOrders,
    DEFAULT_ORDER_STATUS,
    ORDER_STATUSES,
    ORDER_STATUS_STYLES,
    withOrderDefaults,
} from "@/data/orders";
import { customers as initialCustomers } from "@/data/customers";

const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status })),
];

const Orders = () => {
    const navigate = useNavigate();
    // TODO [BACKEND - GET /api/orders y GET /api/clients]:
    // Cargar `getOrders()` y `getCustomers()` desde `src/services/` al montar el componente.
    const crud = useCrudState(initialOrders, (items) => nextId(items, "OS", 4));
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        return crud.items.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const matchesSearch =
                !term ||
                [order.id, order.customer, order.device, order.serial].some((value) =>
                    value?.toLowerCase().includes(term)
                );
            return matchesStatus && matchesSearch;
        });
    }, [crud.items, search, statusFilter]);

    const stats = useMemo(() => {
        const countBy = (...statuses) => crud.items.filter((o) => statuses.includes(o.status)).length;
        return {
            total: crud.items.length,
            received: countBy("Recibido"),
            inProgress: countBy("En diagnóstico", "En reparación"),
            ready: countBy("Listo"),
        };
    }, [crud.items]);

    const handleSave = (data) => {
        if (crud.form.item) {
            // TODO [BACKEND - PUT /api/orders/:id/equipment]: llamar a `updateOrderEquipment(crud.form.item.id, data)`
            crud.save(data);
            return;
        }
        // TODO [BACKEND - POST /api/orders]:
        // const created = await createOrder(data);
        // Al crear una orden nueva, entra como "Recibido" y navegamos a su vista individual
        const created = crud.save(
            withOrderDefaults({
                ...data,
                status: DEFAULT_ORDER_STATUS,
                receivedAt: todayISO(),
            })
        );
        navigate(`/orders/${created.id}`, { state: { order: created } });
    };

    // Crea un cliente desde el modal de la orden y lo devuelve para seleccionarlo
    const handleCreateCustomer = (data) => {
        // TODO [BACKEND - POST /api/clients]: llamar a `createCustomer(data)` en `src/services/customers.service.js`
        const newCustomer = {
            ...data,
            id: nextId(customers, "CL"),
            ordersCount: 0,
            createdAt: todayISO(),
        };
        setCustomers((prev) => [newCustomer, ...prev]);
        return newCustomer;
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Órdenes de servicio"
                description="Gestiona los equipos ingresados y el avance de cada reparación."
                actions={
                    <Button onClick={crud.openCreate}>
                        <Plus />
                        Nueva orden
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de órdenes" value={stats.total} icon={ClipboardList} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Recibidas" value={stats.received} hint="Pendientes por revisar" icon={Inbox} color="bg-sky-500/10 text-sky-600" />
                <StatCard title="En proceso" value={stats.inProgress} hint="Diagnóstico o reparación" icon={Wrench} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Listas para entregar" value={stats.ready} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-600" />
            </div>

            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de órdenes"
                        description={`${filteredOrders.length} de ${crud.items.length} órdenes`}
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
                            {filteredOrders.length === 0 && <EmptyTableRow colSpan={7} />}
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
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
                                        <RowActions onEdit={() => crud.openEdit(order)} onDelete={() => crud.requestDelete(order)}>
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
                                                    {/* TODO [BACKEND - PATCH /api/orders/:id/status]: llamar a `updateOrderStatus(order.id, status)` */}
                                                    <DropdownMenuRadioGroup
                                                        value={order.status}
                                                        onValueChange={(status) => crud.update(order.id, { status })}
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <OrderFormDialog
                open={crud.form.open}
                onOpenChange={crud.setFormOpen}
                order={crud.form.item}
                customers={customers}
                onCreateCustomer={handleCreateCustomer}
                onSubmit={handleSave}
            />

            <ConfirmDeleteDialog
                open={Boolean(crud.itemToDelete)}
                onOpenChange={(open) => !open && crud.cancelDelete()}
                title={`¿Eliminar la orden ${crud.itemToDelete?.id ?? ""}?`}
                description="Se eliminará la orden y su historial. Esta acción no se puede deshacer."
                onConfirm={crud.confirmDelete}
            />
        </DashboardLayout>
    );
};

export default Orders;
