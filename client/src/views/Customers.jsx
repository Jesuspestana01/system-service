import { useMemo, useState } from "react";
import { Mail, Phone, Plus, UserCheck, UserPlus, Users } from "lucide-react";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { RowActions } from "@/components/dashboard/RowActions";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { useCrudState, nextId } from "@/hooks/useCrudState";
import { formatDate, getInitials, todayISO } from "@/lib/format";
import { customers as initialCustomers } from "@/data/customers";

const isThisMonth = (isoDate) => isoDate?.slice(0, 7) === todayISO().slice(0, 7);

const Customers = () => {
    const crud = useCrudState(initialCustomers, (items) => nextId(items, "CL"));
    const [search, setSearch] = useState("");

    const filteredCustomers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return crud.items;
        return crud.items.filter((customer) =>
            [customer.name, customer.document, customer.phone, customer.email].some((value) =>
                value?.toLowerCase().includes(term)
            )
        );
    }, [crud.items, search]);

    const stats = useMemo(
        () => ({
            total: crud.items.length,
            newThisMonth: crud.items.filter((c) => isThisMonth(c.createdAt)).length,
            withOrders: crud.items.filter((c) => c.ordersCount > 0).length,
        }),
        [crud.items]
    );

    const handleSave = (data) => {
        crud.save(crud.form.item ? data : { ...data, ordersCount: 0, createdAt: todayISO() });
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Clientes"
                description="Consulta y administra la información de contacto de tus clientes."
                actions={
                    <Button onClick={crud.openCreate}>
                        <Plus />
                        Nuevo cliente
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatCard title="Total de clientes" value={stats.total} icon={Users} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Nuevos este mes" value={stats.newThisMonth} icon={UserPlus} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Con órdenes" value={stats.withOrders} hint="Al menos un equipo ingresado" icon={UserCheck} color="bg-violet-500/10 text-violet-600" />
            </div>

            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de clientes"
                        description={`${filteredCustomers.length} de ${crud.items.length} clientes`}
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
                            {filteredCustomers.length === 0 && <EmptyTableRow colSpan={7} />}
                            {filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                                {getInitials(customer.name)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">{customer.email || "Sin correo"}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{customer.document}</TableCell>
                                    <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                                    <TableCell className="max-w-48 truncate text-muted-foreground">{customer.address || "—"}</TableCell>
                                    <TableCell className="text-center font-medium">{customer.ordersCount}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                                    <TableCell>
                                        <RowActions onEdit={() => crud.openEdit(customer)} onDelete={() => crud.requestDelete(customer)}>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CustomerFormDialog
                open={crud.form.open}
                onOpenChange={crud.setFormOpen}
                customer={crud.form.item}
                onSubmit={handleSave}
            />

            <ConfirmDeleteDialog
                open={Boolean(crud.itemToDelete)}
                onOpenChange={(open) => !open && crud.cancelDelete()}
                title={`¿Eliminar a ${crud.itemToDelete?.name ?? "este cliente"}?`}
                description="Se eliminará el cliente de forma permanente. Esta acción no se puede deshacer."
                onConfirm={crud.confirmDelete}
            />
        </DashboardLayout>
    );
};

export default Customers;
