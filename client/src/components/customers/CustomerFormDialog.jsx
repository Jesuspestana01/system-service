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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// dialog to create or edit a customer
export function CustomerFormDialog({ open, onOpenChange, customer, onSubmit }) {
    const isEditing = Boolean(customer);
    const [submitting, setSubmitting] = useState(false);

    // submit customer form data
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSubmitting(true);
        try {
            const data = Object.fromEntries(new FormData(e.currentTarget));
            await onSubmit(data);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <form key={customer?.id ?? "new"} onSubmit={handleSubmit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Actualiza la información de contacto del cliente."
                                : "Registra un cliente para asociarle órdenes de servicio."}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel htmlFor="customer-name">Nombre completo</FieldLabel>
                            <Input id="customer-name" name="name" defaultValue={customer?.name} placeholder="Ej: María González" required />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="customer-document">Cédula / RIF</FieldLabel>
                                <Input id="customer-document" name="document" defaultValue={customer?.document} placeholder="V-12.345.678" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="customer-phone">Teléfono</FieldLabel>
                                <Input id="customer-phone" name="phone" type="tel" defaultValue={customer?.phone} placeholder="0414-555-1234" required />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="customer-email">Correo electrónico</FieldLabel>
                            <Input id="customer-email" name="email" type="email" defaultValue={customer?.email} placeholder="correo@ejemplo.com" />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="customer-address">Dirección</FieldLabel>
                            <Input id="customer-address" name="address" defaultValue={customer?.address} placeholder="Opcional" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                        <Button type="submit" disabled={submitting}>
                            {submitting
                                ? "Guardando..."
                                : isEditing
                                  ? "Guardar cambios"
                                  : "Crear cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
