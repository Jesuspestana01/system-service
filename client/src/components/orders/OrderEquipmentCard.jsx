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
import { formatDate } from "@/lib/format";

/**
 * 4. Tarjeta lateral con los datos del equipo ingresado y del cliente,
 * con botón "Editar equipo" por si hubo alguna equivocación al recibirlo.
 */
export function OrderEquipmentCard({ order, customer, onEditEquipment }) {
    return (
        <Card className="shadow-xs">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Laptop className="size-4 text-muted-foreground" />
                    Equipo ingresado
                </CardTitle>
                <CardDescription>Datos registrados en recepción</CardDescription>
                <CardAction>
                    <Button variant="outline" size="xs" onClick={onEditEquipment}>
                        <Pencil />
                        Editar
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent className="space-y-4">
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

                {/* Datos del cliente */}
                <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <User className="size-3.5" />
                        Cliente
                    </p>
                    <p className="font-semibold">{order.customer}</p>
                    {customer && (
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                            <p>{customer.document}</p>
                            {customer.phone && (
                                <p className="flex items-center gap-1">
                                    <Phone className="size-3" />
                                    {customer.phone}
                                </p>
                            )}
                            {customer.email && <p>{customer.email}</p>}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
