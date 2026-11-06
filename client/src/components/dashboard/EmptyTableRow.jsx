import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyTableRow({ colSpan, message = "No se encontraron resultados." }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {message}
            </TableCell>
        </TableRow>
    );
}
