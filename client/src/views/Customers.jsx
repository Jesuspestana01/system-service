import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Mail, Phone, Plus, UserCheck, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { RowActions } from "@/components/dashboard/RowActions";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { formatDate, getInitials, todayISO } from "@/lib/format";
import { getRolePermissions } from "@/lib/permissions";
import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer,
} from "@/services/customers.service";

// check if iso date falls in current year-month
const isThisMonth = (isoDate) => String(isoDate ?? "").slice(0, 7) === todayISO().slice(0, 7);

const Customers = () => {
    const navigate = useNavigate();
    // seller role cannot delete customers; admin and technician have full access
    const { canDelete } = getRolePermissions();

    // customers and ui state
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formState, setFormState] = useState({ open: false, item: null });
    const [itemToDelete, setItemToDelete] = useState(null);

    // load customers from api on mount
    useEffect(() => {
        const loadCustomers = async () => {
            setLoading(true);
            try {
                const data = await getCustomers();
                if (Array.isArray(data)) {
                    setCustomers(data);
                }
            } catch (error) {
                console.error("failed to fetch customers:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCustomers();
    }, []);

    // filter customers by search query
    const filteredCustomers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return customers;
        return customers.filter((customer) =>
            [customer.name, customer.document, customer.phone, customer.email].some((value) =>
                String(value ?? "").toLowerCase().includes(term)
            )
        );
    }, [customers, search]);

    // compute customer statistics
    const stats = useMemo(
        () => ({
            total: customers.length,
            newThisMonth: customers.filter((c) => isThisMonth(c.createdAt)).length,
            withOrders: customers.filter((c) => c.ordersCount > 0).length,
        }),
        [customers]
    );

    // open modal to create customer
    const openCreate = () => setFormState({ open: true, item: null });

    // open modal to edit customer
    const openEdit = (customer) => setFormState({ open: true, item: customer });

    // create or update customer in api
    const handleSave = async (data) => {
        if (formState.item) {
            const updated = await updateCustomer(formState.item.id, data);
            if (updated) {
                setCustomers((prev) =>
                    prev.map((c) => (c.id === formState.item.id ? updated : c))
                );
            }
            setFormState({ open: false, item: null });
            return;
        }

        const created = await createCustomer(data);
        if (created) {
            setCustomers((prev) => [created, ...prev]);
            setFormState({ open: false, item: null });
        }
    };

    // delete customer from api and remove from state
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const target = itemToDelete;
        setItemToDelete(null);
        try {
            await deleteCustomer(target.id);
            setCustomers((prev) => prev.filter((c) => c.id !== target.id));
        } catch (error) {
            console.error("failed to delete customer:", error);
        }
    };

    return (
        <DashboardLayout>
            {/* header and new customer action */}
            <PageHeader
                title="Clientes"
                description="Consulta y administra la información de contacto de tus clientes."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        Nuevo cliente
                    </Button>
                }
            />

            {/* customer stats cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatCard title="Total de clientes" value={stats.total} icon={Users} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Nuevos este mes" value={stats.newThisMonth} icon={UserPlus} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Con órdenes" value={stats.withOrders} hint="Al menos un equipo ingresado" icon={UserCheck} color="bg-violet-500/10 text-violet-600" />
            </div>

            {/* customers table */}
            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de clientes"
                        description={`${filteredCustomers.length} de ${customers.length} clientes`}
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Buscar cliente, cédula..."
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Cédula / RIF</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead className="text-center">Órdenes</TableHead>
                                <TableHead>Registro</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* loading skeleton rows */}
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="size-9 rounded-full" />
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-40" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-6 rounded-md" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <EmptyTableRow colSpan={7} />
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} className="animate-in fade-in duration-300">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/customers/${customer.id}`}
                                                        state={{ customer }}
                                                        className="font-medium underline-offset-4 hover:underline"
                                                    >
                                                        {customer.name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">{customer.email || "Sin correo"}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{customer.document}</TableCell>
                                        <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                                        <TableCell className="max-w-48 truncate text-muted-foreground">{customer.address || "—"}</TableCell>
                                        <TableCell className="text-center font-medium">
                                            <Link
                                                to={`/customers/${customer.id}`}
                                                state={{ customer }}
                                                className="text-primary underline-offset-4 hover:underline"
                                            >
                                                {customer.ordersCount}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                                        <TableCell>
                                            <RowActions
                                                onEdit={() => openEdit(customer)}
                                                onDelete={canDelete ? () => setItemToDelete(customer) : undefined}
                                            >
                                                <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`, { state: { customer } })}>
                                                    <Eye />
                                                    Ver historial de órdenes
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`tel:${customer.phone}`)}>
                                                    <Phone />
                                                    Llamar
                                                </DropdownMenuItem>
                                                {customer.email && (
                                                    <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`)}>
                                                        <Mail />
                                                        Enviar correo
                                                    </DropdownMenuItem>
                                                )}
                                            </RowActions>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* create or edit customer modal */}
            <CustomerFormDialog
                open={formState.open}
                onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
                customer={formState.item}
                onSubmit={handleSave}
            />

            {/* delete confirmation dialog (admin and technician only) */}
            {canDelete && (
                <ConfirmDeleteDialog
                    open={Boolean(itemToDelete)}
                    onOpenChange={(open) => !open && setItemToDelete(null)}
                    title={`¿Eliminar a ${itemToDelete?.name ?? "este cliente"}?`}
                    description="Se eliminará el cliente de forma permanente. Esta acción no se puede deshacer."
                    onConfirm={handleConfirmDelete}
                />
            )}
        </DashboardLayout>
    );
};

export default Customers;
