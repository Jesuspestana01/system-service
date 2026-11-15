import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataToolbar } from "@/components/dashboard/DataToolbar";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { RowActions } from "@/components/dashboard/RowActions";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { ProductFormDialog } from "@/components/inventory/ProductFormDialog";
import { formatCurrency } from "@/lib/format";
import { getRolePermissions } from "@/lib/permissions";
import { PRODUCT_CATEGORIES, getStockStatus } from "@/data/inventory";
import {
    adjustProductStock,
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from "@/services/inventory.service";

// category filter options for toolbar
const categoryFilterOptions = [
    { value: "all", label: "Todas las categorías" },
    ...PRODUCT_CATEGORIES.map((category) => ({ value: category, label: category })),
];

// stock level filter options for toolbar
const stockFilterOptions = [
    { value: "all", label: "Todo el stock" },
    { value: "low", label: "Stock bajo" },
    { value: "out", label: "Agotados" },
];

// badge styles for stock status
const STOCK_BADGES = {
    ok: { label: "Disponible", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    low: { label: "Stock bajo", className: "border-amber-200 bg-amber-50 text-amber-700" },
    out: { label: "Agotado", className: "border-red-200 bg-red-50 text-red-700" },
};

const Inventory = () => {
    // only administrators can create, edit, adjust stock or delete products
    const { canManageInventory: isAdmin } = getRolePermissions();

    // products and ui state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [formState, setFormState] = useState({ open: false, item: null });
    const [itemToDelete, setItemToDelete] = useState(null);

    // load inventory products from api on mount
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await getProducts();
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("failed to fetch inventory:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // filter products by search term, category and stock status
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((product) => {
            const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
            const matchesStock = stockFilter === "all" || getStockStatus(product) === stockFilter;
            const matchesSearch =
                !term ||
                [product.code, String(product.id), product.name, product.supplier].some((value) =>
                    String(value ?? "").toLowerCase().includes(term)
                );
            return matchesCategory && matchesStock && matchesSearch;
        });
    }, [products, search, categoryFilter, stockFilter]);

    // compute inventory summary metrics
    const stats = useMemo(
        () => ({
            total: products.length,
            value: products.reduce((sum, p) => sum + p.stock * p.price, 0),
            low: products.filter((p) => getStockStatus(p) === "low").length,
            out: products.filter((p) => getStockStatus(p) === "out").length,
        }),
        [products]
    );

    // open modal to create product
    const openCreate = () => setFormState({ open: true, item: null });

    // open modal to edit product
    const openEdit = (product) => setFormState({ open: true, item: product });

    // create or update product in api
    const handleSave = async (data) => {
        if (formState.item) {
            const updated = await updateProduct(formState.item.id, data);
            if (updated) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === formState.item.id ? updated : p))
                );
            }
            setFormState({ open: false, item: null });
            return;
        }

        const created = await createProduct(data);
        if (created) {
            setProducts((prev) => [created, ...prev]);
            setFormState({ open: false, item: null });
        }
    };

    // adjust product stock with - / + buttons and persist to api
    const adjustStock = async (product, amount) => {
        const nextStock = Math.max(0, product.stock + amount);
        setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, stock: nextStock } : p))
        );
        try {
            const updated = await adjustProductStock(product.id, amount, nextStock);
            if (updated) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === product.id ? updated : p))
                );
            }
        } catch (error) {
            console.error("failed to adjust stock:", error);
        }
    };

    // delete product from api and remove from state
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const target = itemToDelete;
        setItemToDelete(null);
        try {
            await deleteProduct(target.id);
            setProducts((prev) => prev.filter((p) => p.id !== target.id));
        } catch (error) {
            console.error("failed to delete product:", error);
        }
    };

    return (
        <DashboardLayout>
            {/* header and new product button (admin only) */}
            <PageHeader
                title="Inventario"
                description="Controla los repuestos y accesorios disponibles en el taller."
                actions={
                    isAdmin && (
                        <Button onClick={openCreate}>
                            <Plus />
                            Nuevo producto
                        </Button>
                    )
                }
            />

            {/* inventory stat cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Productos" value={stats.total} loading={loading} icon={Package} color="bg-blue-500/10 text-blue-600" />
                <StatCard title="Valor del inventario" value={formatCurrency(stats.value)} loading={loading} icon={DollarSign} color="bg-emerald-500/10 text-emerald-600" />
                <StatCard title="Stock bajo" value={stats.low} loading={loading} hint="Por debajo del mínimo" icon={AlertTriangle} color="bg-amber-500/10 text-amber-600" />
                <StatCard title="Agotados" value={stats.out} loading={loading} icon={PackageX} color="bg-red-500/10 text-red-600" />
            </div>

            {/* products table */}
            <Card className="shadow-xs">
                <CardHeader>
                    <DataToolbar
                        title="Listado de productos"
                        description={`${filteredProducts.length} de ${products.length} productos`}
                        loading={loading}
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
                                {isAdmin && <TableHead className="w-10" />}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* loading skeleton rows */}
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                                        {isAdmin && <TableCell><Skeleton className="h-6 w-6 rounded-md" /></TableCell>}
                                    </TableRow>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <EmptyTableRow colSpan={isAdmin ? 7 : 6} />
                            ) : (
                                filteredProducts.map((product) => {
                                    const stockBadge = STOCK_BADGES[getStockStatus(product)];
                                    return (
                                        <TableRow key={product.id} className="animate-in fade-in duration-500">
                                            <TableCell className="font-mono font-medium">
                                                {product.code || product.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground">{product.supplier || "Sin proveedor"}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{product.category}</TableCell>
                                            <TableCell>
                                                {/* quick stock adjustment buttons (admin only) */}
                                                <div className="flex items-center justify-center gap-1">
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon-xs"
                                                            aria-label="Restar 1"
                                                            disabled={product.stock <= 0}
                                                            onClick={() => adjustStock(product, -1)}
                                                        >
                                                            <Minus />
                                                        </Button>
                                                    )}
                                                    <span className="w-8 text-center font-medium tabular-nums">{product.stock}</span>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon-xs"
                                                            aria-label="Sumar 1"
                                                            onClick={() => adjustStock(product, 1)}
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 text-center text-[11px] text-muted-foreground">mín. {product.minStock}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={stockBadge.className}>
                                                    {stockBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{formatCurrency(product.price)}</TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <RowActions
                                                        onEdit={() => openEdit(product)}
                                                        onDelete={() => setItemToDelete(product)}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* create/edit and delete dialogs (admin only) */}
            {isAdmin && (
                <>
                    <ProductFormDialog
                        open={formState.open}
                        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
                        product={formState.item}
                        onSubmit={handleSave}
                    />

                    <ConfirmDeleteDialog
                        open={Boolean(itemToDelete)}
                        onOpenChange={(open) => !open && setItemToDelete(null)}
                        title={`¿Eliminar "${itemToDelete?.name ?? "este producto"}"?`}
                        description="El producto se eliminará del inventario. Esta acción no se puede deshacer."
                        onConfirm={handleConfirmDelete}
                    />
                </>
            )}
        </DashboardLayout>
    );
};

export default Inventory;
