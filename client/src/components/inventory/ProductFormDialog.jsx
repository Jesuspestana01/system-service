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
import { PRODUCT_CATEGORIES } from "@/data/inventory";

export function ProductFormDialog({ open, onOpenChange, product, onSubmit }) {
    const isEditing = Boolean(product);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        onSubmit({
            ...data,
            stock: Number(data.stock) || 0,
            minStock: Number(data.minStock) || 0,
            price: Number(data.price) || 0,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <form key={product?.id ?? "new"} onSubmit={handleSubmit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Actualiza la información y existencias del producto."
                                : "Agrega un repuesto o accesorio al inventario."}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel htmlFor="product-name">Nombre del producto</FieldLabel>
                            <Input id="product-name" name="name" defaultValue={product?.name} placeholder="Ej: Pantalla iPhone 13" required />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="product-category">Categoría</FieldLabel>
                                <SimpleSelect
                                    id="product-category"
                                    name="category"
                                    options={PRODUCT_CATEGORIES}
                                    defaultValue={product?.category ?? PRODUCT_CATEGORIES[0]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-supplier">Proveedor</FieldLabel>
                                <Input id="product-supplier" name="supplier" defaultValue={product?.supplier} placeholder="Opcional" />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field>
                                <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
                                <Input id="product-stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-min-stock">Stock mínimo</FieldLabel>
                                <Input id="product-min-stock" name="minStock" type="number" min="0" defaultValue={product?.minStock ?? 1} required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-price">Precio ($)</FieldLabel>
                                <Input id="product-price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} placeholder="0.00" required />
                            </Field>
                        </div>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                        <Button type="submit">{isEditing ? "Guardar cambios" : "Agregar producto"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
