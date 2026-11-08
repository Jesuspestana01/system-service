import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { DEFAULT_ORDER_STATUS, ORDER_STATUS_STYLES, TECHNICIANS } from "@/data/orders";
import { APPLE_DEVICE_TYPES, getModelsByType, getSerialPlaceholder } from "@/data/apple-devices";

/**
 * Modal para crear una orden o corregir los datos del equipo ingresado.
 *
 * TODO [BACKEND]:
 * - Al crear (`order === null`): enviar a `POST /api/orders` (`createOrder` en `src/services/orders.service.js`).
 * - Al editar (`order !== null`): enviar a `PUT /api/orders/:id/equipment` (`updateOrderEquipment`),
 *   que actualiza `Equipment` (`deviceType`, `model`, `serialNumber`, `color`, `accessories`, `physicalCondition`)
 *   y `ServiceOrder` (`clientId`, `assignedTechnician`).
 * - Al crear cliente con el botón "+": enviar a `POST /api/clients` (`createCustomer` en `src/services/customers.service.js`).
 */
export function OrderFormDialog({ open, onOpenChange, order, customers, onCreateCustomer, onSubmit }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <OrderForm
                    key={order?.id ?? "new"}
                    order={order}
                    customers={customers}
                    onCreateCustomer={onCreateCustomer}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}

function OrderForm({ order, customers, onCreateCustomer, onSubmit }) {
    const isEditing = Boolean(order);
    const initialType = order?.deviceType ?? APPLE_DEVICE_TYPES[0];

    const [customerId, setCustomerId] = useState(order?.customerId ?? customers[0]?.id ?? null);
    const [deviceType, setDeviceType] = useState(initialType);
    const [device, setDevice] = useState(order?.device ?? getModelsByType(initialType)[0]);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

    const customerOptions = customers.map((customer) => ({
        value: customer.id,
        label: `${customer.name} · ${customer.document}`,
    }));

    // Al cambiar el tipo de equipo se selecciona el primer modelo de ese tipo
    const handleDeviceTypeChange = (type) => {
        setDeviceType(type);
        setDevice(getModelsByType(type)[0]);
    };

    const handleCreateCustomer = (data) => {
        const newCustomer = onCreateCustomer(data);
        setCustomerId(newCustomer.id);
        setCustomerDialogOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customer = customers.find((c) => c.id === customerId);

        const payload = {
            customerId,
            customer: customer?.name ?? "",
            deviceType,
            device,
            serial: formData.get("serial").trim().toUpperCase(),
            technician: formData.get("technician"),
        };

        if (isEditing) {
            payload.color = formData.get("color")?.trim() ?? "";
            payload.accessories = formData.get("accessories")?.trim() ?? "";
            payload.physicalCondition = formData.get("physicalCondition")?.trim() ?? "";
        }

        onSubmit(payload);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? `Editar equipo de la orden ${order.id}` : "Nueva orden de servicio"}
                    </DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-1.5">
                        {isEditing ? (
                            "Corrige los datos del equipo, el cliente o el técnico si hubo una equivocación al ingresarlo."
                        ) : (
                            <>
                                Registra el ingreso de un equipo. La orden se creará como
                                <Badge variant="outline" className={ORDER_STATUS_STYLES[DEFAULT_ORDER_STATUS]}>
                                    {DEFAULT_ORDER_STATUS}
                                </Badge>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <FieldGroup className="gap-4">
                    {/* 1. Cliente */}
                    <Field>
                        <FieldLabel htmlFor="order-customer">Cliente</FieldLabel>
                        <div className="flex gap-2">
                            <SimpleSelect
                                id="order-customer"
                                options={customerOptions}
                                value={customerId}
                                onValueChange={setCustomerId}
                                className="min-w-0 flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label="Crear cliente nuevo"
                                title="Crear cliente nuevo"
                                onClick={() => setCustomerDialogOpen(true)}
                            >
                                <UserPlus />
                            </Button>
                        </div>
                        {customers.length === 0 && (
                            <FieldDescription>No hay clientes registrados. Crea uno con el botón +.</FieldDescription>
                        )}
                    </Field>

                    {/* 2. Equipo Apple */}
                    <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
                        <Field>
                            <FieldLabel htmlFor="order-device-type">Tipo de equipo</FieldLabel>
                            <SimpleSelect
                                id="order-device-type"
                                options={APPLE_DEVICE_TYPES}
                                value={deviceType}
                                onValueChange={handleDeviceTypeChange}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="order-device">Modelo</FieldLabel>
                            <SimpleSelect
                                id="order-device"
                                options={getModelsByType(deviceType)}
                                value={device}
                                onValueChange={setDevice}
                            />
                        </Field>
                    </div>

                    {/* 3. Serie / IMEI */}
                    <Field>
                        <FieldLabel htmlFor="order-serial">N° de serie o IMEI</FieldLabel>
                        <Input
                            id="order-serial"
                            name="serial"
                            defaultValue={order?.serial}
                            placeholder={getSerialPlaceholder(deviceType)}
                            className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
                            autoComplete="off"
                            required
                        />
                    </Field>

                    {/* 4. Técnico */}
                    <Field>
                        <FieldLabel htmlFor="order-technician">Técnico asignado</FieldLabel>
                        <SimpleSelect
                            id="order-technician"
                            name="technician"
                            options={TECHNICIANS}
                            defaultValue={order?.technician ?? TECHNICIANS[0]}
                        />
                    </Field>

                    {/* Campos físicos adicionales del modelo `Equipment` visibles al editar el equipo */}
                    {isEditing && (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="order-color">Color</FieldLabel>
                                    <Input
                                        id="order-color"
                                        name="color"
                                        defaultValue={order?.color}
                                        placeholder="Ej: Medianoche, Plata..."
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="order-accessories">Accesorios recibidos</FieldLabel>
                                    <Input
                                        id="order-accessories"
                                        name="accessories"
                                        defaultValue={order?.accessories}
                                        placeholder="Ej: Cargador, forro..."
                                    />
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="order-condition">Condición estética al recibirlo</FieldLabel>
                                <Textarea
                                    id="order-condition"
                                    name="physicalCondition"
                                    defaultValue={order?.physicalCondition}
                                    placeholder="Ej: Rayones leves en carcasa, golpe en esquina..."
                                />
                            </Field>
                        </>
                    )}
                </FieldGroup>

                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                    <Button type="submit" disabled={!customerId}>
                        {isEditing ? "Guardar cambios" : "Crear orden"}
                    </Button>
                </DialogFooter>
            </form>

            {/* Modal anidado para crear un cliente sin salir de la orden */}
            <CustomerFormDialog
                open={customerDialogOpen}
                onOpenChange={setCustomerDialogOpen}
                customer={null}
                onSubmit={handleCreateCustomer}
            />
        </>
    );
}
