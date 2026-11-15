import { useEffect, useState } from "react";
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
import { getTechnicians } from "@/services/auth.service";

const fallbackAuthors = TECHNICIANS.filter((t) => t !== "Sin asignar");

// technician reports log card linked to service history
export function OrderReportsCard({ reports = [], defaultTechnician, onAddReport, onDeleteReport }) {
    const [authors, setAuthors] = useState(fallbackAuthors);
    const [author, setAuthor] = useState(
        defaultTechnician && defaultTechnician !== "Sin asignar"
            ? defaultTechnician
            : fallbackAuthors[0]
    );
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // load active technicians from api for author selector
    useEffect(() => {
        getTechnicians()
            .then((list) => {
                if (Array.isArray(list) && list.length > 0) {
                    const names = list.map((u) => `${u.name ?? ""} ${u.lastName ?? ""}`.trim());
                    setAuthors(names);
                    if (defaultTechnician && defaultTechnician !== "Sin asignar" && names.includes(defaultTechnician)) {
                        setAuthor(defaultTechnician);
                    } else {
                        setAuthor(names[0]);
                    }
                }
            })
            .catch(() => {});
    }, [defaultTechnician]);

    // submit new technician report
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim() || submitting) return;
        setSubmitting(true);
        try {
            await onAddReport({ author, note: note.trim() });
            setNote("");
        } finally {
            setSubmitting(false);
        }
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
                {/* form to add a new report */}
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
                                options={authors}
                                value={author}
                                onValueChange={setAuthor}
                                className="w-44 bg-background"
                            />
                        </div>
                        <Button type="submit" size="sm" disabled={!note.trim() || submitting}>
                            <Plus />
                            {submitting ? "Agregando..." : "Agregar informe"}
                        </Button>
                    </div>
                </form>

                {/* chronological list of reports */}
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
                                            {onDeleteReport && (
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
                                            )}
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
