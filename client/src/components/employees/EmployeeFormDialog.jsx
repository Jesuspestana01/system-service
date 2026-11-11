import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from "@/services/users.service";

export function EmployeeFormDialog({ open, onOpenChange, employee, onSubmit }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <EmployeeForm
                    key={employee?.id ?? "new"}
                    employee={employee}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}

function EmployeeForm({ employee, onSubmit }) {
    const isEditing = Boolean(employee);

    // Si en la BD viene 'vendedor' o 'recepción', normalizar al valor de la opción
    const initialRole =
        employee?.role === "vendedor"
            ? "recepción"
            : (employee?.role ?? EMPLOYEE_ROLES[1].value);

    const [role, setRole] = useState(initialRole);
    const [status, setStatus] = useState(employee?.status ?? "activo");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password")?.trim() ?? "";

        if (!isEditing && password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (isEditing && password && password.length < 8) {
            setError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                name: formData.get("name").trim(),
                lastName: formData.get("lastName").trim(),
                username: formData.get("username").trim(),
                email: formData.get("email").trim().toLowerCase(),
                role,
                status,
                ...(password ? { password } : {}),
            });
        } catch (err) {
            setError(err.message || "No se pudo guardar el usuario.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
                <DialogTitle>
                    {isEditing ? `Editar a ${employee.name} ${employee.lastName}` : "Nuevo empleado"}
                </DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? "Modifica los datos personales, el rol o el estado de acceso del empleado."
                        : "Registra un nuevo usuario en la base de datos."}
                </DialogDescription>
            </DialogHeader>

            {error && (
                <FieldError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center">
                    {error}
                </FieldError>
            )}

            <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="emp-name">Nombre</FieldLabel>
                        <Input
                            id="emp-name"
                            name="name"
                            defaultValue={employee?.name}
                            placeholder="Ej: Pedro"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="emp-lastName">Apellido</FieldLabel>
                        <Input
                            id="emp-lastName"
                            name="lastName"
                            defaultValue={employee?.lastName}
                            placeholder="Ej: Ramírez"
                            required
                        />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="emp-username">Nombre de usuario</FieldLabel>
                        <Input
                            id="emp-username"
                            name="username"
                            defaultValue={employee?.username}
                            placeholder="Ej: pramirez"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="emp-email">Correo electrónico</FieldLabel>
                        <Input
                            id="emp-email"
                            name="email"
                            type="email"
                            defaultValue={employee?.email}
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="emp-role">Rol</FieldLabel>
                        <SimpleSelect
                            id="emp-role"
                            options={EMPLOYEE_ROLES}
                            value={role}
                            onValueChange={setRole}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="emp-status">Estado</FieldLabel>
                        <SimpleSelect
                            id="emp-status"
                            options={EMPLOYEE_STATUSES}
                            value={status}
                            onValueChange={setStatus}
                        />
                    </Field>
                </div>

                <Field>
                    <FieldLabel htmlFor="emp-password">
                        {isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                    </FieldLabel>
                    <Input
                        id="emp-password"
                        name="password"
                        type="password"
                        placeholder={isEditing ? "Dejar en blanco para no cambiarla" : "Mínimo 8 caracteres"}
                        required={!isEditing}
                    />
                    {isEditing && (
                        <FieldDescription>
                            Solo escribe aquí si deseas restablecer la contraseña del empleado.
                        </FieldDescription>
                    )}
                </Field>
            </FieldGroup>

            <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear empleado"}
                </Button>
            </DialogFooter>
        </form>
    );
}
