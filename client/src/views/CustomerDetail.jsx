import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    DollarSign,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import { customers as initialCustomers } from "@/data/customers";
import {
    calculateOrderTotals,
    ORDER_STATUSES,
    ORDER_STATUS_STYLES,
    orders as initialOrders,
} from "@/data/orders";

const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status })),
];

const CustomerDetail = () => {
    const { customerId } = useParams();
    const location = useLocation();

    // TODO [BACKEND - GET /api/clients/:id]:
    // En `server/routes/clientRoutes.js`, `GET /api/clients/:id` ya incluye `serviceOrders` y `equipment`.
    // Reemplazar estos datos locales cargando el cliente y su historial desde `customers.service.js`.
    const [customer, setCustomer] = useState(
        () => initialCustomers.find((c) => c.id === customerId) ?? location.state?.customer ?? null
    );
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const customerOrders = useMemo(
        () =>
            initialOrders.filter(
                (order) => order.customerId === customer?.id || order.customer === customer?.name
            ),
        [customer?.id, customer?.name]
    );

    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        return customerOrders.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const matchesSearch =
                !term ||
                [order.id, order.device, order.deviceType, order.serial, order.technician].some(
                    (value) => value?.toLowerCase().includes(term)
                );
            return matchesStatus && matchesSearch;
        });
    }, [customerOrders, search, statusFilter]);

    const stats = useMemo(() => {
        const active = customerOrders.filter((o) => o.status !== "Entregado").length;
        const completed = customerOrders.filter((o) => o.status === "Entregado" || o.status === "Listo").length;
        const totalBilled = customerOrders.reduce(
            (sum, o) => sum + calculateOrderTotals(o.billing).total,
            0
        );
        return {
            total: customerOrders.length,
            active,
            completed,
            totalBilled,
        };
    }, [customerOrders]);

    if (!customer) {
        return (
            <DashboardLayout>
                <Card className="shadow-xs">
                    <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                        <p className="text-lg font-semibold">
                            No se encontró el cliente &ldquo;{customerId}&rdquo;
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Verifica el código del cliente o regresa al listado general.
                        </p>
                        <Button variant="outline" nativeButton={false} render={<Link to="/customers" />}>
                            <ArrowLeft />
                            Volver a clientes
                        </Button>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Órdenes registradas"
                    value={stats.total}
                    icon={ClipboardList}
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    title="En taller"
                    value={stats.active}
                    hint="Órdenes no entregadas"
                    icon={Wrench}
                    color="bg-amber-500/10 text-amber-600"
                />
                <StatCard
                    title="Completadas"
                    value={stats.completed}
                    hint="Listas o entregadas"
                    icon={CheckCircle2}
                    color="bg-emerald-500/10 text-emerald-600"
                />
                <StatCard
                    title="Total facturado"
                    value={formatCurrency(stats.totalBilled)}
                    icon={DollarSign}
                    color="bg-violet-500/10 text-violet-600"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                {/* Ficha lateral de contacto del cliente */}
                <div>
                    <Card className="shadow-xs">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                    {getInitials(customer.name)}
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="truncate text-base font-semibold">
                                        {customer.name}
                                    </CardTitle>
                                    <CardDescription>{customer.id}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm">
                            <dl className="grid gap-3">
                                <div className="space-y-0.5">
                                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <CreditCard className="size-3.5" />
                                        Cédula / RIF
                                    </dt>
                                    <dd className="font-medium">{customer.document}</dd>
                                </div>

                                <div className="space-y-0.5">
                                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone className="size-3.5" />
                                        Teléfono
                                    </dt>
                                    <dd className="font-medium">
                                        <a
                                            href={`tel:${customer.phone}`}
                                            className="hover:underline"
                                        >
                                            {customer.phone || "—"}
                                        </a>
                                    </dd>
                                </div>

                                <div className="space-y-0.5">
                                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="size-3.5" />
                                        Correo electrónico
                                    </dt>
                                    <dd className="truncate font-medium">
                                        {customer.email ? (
                                            <a
                                                href={`mailto:${customer.email}`}
                                                className="hover:underline"
                                            >
                                                {customer.email}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </dd>
                                </div>

                                <div className="space-y-0.5">
                                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        Dirección
                                    </dt>
                                    <dd className="text-foreground/90">{customer.address || "—"}</dd>
                                </div>
                            </dl>

                            <Separator />

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    Cliente desde
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatDate(customer.createdAt)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Historial de órdenes de servicio asociadas al cliente */}
                <Card className="shadow-xs">
                    <CardHeader>
                        <DataToolbar
                            title="Historial de órdenes de servicio"
                            description={`${filteredOrders.length} de ${customerOrders.length} órdenes asociadas a este cliente`}
                            search={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Buscar orden, equipo o serial..."
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
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Técnico</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Ingreso</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-24 text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 && (
                                    <EmptyTableRow
                                        colSpan={7}
                                        message="Este cliente aún no tiene órdenes de servicio registradas."
                                    />
                                )}
                                {filteredOrders.map((order) => {
                                    const orderTotal = calculateOrderTotals(order.billing).total;
                                    return (
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
                                            <TableCell>
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    state={{ order }}
                                                    className="font-medium hover:underline"
                                                >
                                                    {order.device}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.deviceType} ·{" "}
                                                    <span className="font-mono">{order.serial}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {order.technician}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={ORDER_STATUS_STYLES[order.status]}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(order.receivedAt)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatCurrency(orderTotal)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            to={`/orders/${order.id}`}
                                                            state={{ order }}
                                                        />
                                                    }
                                                >
                                                    Ver orden
                                                    <ArrowRight />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CustomerDetail;
