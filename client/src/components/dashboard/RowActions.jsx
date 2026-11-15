import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// row action menu; hides edit or delete items when handlers are omitted
export function RowActions({ onEdit, onDelete, children }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Abrir acciones" />}>
                <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                        <Pencil />
                        Editar
                    </DropdownMenuItem>
                )}
                {children}
                {onDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={onDelete}>
                            <Trash2 />
                            Eliminar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
