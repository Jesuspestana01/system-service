import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
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
import { DeviceModelsDialog } from "@/components/orders/DeviceModelsDialog";
import { DEFAULT_ORDER_STATUS, ORDER_STATUS_STYLES } from "@/data/orders";
import {
    APPLE_DEVICE_TYPES,
    getModelsByType,
    getSerialPlaceholder,
    NO_MODELS_LABEL,
} from "@/data/apple-devices";
import { formatCedula } from "@/lib/format";
import { getRolePermissions } from "@/lib/permissions";
import { getTechnicians } from "@/services/auth.service";
import {
    createDeviceModel,
    deleteDeviceModel,
    getDeviceModels,
} from "@/services/equipment.service";

// modal dialog to create an order or edit equipment details
export function OrderFormDialog({
    open,
    onOpenChange,
    order,
    customers,
    deviceModels: externalModels,
    onCreateCustomer,
    onCreateDeviceModel,
    onDeleteDeviceModel,
    onSubmit,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <OrderForm
                    key={order?.id ?? "new"}
                    order={order}
                    customers={customers}
                    externalModels={externalModels}
                    onCreateCustomer={onCreateCustomer}
                    onCreateDeviceModel={onCreateDeviceModel}
                    onDeleteDeviceModel={onDeleteDeviceModel}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}

function OrderForm({
    order,
    customers,
    externalModels,
    onCreateCustomer,
    onCreateDeviceModel,
    onDeleteDeviceModel,
    onSubmit,
}) {
    const isEditing = Boolean(order);
    const { canDelete } = getRolePermissions();
    const initialType =
        order?.deviceType && APPLE_DEVICE_TYPES.includes(order.deviceType)
            ? order.deviceType
            : APPLE_DEVICE_TYPES[0];

    const [localModels, setLocalModels] = useState([]);
    const models = externalModels ?? localModels;

    const [customerId, setCustomerId] = useState(
        order?.customerId
            ? String(order.customerId)
            : customers[0]?.id
              ? String(customers[0].id)
              : ""
    );
    const [deviceType, setDeviceType] = useState(initialType);
    const [device, setDevice] = useState(
        order?.device ?? getModelsByType(initialType, models)[0]
    );
    const [technicianValue, setTechnicianValue] = useState(
        order?.technicianId ? String(order.technicianId) : "none"
    );
    const [technicians, setTechnicians] = useState([]);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [modelsDialogOpen, setModelsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // load device models if not provided by parent view
    useEffect(() => {
        if (externalModels !== undefined) return;
        getDeviceModels()
            .then((list) => {
                if (Array.isArray(list)) setLocalModels(list);
            })
            .catch(() => {});
    }, [externalModels]);

    // ensure current order's model is included when editing an existing order
    const effectiveModels =
        isEditing &&
        order?.device &&
        order.device !== "—" &&
        !models.some((m) => m.deviceType === deviceType && m.name === order.device)
            ? [{ id: "current", deviceType, name: order.device }, ...models]
            : models;

    const modelOptions = getModelsByType(deviceType, effectiveModels);
    const hasModelsForType =
        modelOptions.length > 0 && modelOptions[0] !== NO_MODELS_LABEL;

    // sync selected model when models list or deviceType changes
    useEffect(() => {
        const available = getModelsByType(deviceType, effectiveModels);
        if (!available.includes(device)) {
            setDevice(available[0]);
        }
    }, [deviceType, effectiveModels, device]);

    // sync selected customer when customers list loads
    useEffect(() => {
        if (!customerId && customers.length > 0) {
            setCustomerId(String(customers[0].id));
        }
    }, [customers, customerId]);

    // load active technicians from api
    useEffect(() => {
        getTechnicians()
            .then((list) => {
                const items = Array.isArray(list) ? list : [];
                setTechnicians(items);
                if (!order?.technicianId && order?.technician && order.technician !== "Sin asignar") {
                    const matched = items.find(
                        (u) =>
                            `${u.name ?? ""} ${
                                u.lastName && u.lastName !== "-" ? u.lastName : ""
                            }`.trim() === order.technician
                    );
                    if (matched) setTechnicianValue(String(matched.id));
                }
            })
            .catch(() => {});
    }, [order]);

    const customerOptions = customers.map((customer) => ({
        value: String(customer.id),
        label: `${customer.name}${customer.document ? ` · ${formatCedula(customer.document)}` : ""}`,
    }));

    const technicianOptions = [
        { value: "none", label: "Sin asignar" },
        ...technicians.map((tech) => ({
            value: String(tech.id),
            label: `${tech.name ?? ""} ${tech.lastName && tech.lastName !== "-" ? tech.lastName : ""}`.trim(),
        })),
    ];

    // select default model when device type changes
    const handleDeviceTypeChange = (type) => {
        setDeviceType(type);
        setDevice(getModelsByType(type, effectiveModels)[0]);
    };

    // create new customer inline and select it
    const handleCreateCustomer = async (data) => {
        const newCustomer = await onCreateCustomer(data);
        if (newCustomer?.id) {
            setCustomerId(String(newCustomer.id));
            setCustomerDialogOpen(false);
        }
    };

    // create new device model inline and select it
    const handleCreateModel = async (payload) => {
        const created = onCreateDeviceModel
            ? await onCreateDeviceModel(payload)
            : await createDeviceModel(payload);

        if (!onCreateDeviceModel && created) {
            setLocalModels((prev) => [...prev, created]);
        }

        if (created?.name) {
            setDeviceType(created.deviceType);
            setDevice(created.name);
        }
        return created;
    };

    // delete device model from inline dialog
    const handleDeleteModel = async (id) => {
        if (onDeleteDeviceModel) {
            await onDeleteDeviceModel(id);
        } else {
            await deleteDeviceModel(id);
            setLocalModels((prev) => prev.filter((m) => String(m.id) !== String(id)));
        }
    };

    // submit order form payload
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasModelsForType || device === NO_MODELS_LABEL) return;
        setSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const customer = customers.find((c) => String(c.id) === String(customerId));
            const selectedTech = technicians.find((t) => String(t.id) === String(technicianValue));
            const technicianName = selectedTech
                ? `${selectedTech.name ?? ""} ${
                      selectedTech.lastName && selectedTech.lastName !== "-"
                          ? selectedTech.lastName
                          : ""
                  }`.trim()
                : "Sin asignar";

            const payload = {
                customerId: Number(customerId) || customerId,
                customer: customer?.name ?? "",
                equipmentId: order?.equipmentId ?? null,
                deviceType,
                device,
                serial: formData.get("serial").trim().toUpperCase(),
                technicianId: selectedTech ? Number(selectedTech.id) : null,
                technician: technicianName,
            };

            if (isEditing) {
                payload.color = formData.get("color")?.trim() ?? "";
                payload.accessories = formData.get("accessories")?.trim() ?? "";
                payload.physicalCondition = formData.get("physicalCondition")?.trim() ?? "";
            }

            await onSubmit(payload);
        } finally {
            setSubmitting(false);
        }
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
                    {/* customer selector */}
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

                    {/* device type and model */}
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
                            <div className="flex gap-2">
                                <SimpleSelect
                                    id="order-device"
                                    options={modelOptions}
                                    value={device}
                                    onValueChange={setDevice}
                                    className="min-w-0 flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Crear modelo de equipo"
                                    title="Crear modelo de equipo"
                                    onClick={() => setModelsDialogOpen(true)}
                                >
                                    <Plus />
                                </Button>
                            </div>
                            {!hasModelsForType && (
                                <FieldDescription>
                                    No hay modelos registrados en {deviceType}. Crea uno con el botón +.
                                </FieldDescription>
                            )}
                        </Field>
                    </div>

                    {/* serial number or imei */}
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

                    {/* assigned technician */}
                    <Field>
                        <FieldLabel htmlFor="order-technician">Técnico asignado</FieldLabel>
                        <SimpleSelect
                            id="order-technician"
                            name="technician"
                            options={technicianOptions}
                            value={technicianValue}
                            onValueChange={setTechnicianValue}
                        />
                    </Field>

                    {/* extra physical details when editing */}
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
                    <Button
                        type="submit"
                        disabled={!customerId || !hasModelsForType || device === NO_MODELS_LABEL || submitting}
                    >
                        {submitting
                            ? "Guardando..."
                            : isEditing
                              ? "Guardar cambios"
                              : "Crear orden"}
                    </Button>
                </DialogFooter>
            </form>

            {/* nested dialog to create a customer */}
            <CustomerFormDialog
                open={customerDialogOpen}
                onOpenChange={setCustomerDialogOpen}
                customer={null}
                onSubmit={handleCreateCustomer}
            />

            {/* nested dialog to create or manage device models */}
            <DeviceModelsDialog
                open={modelsDialogOpen}
                onOpenChange={setModelsDialogOpen}
                initialDeviceType={deviceType}
                models={models}
                onCreateModel={handleCreateModel}
                onDeleteModel={canDelete ? handleDeleteModel : undefined}
            />
        </>
    );
}
