import { useState } from "react";
import { Package, Plus, Receipt, Trash2, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { ProductFormDialog } from "@/components/inventory/ProductFormDialog";
import { calculateOrderTotals } from "@/data/orders";
import { clampPercent, formatCurrency } from "@/lib/format";

/**
 * 3. Apartado de cobros y presupuesto de la orden:
 * - Permite agregar repuestos existentes del inventario (`products`).
 * - Permite crear un producto nuevo en el inventario en el momento y agregarlo al cobro.
 * - Permite crear un servicio / mano de obra personalizado para la orden.
 * - Permite editar cantidad, precio unitario y % de descuento por línea, más un % de descuento global.
 *
 * TODO [BACKEND - UsedPart / Inventory / ServiceOrder]:
 * - Agregar del inventario: `POST /api/orders/:id/items` -> crea registro en `used_parts`, descuenta stock en `inventory`
 *   y registra `inventory_movements` (`movementType: 'salida'`).
 * - Crear producto e incluirlo: primero `POST /api/inventory` y luego `POST /api/orders/:id/items`.
 * - Editar cantidad / precio / % descuento por línea: `PATCH /api/orders/:id/items/:itemId`.
 * - Eliminar línea: `DELETE /api/orders/:id/items/:itemId` (si era de inventario, devolver stock).
 * - Cambiar % de descuento global: `PATCH /api/orders/:id/billing` y actualizar `ServiceOrder.finalCost`.
 */
export function OrderBillingCard({
    billing = { discountPercent: 0, items: [] },
    products = [],
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    onDiscountChange,
    onCreateInventoryProduct,
}) {
    const availableProducts = products.filter((p) => p.stock > 0);
    const [selectedProductId, setSelectedProductId] = useState(availableProducts[0]?.id ?? "");
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [newProductDialogOpen, setNewProductDialogOpen] = useState(false);

    const activeProductId = availableProducts.some((p) => p.id === selectedProductId)
        ? selectedProductId
        : (availableProducts[0]?.id ?? "");

    const productOptions = availableProducts.map((p) => ({
        value: p.id,
        label: `${p.name} · ${formatCurrency(p.price)} (${p.stock} disp.)`,
    }));

    const handleAddFromInventory = () => {
        const product = products.find((p) => p.id === activeProductId);
        if (!product) return;
        onAddItem({
            type: "inventory",
            inventoryItemId: product.id,
            code: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: product.price,
            discountPercent: 0,
        });
    };

    const handleCreateService = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        onAddItem({
            type: "service",
            inventoryItemId: null,
            code: "SERVICIO",
            name: data.name.trim(),
            quantity: Math.max(1, Number(data.quantity) || 1),
            unitPrice: Math.max(0, Number(data.unitPrice) || 0),
            discountPercent: clampPercent(data.discountPercent),
        });
        setServiceDialogOpen(false);
    };

    const handleCreateProductAndAdd = (productData) => {
        const created = onCreateInventoryProduct(productData);
        onAddItem({
            type: "inventory",
            inventoryItemId: created.id,
            code: created.id,
            name: created.name,
            quantity: 1,
            unitPrice: created.price,
            discountPercent: 0,
        });
        setSelectedProductId(created.id);
        setNewProductDialogOpen(false);
    };

    const totals = calculateOrderTotals(billing);

    return (
        <>
            <Card className="shadow-xs">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Receipt className="size-4 text-muted-foreground" />
                        Presupuesto y cobros
                    </CardTitle>
                    <CardDescription>
                        Agrega repuestos del inventario o cargos por mano de obra y aplica descuentos por línea o globales.
                    </CardDescription>
                    <CardAction className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setNewProductDialogOpen(true)}>
                            <Package />
                            Crear repuesto
                        </Button>
                        <Button type="button" size="sm" onClick={() => setServiceDialogOpen(true)}>
                            <Wrench />
                            Agregar servicio / cargo
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-5 pt-4">
                    {/* Selector rápido para agregar desde el inventario existente */}
                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center">
                        <span className="text-xs font-medium text-muted-foreground sm:shrink-0">
                            Usar del inventario:
                        </span>
                        {productOptions.length > 0 ? (
                            <>
                                <SimpleSelect
                                    options={productOptions}
                                    value={activeProductId}
                                    onValueChange={setSelectedProductId}
                                    className="min-w-0 flex-1 bg-background"
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={handleAddFromInventory}>
                                    <Plus />
                                    Agregar a la orden
                                </Button>
                            </>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                No hay productos con stock disponible. Puedes crear uno nuevo con &ldquo;Crear repuesto&rdquo;.
                            </p>
                        )}
                    </div>

                    {/* Tabla de líneas a cobrar */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead className="w-24 text-center">Cant.</TableHead>
                                <TableHead className="w-32 text-right">P. unitario ($)</TableHead>
                                <TableHead className="w-28 text-right">Desc. (%)</TableHead>
                                <TableHead className="w-28 text-right">Subtotal</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billing.items.length === 0 && (
                                <EmptyTableRow
                                    colSpan={6}
                                    message="Aún no hay repuestos ni servicios cargados en esta orden."
                                />
                            )}
                            {billing.items.map((item) => {
                                const lineGross = item.quantity * item.unitPrice;
                                const lineNet = lineGross * (1 - (Number(item.discountPercent) || 0) / 100);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                                                    {item.type === "inventory" ? "Inventario" : "Servicio"}
                                                </Badge>
                                                <span className="font-mono">{item.code}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                aria-label={`Cantidad de ${item.name}`}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    onUpdateItem(item.id, {
                                                        quantity: Math.max(1, Number(e.target.value) || 1),
                                                    })
                                                }
                                                className="h-7 px-1.5 text-center tabular-nums"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                aria-label={`Precio unitario de ${item.name}`}
                                                value={item.unitPrice}
                                                onChange={(e) =>
                                                    onUpdateItem(item.id, {
                                                        unitPrice: Math.max(0, Number(e.target.value) || 0),
                                                    })
                                                }
                                                className="h-7 px-2 text-right tabular-nums"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                aria-label={`Descuento en % para ${item.name}`}
                                                value={item.discountPercent}
                                                onChange={(e) =>
                                                    onUpdateItem(item.id, {
                                                        discountPercent: clampPercent(e.target.value),
                                                    })
                                                }
                                                className="h-7 px-2 text-right tabular-nums"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            <div>{formatCurrency(lineNet)}</div>
                                            {item.discountPercent > 0 && (
                                                <div className="text-[11px] text-muted-foreground line-through">
                                                    {formatCurrency(lineGross)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label={`Quitar ${item.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {/* Resumen de totales y descuento global */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal bruto</span>
                                <span className="tabular-nums">{formatCurrency(totals.grossSubtotal)}</span>
                            </div>

                            {totals.lineDiscountTotal > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Descuentos por línea</span>
                                    <span className="tabular-nums">−{formatCurrency(totals.lineDiscountTotal)}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor="global-discount" className="text-muted-foreground">
                                    Descuento general (%)
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="global-discount"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={billing.discountPercent}
                                        onChange={(e) => onDiscountChange(clampPercent(e.target.value))}
                                        className="h-7 w-20 bg-background text-right tabular-nums"
                                    />
                                    {totals.globalDiscountAmount > 0 && (
                                        <span className="text-xs text-emerald-600 tabular-nums">
                                            (−{formatCurrency(totals.globalDiscountAmount)})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-baseline justify-between pt-1">
                                <span className="text-base font-semibold">Total a cobrar</span>
                                <span className="text-2xl font-bold tracking-tight tabular-nums">
                                    {formatCurrency(totals.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal para crear un servicio / cargo personalizado */}
            <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateService} className="grid gap-4">
                        <DialogHeader>
                            <DialogTitle>Agregar servicio o cargo</DialogTitle>
                            <DialogDescription>
                                Crea un concepto personalizado para cobrar en esta orden (mano de obra, microsoldadura, revisión, etc.).
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel htmlFor="service-name">Descripción del servicio / producto</FieldLabel>
                                <Input
                                    id="service-name"
                                    name="name"
                                    placeholder="Ej: Mano de obra cambio de IC de carga Tristar"
                                    required
                                />
                            </Field>
                            <div className="grid grid-cols-3 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="service-qty">Cantidad</FieldLabel>
                                    <Input id="service-qty" name="quantity" type="number" min="1" defaultValue={1} required />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="service-price">Precio ($)</FieldLabel>
                                    <Input
                                        id="service-price"
                                        name="unitPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="service-discount">Desc. (%)</FieldLabel>
                                    <Input id="service-discount" name="discountPercent" type="number" min="0" max="100" defaultValue={0} />
                                </Field>
                            </div>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                            <Button type="submit">Agregar cargo</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal reutilizado de Inventario para crear un repuesto nuevo y sumarlo a la orden */}
            <ProductFormDialog
                open={newProductDialogOpen}
                onOpenChange={setNewProductDialogOpen}
                product={null}
                onSubmit={handleCreateProductAndAdd}
            />
        </>
    );
}
