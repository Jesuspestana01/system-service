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
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { DEVICE_TYPES, ORDER_STATUSES, TECHNICIANS } from "@/data/orders";

export function OrderFormDialog({ open, onOpenChange, order, customerOptions, onSubmit }) {
    const isEditing = Boolean(order);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        onSubmit({ ...data, estimatedCost: Number(data.estimatedCost) || 0 });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <form key={order?.id ?? "new"} onSubmit={handleSubmit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? `Editar orden ${order.id}` : "Nueva orden de servicio"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Actualiza los datos del equipo y el estado de la reparación."
                                : "Registra el ingreso de un equipo al servicio técnico."}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel htmlFor="order-customer">Cliente</FieldLabel>
                            <SimpleSelect
                                id="order-customer"
                                name="customer"
                                options={customerOptions}
                                defaultValue={order?.customer ?? customerOptions[0]}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="order-device-type">Tipo de equipo</FieldLabel>
                                <SimpleSelect
                                    id="order-device-type"
                                    name="deviceType"
                                    options={DEVICE_TYPES}
                                    defaultValue={order?.deviceType ?? DEVICE_TYPES[0]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="order-device">Marca y modelo</FieldLabel>
                                <Input id="order-device" name="device" defaultValue={order?.device} placeholder="Ej: HP Pavilion 15" required />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="order-serial">N° de serie</FieldLabel>
                                <Input id="order-serial" name="serial" defaultValue={order?.serial} placeholder="Opcional" />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="order-technician">Técnico asignado</FieldLabel>
                                <SimpleSelect
                                    id="order-technician"
                                    name="technician"
                                    options={TECHNICIANS}
                                    defaultValue={order?.technician ?? TECHNICIANS[0]}
                                />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="order-issue">Falla reportada</FieldLabel>
                            <Textarea
                                id="order-issue"
                                name="issue"
                                defaultValue={order?.issue}
                                placeholder="Describe el problema que reporta el cliente"
                                required
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="order-status">Estado</FieldLabel>
                                <SimpleSelect
                                    id="order-status"
                                    name="status"
                                    options={ORDER_STATUSES}
                                    defaultValue={order?.status ?? ORDER_STATUSES[0]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="order-cost">Costo estimado ($)</FieldLabel>
                                <Input
                                    id="order-cost"
                                    name="estimatedCost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={order?.estimatedCost ?? ""}
                                    placeholder="0.00"
                                />
                            </Field>
                        </div>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                        <Button type="submit">{isEditing ? "Guardar cambios" : "Crear orden"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
