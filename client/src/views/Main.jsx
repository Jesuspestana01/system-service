import { Link } from "react-router-dom";
import { ArrowRight, Package, UserCog, Users, Wrench } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_STYLES } from "@/data/orders";
import { formatDate } from "@/lib/format";
import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import { DashboardSummary } from "@/services/dashboard.service";
import { getLastOrders } from "@/services/orders.service";

// Greeting helper based on current hour
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const Main = () => {
  // User role and name state from localStorage
  const isAdmin = localStorage.getItem("role") === "administrador";
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem("name");
    return stored && stored !== "undefined" ? stored : "";
  });

  // Fetch last 5 service orders
  const [lastOrders, setLastOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  useEffect(() => {
    const fetchLastOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await getLastOrders();
        if (data?.data) {
          setLastOrders(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch last 5 orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchLastOrders();
  }, []);

  // Fetch dashboard summary counters
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    inventory: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const data = await DashboardSummary();
        if (data) {
          setStats({
            orders: data.orders ?? 0,
            customers: data.customers ?? 0,
            inventory: data.inventory ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, []);

  // Fallback fetch for current user name if missing
  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userName && userId) {
      apiRequest(`/users/${userId}`)
        .then((res) => {
          if (res?.data?.name) {
            localStorage.setItem("name", res.data.name);
            setUserName(res.data.name);
          }
        })
        .catch(() => {});
    }
  }, [userName]);

  // Quick-access summary cards config
  const cardsContent = [
    {
      title: "Órdenes",
      description: "Órdenes de servicio",
      url: "/orders",
      icon: Wrench,
      stat: `${stats.orders} órdenes registradas`,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Clientes",
      description: "Todos los clientes",
      url: "/customers",
      icon: Users,
      stat: `${stats.customers} clientes registrados`,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Inventario",
      description: "Productos inventariados",
      url: "/inventory",
      icon: Package,
      stat: `${stats.inventory} productos con stock bajo`,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  // Formatted current date
  const today = new Date().toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Top navigation header (admin button visible only to admins) */}
      <AppHeader>
        {isAdmin && (
          <Button
            variant="secondary"
            nativeButton={false}
            render={<Link to="/employees" />}
          >
            <UserCog />
            Gestionar empleados
          </Button>
        )}
      </AppHeader>
      <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-12">
        {/* Date and user greeting */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {today}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {getGreeting()}
            {userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-muted-foreground">¿Qué quieres gestionar hoy?</p>
        </div>

        {/* Summary cards grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {cardsContent.map((content) => {
            const Icon = content.icon;
            return (
              <Link key={content.title} to={content.url} className="group">
                <Card className="h-full bg-gradient-to-t from-primary/5 to-card py-8 text-center shadow-xs transition-all group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-foreground/20">
                  <CardHeader className="justify-items-center gap-2">
                    <div
                      className={`mb-2 flex size-12 items-center justify-center rounded-full ${content.color}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                      {content.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground/70">
                      {content.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex min-h-5 items-center justify-center text-sm font-medium">
                    {/* Skeleton while loading summary, smooth fade-in when ready */}
                    {loadingSummary ? (
                      <Skeleton className="h-5 w-40 rounded-md" />
                    ) : (
                      <span className="relative animate-in fade-in duration-500">
                        {content.stat}
                        <ArrowRight className="absolute top-1/2 -right-5 size-4 -translate-y-1/2 opacity-0 transition-all group-hover:-right-6 group-hover:opacity-100" />
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent 5 orders table */}
        <Card className="shadow-xs">
          <CardHeader className="grid-cols-[1fr_auto] items-center">
            <div>
              <CardTitle className="text-lg font-semibold">
                Órdenes recientes
              </CardTitle>
              <CardDescription>
                Últimos equipos ingresados al servicio técnico
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link to="/orders" />}
            >
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
                {/* Loading skeleton rows */}
                {loadingOrders ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : Array.isArray(lastOrders) && lastOrders.length > 0 ? (
                  /* Loaded order rows */
                  lastOrders.map((order, index) => (
                    <TableRow
                      key={order?.id ?? index}
                      className="animate-in fade-in duration-500"
                    >
                      <TableCell className="font-medium">
                        <Link
                          to={`/orders/${order?.orderNumber ?? ""}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {order?.orderNumber ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {`${order?.client?.name ?? ""} ${order?.client?.lastName ?? ""}`.trim() ||
                          "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {`${order?.equipment?.deviceType ?? ""} ${order?.equipment?.model ?? ""}`.trim() ||
                          "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={ORDER_STATUS_STYLES?.[order?.status] ?? ""}
                        >
                          {order?.status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(order?.receivedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  /* Empty state row */
                  <TableRow className="animate-in fade-in duration-500">
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay órdenes recientes registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Main;
