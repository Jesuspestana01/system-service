import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
    Loader2,
    Plus,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    UserCog,
    Users,
    Wrench,
} from "lucide-react";
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
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";
import { formatDate, getInitials } from "@/lib/format";
import {
    createUser,
    deleteUser,
    EMPLOYEE_ROLES,
    EMPLOYEE_STATUSES,
    getUsers,
    ROLE_LABELS,
    ROLE_STYLES,
    STATUS_STYLES,
    updateUser,
} from "@/services/users.service";

const roleFilterOptions = [
    { value: "all", label: "Todos los roles" },
    ...EMPLOYEE_ROLES,
];

const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    ...EMPLOYEE_STATUSES,
];

const Employees = () => {
    const isAdmin = localStorage.getItem("role") === "administrador";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [form, setForm] = useState({ open: false, item: null });
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || "No se pudieron cargar los usuarios desde el servidor.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter ||
                (roleFilter === "recepción" && user.role === "vendedor");
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            const fullName = `${user.name ?? ""} ${user.lastName ?? ""}`.toLowerCase();
            const matchesSearch =
                !term ||
                [fullName, user.username, user.email].some((v) => v?.toLowerCase().includes(term));

            return matchesRole && matchesStatus && matchesSearch;
        });
    }, [users, search, roleFilter, statusFilter]);

    const stats = useMemo(
        () => ({
            total: users.length,
            active: users.filter((u) => u.status === "activo").length,
            technicians: users.filter((u) => u.role === "técnico").length,
            admins: users.filter((u) => u.role === "administrador").length,
        }),
        [users]
    );

    // Solo los administradores pueden entrar a esta vista
    if (!isAdmin) {
        return <Navigate to="/main" replace />;
    }

    const openCreate = () => setForm({ open: true, item: null });
    const openEdit = (user) => setForm({ open: true, item: user });
    const setFormOpen = (open) => setForm((prev) => ({ ...prev, open }));

    const handleSave = async (payload) => {
        if (form.item) {
            const updated = await updateUser(form.item.id, payload);
            setUsers((prev) => prev.map((u) => (u.id === form.item.id ? updated : u)));
        } else {
            const created = await createUser(payload);
            setUsers((prev) => [created, ...prev]);
        }
        setFormOpen(false);
    };

    const handleQuickUpdate = async (user, changes) => {
        setError("");
        try {
            const updated = await updateUser(user.id, changes);
            setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
        } catch (err) {
            setError(err.message || "No se pudo actualizar el usuario.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setError("");
        try {
            await deleteUser(userToDelete.id);
            setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        } catch (err) {
            setError(err.message || "No se pudo eliminar el usuario.");
        } finally {
            setUserToDelete(null);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Gestión de empleados"
                description="Administra las cuentas, roles (Administrador, Técnico, Vendedor) y permisos de acceso al sistema."
                actions={
                    <>
                        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                            <RefreshCw className={loading ? "animate-spin" : ""} />
                            Actualizar
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus />
                            Nuevo empleado
                        </Button>
                    </>
                }
            />

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de usuarios" value={stats.total} icon={Users} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Usuarios activos" value={stats.active} icon={UserCheck} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Técnicos" value={stats.technicians} icon={Wrench} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Administradores" value={stats.admins} icon={ShieldCheck} color="bg-violet-500/10 text-violet-600" />
            </div>

            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Usuarios registrados"
                        description={
                            loading
                                ? "Cargando usuarios de la base de datos..."
                                : `${filteredUsers.length} de ${users.length} usuarios`
                        }
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Buscar nombre, usuario o correo..."
                    >
                        <SimpleSelect
                            options={roleFilterOptions}
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                            className="sm:w-44"
                        />
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
                                <TableHead>Empleado</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Registro</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <>
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <Loader2 className="size-7 animate-spin text-primary" />
                                                <span className="text-sm font-medium">
                                                    Cargando usuarios...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {[1, 2, 3].map((row) => (
                                        <TableRow key={row} className="pointer-events-none opacity-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 animate-pulse rounded-full bg-muted" />
                                                    <div className="space-y-1.5">
                                                        <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                                                        <div className="h-3 w-40 animate-pulse rounded bg-muted/70" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {filteredUsers.length === 0 && (
                                        <EmptyTableRow
                                            colSpan={6}
                                            message="No se encontraron usuarios en la base de datos."
                                        />
                                    )}
                                    {filteredUsers.map((user) => {
                                        const fullName = `${user.name ?? ""} ${user.lastName ?? ""}`.trim();
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                                            {getInitials(fullName || user.username)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{fullName}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    @{user.username}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={ROLE_STYLES[user.role]}>
                                                        {ROLE_LABELS[user.role] ?? user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={STATUS_STYLES[user.status]}>
                                                        {user.status === "activo" ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(user.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <RowActions
                                                        onEdit={() => openEdit(user)}
                                                        onDelete={() => setUserToDelete(user)}
                                                    >
                                                        {/* Cambio rápido de rol */}
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserCog />
                                                                Cambiar rol
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuRadioGroup
                                                                    value={user.role === "vendedor" ? "recepción" : user.role}
                                                                    onValueChange={(role) => handleQuickUpdate(user, { role })}
                                                                >
                                                                    {EMPLOYEE_ROLES.map((r) => (
                                                                        <DropdownMenuRadioItem
                                                                            key={r.value}
                                                                            value={r.value}
                                                                            closeOnClick
                                                                        >
                                                                            {r.label}
                                                                        </DropdownMenuRadioItem>
                                                                    ))}
                                                                </DropdownMenuRadioGroup>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        {/* Cambio rápido de estado (Activo / Inactivo) */}
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserCheck />
                                                                Cambiar estado
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuRadioGroup
                                                                    value={user.status}
                                                                    onValueChange={(status) =>
                                                                        handleQuickUpdate(user, { status })
                                                                    }
                                                                >
                                                                    {EMPLOYEE_STATUSES.map((s) => (
                                                                        <DropdownMenuRadioItem
                                                                            key={s.value}
                                                                            value={s.value}
                                                                            closeOnClick
                                                                        >
                                                                            {s.label}
                                                                        </DropdownMenuRadioItem>
                                                                    ))}
                                                                </DropdownMenuRadioGroup>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                    </RowActions>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <EmployeeFormDialog
                open={form.open}
                onOpenChange={setFormOpen}
                employee={form.item}
                onSubmit={handleSave}
            />

            <ConfirmDeleteDialog
                open={Boolean(userToDelete)}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                title={`¿Eliminar a ${userToDelete?.name ?? ""} ${userToDelete?.lastName ?? ""}?`}
                description="Si el usuario tiene órdenes o registros asociados, el servidor no permitirá eliminarlo (puedes cambiar su estado a Inactivo)."
                onConfirm={handleConfirmDelete}
            />
        </DashboardLayout>
    );
};

export default Employees;
