import { useMemo, useState } from "react";
import { AlertTriangle, DollarSign, Minus, Package, PackageX, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { ProductFormDialog } from "@/components/inventory/ProductFormDialog";
import { useCrudState, nextId } from "@/hooks/useCrudState";
import { formatCurrency } from "@/lib/format";
import { products as initialProducts, PRODUCT_CATEGORIES, getStockStatus } from "@/data/inventory";

const categoryFilterOptions = [
    { value: "all", label: "Todas las categorías" },
    ...PRODUCT_CATEGORIES.map((category) => ({ value: category, label: category })),
];

const stockFilterOptions = [
    { value: "all", label: "Todo el stock" },
    { value: "low", label: "Stock bajo" },
    { value: "out", label: "Agotados" },
];

const STOCK_BADGES = {
    ok: { label: "Disponible", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    low: { label: "Stock bajo", className: "border-amber-200 bg-amber-50 text-amber-700" },
    out: { label: "Agotado", className: "border-red-200 bg-red-50 text-red-700" },
};

const Inventory = () => {
    const crud = useCrudState(initialProducts, (items) => nextId(items, "INV"));
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return crud.items.filter((product) => {
            const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
            const matchesStock = stockFilter === "all" || getStockStatus(product) === stockFilter;
            const matchesSearch =
                !term ||
                [product.id, product.name, product.supplier].some((value) => value?.toLowerCase().includes(term));
            return matchesCategory && matchesStock && matchesSearch;
        });
    }, [crud.items, search, categoryFilter, stockFilter]);

    const stats = useMemo(
        () => ({
            total: crud.items.length,
            value: crud.items.reduce((sum, p) => sum + p.stock * p.price, 0),
            low: crud.items.filter((p) => getStockStatus(p) === "low").length,
            out: crud.items.filter((p) => getStockStatus(p) === "out").length,
        }),
        [crud.items]
    );

    const adjustStock = (product, amount) => {
        crud.update(product.id, { stock: Math.max(0, product.stock + amount) });
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Inventario"
                description="Controla los repuestos y accesorios disponibles en el taller."
                actions={
                    <Button onClick={crud.openCreate}>
                        <Plus />
                        Nuevo producto
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Productos" value={stats.total} icon={Package} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Valor del inventario" value={formatCurrency(stats.value)} icon={DollarSign} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Stock bajo" value={stats.low} hint="Por debajo del mínimo" icon={AlertTriangle} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Agotados" value={stats.out} icon={PackageX} color="bg-red-500/10 text-red-600" />
            </div>

            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de productos"
                        description={`${filteredProducts.length} de ${crud.items.length} productos`}
                        search={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Buscar producto o código..."
                    >
                        <SimpleSelect
                            options={categoryFilterOptions}
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            className="sm:w-48"
                        />
                        <SimpleSelect
                            options={stockFilterOptions}
                            value={stockFilter}
                            onValueChange={setStockFilter}
                            className="sm:w-36"
                        />
                    </DataToolbar>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-center">Stock</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 && <EmptyTableRow colSpan={7} />}
                            {filteredProducts.map((product) => {
                                const stockBadge = STOCK_BADGES[getStockStatus(product)];
                                return (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.supplier || "Sin proveedor"}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{product.category}</TableCell>
                                        <TableCell>
                                            {/* Ajuste rápido de stock */}
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon-xs"
                                                    aria-label="Restar 1"
                                                    disabled={product.stock <= 0}
                                                    onClick={() => adjustStock(product, -1)}
                                                >
                                                    <Minus />
                                                </Button>
                                                <span className="w-8 text-center font-medium tabular-nums">{product.stock}</span>
                                                <Button variant="outline" size="icon-xs" aria-label="Sumar 1" onClick={() => adjustStock(product, 1)}>
                                                    <Plus />
                                                </Button>
                                            </div>
                                            <div className="mt-0.5 text-center text-[11px] text-muted-foreground">mín. {product.minStock}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={stockBadge.className}>
                                                {stockBadge.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                        <TableCell>
                                            <RowActions onEdit={() => crud.openEdit(product)} onDelete={() => crud.requestDelete(product)} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProductFormDialog
                open={crud.form.open}
                onOpenChange={crud.setFormOpen}
                product={crud.form.item}
                onSubmit={crud.save}
            />

            <ConfirmDeleteDialog
                open={Boolean(crud.itemToDelete)}
                onOpenChange={(open) => !open && crud.cancelDelete()}
                title={`¿Eliminar "${crud.itemToDelete?.name ?? "este producto"}"?`}
                description="El producto se eliminará del inventario. Esta acción no se puede deshacer."
                onConfirm={crud.confirmDelete}
            />
        </DashboardLayout>
    );
};

export default Inventory;
