import { useEffect, useMemo, useState } from "react";
import { Laptop, Plus, Trash2 } from "lucide-react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { APPLE_DEVICE_TYPES } from "@/data/apple-devices";

const MODEL_PLACEHOLDERS = {
    iPhone: "Ej: iPhone 16 Pro Max",
    MacBook: 'Ej: MacBook Pro 14" M4',
    iPad: 'Ej: iPad Air 11" M2',
    iMac: 'Ej: iMac 24" M3',
    "Mac mini / Mac Studio": "Ej: Mac mini M4",
    "Apple Watch": "Ej: Apple Watch Series 10",
    AirPods: "Ej: AirPods Pro 2",
};

// dialog to create and manage equipment models per device category (iPhone, MacBook, etc.)
export function DeviceModelsDialog({
    open,
    onOpenChange,
    initialDeviceType = APPLE_DEVICE_TYPES[0],
    models = [],
    onCreateModel,
    onDeleteModel,
}) {
    const [deviceType, setDeviceType] = useState(
        APPLE_DEVICE_TYPES.includes(initialDeviceType) ? initialDeviceType : APPLE_DEVICE_TYPES[0]
    );
    const [modelName, setModelName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // sync category when dialog opens with a specific deviceType
    useEffect(() => {
        if (open) {
            setError("");
            if (initialDeviceType && APPLE_DEVICE_TYPES.includes(initialDeviceType)) {
                setDeviceType(initialDeviceType);
            }
        }
    }, [open, initialDeviceType]);

    // filter models belonging to the selected device category
    const categoryModels = useMemo(
        () => models.filter((item) => item.deviceType === deviceType),
        [models, deviceType]
    );

    // create new model inside selected category in backend
    const handleAddModel = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const trimmed = modelName.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        setError("");
        try {
            await onCreateModel({ deviceType, name: trimmed });
            setModelName("");
        } catch (err) {
            setError(err.message || "No se pudo guardar el modelo en el servidor.");
        } finally {
            setSubmitting(false);
        }
    };

    // delete model from backend
    const handleRemoveModel = async (id) => {
        if (!onDeleteModel) return;
        setError("");
        try {
            await onDeleteModel(id);
        } catch (err) {
            setError(err.message || "No se pudo eliminar el modelo del servidor.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Laptop className="size-4 text-muted-foreground" />
                        Modelos de equipos
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona una categoría (iPhone, MacBook, iPad, etc.) y registra los modelos disponibles.
                    </DialogDescription>
                </DialogHeader>

                <FieldGroup className="gap-4">
                    {/* category selector */}
                    <Field>
                        <FieldLabel htmlFor="catalog-device-type">Tipo de equipo</FieldLabel>
                        <SimpleSelect
                            id="catalog-device-type"
                            options={APPLE_DEVICE_TYPES}
                            value={deviceType}
                            onValueChange={setDeviceType}
                        />
                    </Field>

                    {/* form to create a new model under selected category */}
                    <form onSubmit={handleAddModel} className="space-y-1.5">
                        <FieldLabel htmlFor="catalog-model-name">
                            Nuevo modelo de {deviceType}
                        </FieldLabel>
                        <div className="flex gap-2">
                            <Input
                                id="catalog-model-name"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                placeholder={MODEL_PLACEHOLDERS[deviceType] ?? "Nombre del modelo"}
                                autoComplete="off"
                            />
                            <Button type="submit" disabled={!modelName.trim() || submitting}>
                                <Plus />
                                {submitting ? "Creando..." : "Crear"}
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    {/* list of created models in this category */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Modelos en {deviceType}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                {categoryModels.length}
                            </Badge>
                        </div>

                        {categoryModels.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                Aún no hay modelos creados para {deviceType}. Escribe uno arriba y presiona &ldquo;Crear&rdquo;.
                            </div>
                        ) : (
                            <ul className="max-h-56 divide-y overflow-y-auto rounded-lg border bg-muted/20">
                                {categoryModels.map((item) => (
                                    <li
                                        key={item.id ?? `${item.deviceType}-${item.name}`}
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                                    >
                                        <span className="truncate font-medium">{item.name}</span>
                                        {onDeleteModel && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label={`Eliminar ${item.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveModel(item.id)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </FieldGroup>

                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>
                        Cerrar
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
