import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, DollarSign, Plus, RefreshCw, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
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
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import { orders as initialOrders, ORDER_STATUSES, ORDER_STATUS_STYLES } from "@/data/orders";
import { customers } from "@/data/customers";

const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status })),
];

const customerOptions = customers.map((customer) => customer.name);

const Orders = () => {
    const crud = useCrudState(initialOrders, (items) => nextId(items, "OS", 4));
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
        const active = crud.items.filter((order) => order.status !== "Entregado");
        return {
            total: crud.items.length,
            inProgress: crud.items.filter((o) => ["En diagnóstico", "En reparación"].includes(o.status)).length,
            ready: crud.items.filter((o) => o.status === "Listo").length,
            pendingValue: active.reduce((sum, o) => sum + o.estimatedCost, 0),
        };
    }, [crud.items]);

    const handleSave = (data) => {
        // Al crear, se registra la fecha de ingreso
        crud.save(crud.form.item ? data : { ...data, receivedAt: todayISO() });
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
                <StatCard title="En proceso" value={stats.inProgress} hint="Diagnóstico o reparación" icon={Wrench} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Listas para entregar" value={stats.ready} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Valor pendiente" value={formatCurrency(stats.pendingValue)} hint="Órdenes no entregadas" icon={DollarSign} color="bg-violet-500/10 text-violet-600" />
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
                                <TableHead className="text-right">Costo est.</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 && <EmptyTableRow colSpan={8} />}
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.device}</div>
                                        <div className="max-w-56 truncate text-xs text-muted-foreground" title={order.issue}>
                                            {order.deviceType} · {order.issue}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{order.technician}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={ORDER_STATUS_STYLES[order.status]}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(order.receivedAt)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.estimatedCost)}</TableCell>
                                    <TableCell>
                                        <RowActions onEdit={() => crud.openEdit(order)} onDelete={() => crud.requestDelete(order)}>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <RefreshCw />
                                                    Cambiar estado
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuRadioGroup
                                                        value={order.status}
                                                        onValueChange={(status) => crud.update(order.id, { status })}
                                                    >
                                                        {ORDER_STATUSES.map((status) => (
                                                            <DropdownMenuRadioItem key={status} value={status}>
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
                customerOptions={customerOptions}
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
