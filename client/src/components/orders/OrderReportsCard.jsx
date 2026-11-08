import { useState } from "react";
import { ClipboardPen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SimpleSelect } from "@/components/dashboard/SimpleSelect";
import { Textarea } from "@/components/ui/textarea";
import { TECHNICIANS } from "@/data/orders";
import { formatDateTime, getInitials } from "@/lib/format";

const reportAuthors = TECHNICIANS.filter((t) => t !== "Sin asignar");

/**
 * 2. Bitácora de informes del técnico a medida que revisa y repara el equipo.
 * Corresponde al modelo `ServiceHistory` (`server/models/serviceHistoryModel.js`).
 *
 * TODO [BACKEND - POST /api/orders/:id/reports y DELETE /api/orders/:id/reports/:reportId]:
 * - Al agregar: llamar a `addOrderReport(order.id, { description: note })`. El backend debe tomar `userId`
 *   desde el token (`req.user.id`) en lugar del selector de técnico, y guardar `action: "Informe técnico"`.
 * - Al eliminar: llamar a `deleteOrderReport(order.id, reportId)`.
 */
export function OrderReportsCard({ reports = [], defaultTechnician, onAddReport, onDeleteReport }) {
    const initialAuthor =
        defaultTechnician && defaultTechnician !== "Sin asignar"
            ? defaultTechnician
            : reportAuthors[0];

    const [author, setAuthor] = useState(initialAuthor);
    const [note, setNote] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        onAddReport({ author, note: note.trim() });
        setNote("");
    };

    return (
        <Card className="shadow-xs">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <ClipboardPen className="size-4 text-muted-foreground" />
                    Informes del técnico ({reports.length})
                </CardTitle>
                <CardDescription>
                    Bitácora cronológica de avances, pruebas y hallazgos durante la revisión.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
                {/* Formulario para agregar un nuevo informe */}
                <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Escribe el avance de la revisión (ej: se probó con batería nueva, se midió consumo en línea PPBUS_G3H...)"
                        className="min-h-20 bg-background"
                        required
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Técnico:</span>
                            <SimpleSelect
                                options={reportAuthors}
                                value={author}
                                onValueChange={setAuthor}
                                className="w-44 bg-background"
                            />
                        </div>
                        <Button type="submit" size="sm" disabled={!note.trim()}>
                            <Plus />
                            Agregar informe
                        </Button>
                    </div>
                </form>

                {/* Lista de informes */}
                {reports.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Aún no hay informes técnicos registrados para esta orden.
                    </p>
                ) : (
                    <ol className="space-y-3">
                        {reports.map((report) => (
                            <li
                                key={report.id}
                                className="group flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/20"
                            >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                    {getInitials(report.author)}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium">{report.author}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDateTime(report.createdAt)}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Eliminar informe"
                                                className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                                                onClick={() => onDeleteReport(report.id)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm whitespace-pre-line text-foreground/90">{report.note}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}
