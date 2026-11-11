import { Link } from "react-router-dom";
import {
    ArrowRight,
    Package,
    UserCog,
    Users,
    Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AppHeader } from "@/components/layout/AppHeader";
import { orders, ORDER_STATUS_STYLES } from "@/data/orders";
import { formatDate } from "@/lib/format";

// TODO [BACKEND - GET /api/auth/me]: obtener el nombre del usuario autenticado desde la sesión (`User.name`)
const userName = localStorage.getItem("name")
console.log(userName)

// TODO [BACKEND - GET /api/dashboard/summary]:
// Reemplazar `stat` por contadores reales desde el backend (`ServiceOrder.count`, `Client.count`, `Inventory.count`).
const cardsContent = [
    {
        title: "Órdenes",
        description: "Órdenes de servicio",
        url: "/orders",
        icon: Wrench,
        stat: "6 órdenes abiertas",
        color: "bg-blue-500/10 text-blue-600",
    },
    {
        title: "Clientes",
        description: "Todos los clientes",
        url: "/customers",
        icon: Users,
        stat: "6 clientes registrados",
        color: "bg-emerald-500/10 text-emerald-600",
    },
    {
        title: "Inventario",
        description: "Productos inventariados",
        url: "/inventory",
        icon: Package,
        stat: "8 productos con stock bajo",
        color: "bg-amber-500/10 text-amber-600",
    },
];

// TODO [BACKEND - GET /api/orders?limit=5]: cargar las últimas 5 órdenes de servicio reales
const recentOrders = orders.slice(0, 5);

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
};

const Main = () => {
    const isAdmin = localStorage.getItem("role") === "administrador";

    const today = new Date().toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <>
        <AppHeader>
            {isAdmin && (
                <Button variant="secondary" nativeButton={false} render={<Link to="/employees" />}>
                    <UserCog />
                    Gestionar empleados
                </Button>
            )}
        </AppHeader>
            <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-12">
                {/* Saludo */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground first-letter:uppercase">{today}</p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        {getGreeting()}, {userName}
                    </h1>
                    <p className="text-muted-foreground">¿Qué quieres gestionar hoy?</p>
                </div>

                {/* Accesos principales */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {cardsContent.map((content) => {
                        const Icon = content.icon;
                        return (
                            <Link key={content.title} to={content.url} className="group">
                                <Card className="h-full bg-gradient-to-t from-primary/5 to-card py-8 text-center shadow-xs transition-all group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-foreground/20">
                                    <CardHeader className="justify-items-center gap-2">
                                        <div className={`mb-2 flex size-12 items-center justify-center rounded-full ${content.color}`}>
                                            <Icon className="size-6" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold tracking-tight">
                                            {content.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground/70">
                                            {content.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm font-medium">
                                        <span className="relative">
                                            {content.stat}
                                            <ArrowRight className="absolute top-1/2 -right-5 size-4 -translate-y-1/2 opacity-0 transition-all group-hover:-right-6 group-hover:opacity-100" />
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Órdenes recientes */}
                <Card className="shadow-xs">
                    <CardHeader className="grid-cols-[1fr_auto] items-center">
                        <div>
                            <CardTitle className="text-lg font-semibold">Órdenes recientes</CardTitle>
                            <CardDescription>Últimos equipos ingresados al servicio técnico</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/orders" />}>
                            Ver todas
                            <ArrowRight />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Orden</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="text-primary underline-offset-4 hover:underline"
                                            >
                                                {order.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell className="text-muted-foreground">{order.device}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={ORDER_STATUS_STYLES[order.status]}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatDate(order.receivedAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </>
    );
};

export default Main;
