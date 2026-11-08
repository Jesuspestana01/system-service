import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORDER_STATUSES, ORDER_STATUS_STYLES } from "@/data/orders";
import { cn } from "@/lib/utils";

/**
 * 5. Botón desplegable para cambiar el estado de la orden de servicio.
 * TODO [BACKEND - PATCH /api/orders/:id/status]:
 * `onStatusChange` debe llamar a `updateOrderStatus(order.id, newStatus)` en `src/services/orders.service.js`,
 * que actualiza `ServiceOrder.status` y crea un registro de cambio de estado en `ServiceHistory`.
 */
export function OrderStatusDropdown({ status, onStatusChange }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="outline"
                        className={cn("font-semibold", ORDER_STATUS_STYLES[status])}
                    />
                }
            >
                <span className="size-2 rounded-full bg-current" />
                Estado: {status}
                <ChevronDown className="size-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Cambiar estado de servicio</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={status} onValueChange={onStatusChange}>
                    {ORDER_STATUSES.map((option) => (
                        <DropdownMenuRadioItem key={option} value={option} closeOnClick>
                            {option}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
