import { useState } from "react";
import { Check, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";

/**
 * 1. Diagnóstico inicial al recibir el equipo.
 * Corresponde a `ServiceOrder.reportedProblem` (falla que indica el cliente) y
 * `ServiceOrder.diagnosis` (evaluación inicial al recibirlo en recepción/banco).
 *
 * TODO [BACKEND - PATCH /api/orders/:id/diagnosis]:
 * Al guardar, llamar a `updateOrderDiagnosis(order.id, { reportedProblem, diagnosis })`
 * en `src/services/orders.service.js`.
 */
export function OrderDiagnosisCard({ initialDiagnosis, onSave }) {
    const [reportedProblem, setReportedProblem] = useState(initialDiagnosis?.reportedProblem ?? "");
    const [diagnosis, setDiagnosis] = useState(initialDiagnosis?.diagnosis ?? "");
    const [justSaved, setJustSaved] = useState(false);

    const isDirty =
        reportedProblem !== (initialDiagnosis?.reportedProblem ?? "") ||
        diagnosis !== (initialDiagnosis?.diagnosis ?? "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            reportedProblem: reportedProblem.trim(),
            diagnosis: diagnosis.trim(),
        });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
    };

    return (
        <Card className="shadow-xs">
            <form onSubmit={handleSubmit} className="contents">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Stethoscope className="size-4 text-muted-foreground" />
                        Diagnóstico inicial de recepción
                    </CardTitle>
                    <CardDescription>
                        {initialDiagnosis?.updatedAt
                            ? `Última actualización: ${formatDateTime(initialDiagnosis.updatedAt)}`
                            : "Registra la falla reportada y la inspección inicial al recibir el equipo."}
                    </CardDescription>
                    <CardAction>
                        <Button type="submit" size="sm" disabled={!isDirty && !justSaved}>
                            {justSaved ? (
                                <>
                                    <Check />
                                    Guardado
                                </>
                            ) : (
                                "Guardar diagnóstico"
                            )}
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="pt-4">
                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="reported-problem">Falla reportada por el cliente</FieldLabel>
                            <Textarea
                                id="reported-problem"
                                value={reportedProblem}
                                onChange={(e) => setReportedProblem(e.target.value)}
                                placeholder="Ej: El equipo se cayó, no da imagen o se descarga rápido..."
                                className="min-h-24"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="initial-diagnosis">Inspección / diagnóstico inicial</FieldLabel>
                            <Textarea
                                id="initial-diagnosis"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Ej: Pantalla sin respuesta táctil, consumo en fuente USB-C normal, Face ID operativo..."
                                className="min-h-24"
                            />
                        </Field>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    );
}
