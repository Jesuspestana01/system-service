import { Link } from "react-router-dom";
import { Calendar, Hash, Laptop, Pencil, Phone, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCedula, formatDate, formatPhone } from "@/lib/format";

// sidebar card showing equipment and customer info
export function OrderEquipmentCard({ order, customer, loading = false, onEditEquipment }) {
    return (
        <Card className="shadow-xs">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Laptop className="size-4 text-muted-foreground" />
                    Equipo ingresado
                </CardTitle>
                <CardDescription>Datos registrados en recepción</CardDescription>
                <CardAction>
                    <Button variant="outline" size="xs" onClick={onEditEquipment} disabled={loading}>
                        <Pencil />
                        Editar
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-5 w-44" />
                        </div>

                        <div className="grid gap-2.5 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Hash className="size-3.5" />
                                    Serie / IMEI
                                </span>
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Wrench className="size-3.5" />
                                    Técnico
                                </span>
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    Recibido
                                </span>
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-1.5 text-sm">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <User className="size-3.5" />
                                Cliente
                            </p>
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500 space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground">{order.deviceType}</p>
                            <p className="text-base font-semibold">{order.device}</p>
                        </div>

                        <dl className="grid gap-2.5 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <dt className="flex items-center gap-1.5 text-muted-foreground">
                                    <Hash className="size-3.5" />
                                    Serie / IMEI
                                </dt>
                                <dd className="font-mono text-xs font-medium">{order.serial}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt className="flex items-center gap-1.5 text-muted-foreground">
                                    <Wrench className="size-3.5" />
                                    Técnico
                                </dt>
                                <dd className="font-medium">{order.technician}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    Recibido
                                </dt>
                                <dd>{formatDate(order.receivedAt)}</dd>
                            </div>
                            {order.color && (
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Color</dt>
                                    <dd>{order.color}</dd>
                                </div>
                            )}
                        </dl>

                        {(order.accessories || order.physicalCondition) && (
                            <>
                                <Separator />
                                <div className="space-y-2 text-xs">
                                    {order.accessories && (
                                        <div>
                                            <p className="font-medium text-muted-foreground">Accesorios recibidos</p>
                                            <p className="text-foreground">{order.accessories}</p>
                                        </div>
                                    )}
                                    {order.physicalCondition && (
                                        <div>
                                            <p className="font-medium text-muted-foreground">Condición estética</p>
                                            <p className="text-foreground">{order.physicalCondition}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* customer details */}
                        <div className="space-y-1.5 text-sm">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <User className="size-3.5" />
                                Cliente
                            </p>
                            {order.customerId ? (
                                <Link
                                    to={`/customers/${order.customerId}`}
                                    className="font-semibold underline-offset-4 hover:underline"
                                >
                                    {order.customer}
                                </Link>
                            ) : (
                                <p className="font-semibold">{order.customer}</p>
                            )}
                            {customer && (
                                <div className="space-y-0.5 text-xs text-muted-foreground">
                                    <p>{formatCedula(customer.document)}</p>
                                    {customer.phone && (
                                        <p className="flex items-center gap-1">
                                            <Phone className="size-3" />
                                            {formatPhone(customer.phone)}
                                        </p>
                                    )}
                                    {customer.email && <p>{customer.email}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
