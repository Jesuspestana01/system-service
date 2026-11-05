import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    GalleryVerticalEnd,
    LogOut,
    Package,
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

// TODO: reemplazar con datos reales del backend / sesión
const userName = "Jesús";

const cardsContent = [
    {
        title: "Órdenes",
        description: "Órdenes de servicio",
        url: "/orders",
        icon: Wrench,
        stat: "12 órdenes abiertas",
        color: "bg-blue-500/10 text-blue-600",
    },
    {
        title: "Clientes",
        description: "Todos los clientes",
        url: "/customers",
        icon: Users,
        stat: "248 clientes registrados",
        color: "bg-emerald-500/10 text-emerald-600",
    },
    {
        title: "Inventario",
        description: "Productos inventariados",
        url: "/inventory",
        icon: Package,
        stat: "5 productos con stock bajo",
        color: "bg-amber-500/10 text-amber-600",
    },
];

const recentOrders = [
    { id: "OS-1042", customer: "María González", device: "Laptop HP Pavilion 15", status: "Recibido", date: "05/11/2026" },
    { id: "OS-1041", customer: "Carlos Pérez", device: "iPhone 13", status: "En reparación", date: "04/11/2026" },
    { id: "OS-1040", customer: "Ana Rodríguez", device: "Samsung Galaxy S22", status: "Listo", date: "04/11/2026" },
    { id: "OS-1039", customer: "Luis Martínez", device: "PC Escritorio Dell", status: "En reparación", date: "03/11/2026" },
    { id: "OS-1038", customer: "Sofía Herrera", device: "iPad Air", status: "Entregado", date: "02/11/2026" },
];

const statusStyles = {
    "Recibido": "border-blue-200 bg-blue-50 text-blue-700",
    "En reparación": "border-amber-200 bg-amber-50 text-amber-700",
    "Listo": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Entregado": "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
};

const Main = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    const today = new Date().toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <section className="min-h-svh bg-muted/30">
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <nav className="flex h-16 items-center justify-between px-4 md:px-8">
                    <Link to="/main" className="flex items-center gap-2 font-medium">
                        <img className="h-15" src="system-service-logo.png"/>
                    </Link>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut />
                        Cerrar sesión
                    </Button>
                </nav>
            </header>

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
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell className="text-muted-foreground">{order.device}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusStyles[order.status]}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{order.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </section>
    );
};

export default Main;
