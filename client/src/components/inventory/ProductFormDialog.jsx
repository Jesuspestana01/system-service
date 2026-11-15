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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { PRODUCT_CATEGORIES } from "@/data/inventory";

const TRACK_STOCK_OPTIONS = [
    { value: "true", label: "Con rastreo de stock (Repuesto / Accesorio)" },
    { value: "false", label: "Sin rastreo de stock (Asesoría / Servicio)" },
];

// dialog to create or edit an inventory product or service
export function ProductFormDialog({ open, onOpenChange, product, onSubmit }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <ProductForm key={product?.id ?? "new"} product={product} onSubmit={onSubmit} />
            </DialogContent>
        </Dialog>
    );
}

function ProductForm({ product, onSubmit }) {
    const isEditing = Boolean(product);
    const [trackStock, setTrackStock] = useState(
        product ? product.trackStock !== false : true
    );
    const [category, setCategory] = useState(
        product?.category ?? PRODUCT_CATEGORIES[0]
    );
    const [submitting, setSubmitting] = useState(false);

    // switch default category when toggling stock tracking
    const handleTrackStockChange = (val) => {
        const nextTrack = val === "true";
        setTrackStock(nextTrack);
        if (!nextTrack && category === PRODUCT_CATEGORIES[0]) {
            setCategory("Servicios");
        }
    };

    // submit product form data
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = Object.fromEntries(new FormData(e.currentTarget));
            await onSubmit({
                ...data,
                category,
                sku: product?.sku,
                trackStock,
                stock: trackStock ? Number(data.stock) || 0 : 0,
                minStock: trackStock ? Number(data.minStock) || 0 : 0,
                price: Number(data.price) || 0,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
                <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? "Actualiza la información, precio y rastreo de existencias del producto."
                        : "Agrega un repuesto con stock o un concepto sin rastreo (ej. Asesoría)."}
                </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-4">
                {/* stock tracking selector */}
                <Field>
                    <FieldLabel htmlFor="product-track-stock">Tipo de control de inventario</FieldLabel>
                    <SimpleSelect
                        id="product-track-stock"
                        options={TRACK_STOCK_OPTIONS}
                        value={String(trackStock)}
                        onValueChange={handleTrackStockChange}
                    />
                    {!trackStock && (
                        <FieldDescription>
                            Este concepto no descontará unidades ni generará alertas de bajo stock.
                        </FieldDescription>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="product-name">Nombre del producto o servicio</FieldLabel>
                    <Input
                        id="product-name"
                        name="name"
                        defaultValue={product?.name}
                        placeholder={
                            trackStock
                                ? "Ej: Pantalla iPhone 13"
                                : "Ej: Asesoría técnica, Diagnóstico especializado..."
                        }
                        required
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="product-category">Categoría</FieldLabel>
                        <SimpleSelect
                            id="product-category"
                            name="category"
                            options={PRODUCT_CATEGORIES}
                            value={category}
                            onValueChange={setCategory}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="product-supplier">Proveedor / Responsable</FieldLabel>
                        <Input
                            id="product-supplier"
                            name="supplier"
                            defaultValue={product?.supplier}
                            placeholder="Opcional"
                        />
                    </Field>
                </div>

                {trackStock ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
                            <Input
                                id="product-stock"
                                name="stock"
                                type="number"
                                min="0"
                                defaultValue={product?.stock ?? 0}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-min-stock">Stock mínimo</FieldLabel>
                            <Input
                                id="product-min-stock"
                                name="minStock"
                                type="number"
                                min="0"
                                defaultValue={product?.minStock ?? 1}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-price">Precio ($)</FieldLabel>
                            <Input
                                id="product-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={product?.price ?? ""}
                                placeholder="0.00"
                                required
                            />
                        </Field>
                    </div>
                ) : (
                    <Field>
                        <FieldLabel htmlFor="product-price">Precio ($)</FieldLabel>
                        <Input
                            id="product-price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={product?.price ?? ""}
                            placeholder="0.00"
                            required
                        />
                    </Field>
                )}
            </FieldGroup>

            <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                <Button type="submit" disabled={submitting}>
                    {submitting
                        ? "Guardando..."
                        : isEditing
                          ? "Guardar cambios"
                          : "Agregar producto"}
                </Button>
            </DialogFooter>
        </form>
    );
}
