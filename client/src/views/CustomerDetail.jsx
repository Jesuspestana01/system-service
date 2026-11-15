import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import {
    calculateOrderTotals,
    ORDER_STATUSES,
    ORDER_STATUS_STYLES,
} from "@/data/orders";
import {
    getCustomerById,
    mapCustomerFromApi,
    updateCustomer,
} from "@/services/customers.service";

// status filter options for order history toolbar
const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...ORDER_STATUSES.map((status) => ({ value: status, label: status })),
];

// calculate order total from billing items or fallback to finalCost
const getOrderAmount = (order) => {
    const calculated = calculateOrderTotals(order?.billing).total;
    return calculated > 0 ? calculated : (Number(order?.finalCost) || Number(order?.estimatedCost) || 0);
};

const CustomerDetail = () => {
    const { customerId } = useParams();
    const location = useLocation();

    // initialize customer from navigation state while fetching fresh data
    const [customer, setCustomer] = useState(() => {
        const passed = location.state?.customer;
        return passed ? mapCustomerFromApi(passed) : null;
    });
    const [loading, setLoading] = useState(!location.state?.customer);
    const [editOpen, setEditOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // load customer profile and associated orders from api
    useEffect(() => {
        let active = true;
        const loadCustomerDetail = async () => {
            if (!customer) setLoading(true);
            try {
                const fetched = await getCustomerById(customerId);
                if (active && fetched) {
                    setCustomer(fetched);
                }
            } catch (error) {
                console.error("failed to load customer detail:", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCustomerDetail();
        return () => {
            active = false;
        };
    }, [customerId]);

    // orders belonging to this customer
    const customerOrders = useMemo(
        () => (Array.isArray(customer?.orders) ? customer.orders : []),
        [customer?.orders]
    );

    // filter customer orders by search term and status
    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        return customerOrders.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const matchesSearch =
                !term ||
                [order.id, order.device, order.deviceType, order.serial, order.technician].some(
                    (value) => String(value ?? "").toLowerCase().includes(term)
                );
            return matchesStatus && matchesSearch;
        });
    }, [customerOrders, search, statusFilter]);

    // compute customer order statistics
    const stats = useMemo(() => {
        const active = customerOrders.filter((o) => o.status !== "Entregado").length;
        const completed = customerOrders.filter(
            (o) => o.status === "Entregado" || o.status === "Listo"
        ).length;
        const totalBilled = customerOrders.reduce(
            (sum, o) => sum + getOrderAmount(o),
            0
        );
        return {
            total: customerOrders.length,
            active,
            completed,
            totalBilled,
        };
    }, [customerOrders]);

    // update customer details in api
    const handleUpdateCustomer = async (data) => {
        if (!customer) return;
        const updated = await updateCustomer(customer.id, data);
        if (updated) {
            setCustomer((prev) => ({
                ...prev,
                ...updated,
                orders: prev?.orders ?? updated.orders ?? [],
            }));
            setEditOpen(false);
        }
    };

    // loading skeleton state
    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-14 w-72" />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <Skeleton key={idx} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                        <Skeleton className="h-80 w-full rounded-xl" />
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // not found state
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
            {/* header with back navigation and edit button */}
            <PageHeader
                backTo="/customers"
                backLabel="Volver a clientes"
                title={customer.name}
                description={`Ficha del cliente y su historial de órdenes (${customer.document || customer.code})`}
                actions={
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        <Pencil />
                        Editar cliente
                    </Button>
                }
            />

            {/* summary stat cards */}
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
                {/* customer contact sidebar card */}
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
                                    <CardDescription>{customer.code || `ID #${customer.id}`}</CardDescription>
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

                {/* customer service orders history card */}
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
                                    const orderTotal = getOrderAmount(order);
                                    return (
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

            {/* modal to edit customer contact info */}
            <CustomerFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                customer={customer}
                onSubmit={handleUpdateCustomer}
            />
        </DashboardLayout>
    );
};

export default CustomerDetail;
