import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";

// initial diagnosis and reported problem card
export function OrderDiagnosisCard({ initialDiagnosis, loading = false, onSave }) {
    const [reportedProblem, setReportedProblem] = useState(initialDiagnosis?.reportedProblem ?? "");
    const [diagnosis, setDiagnosis] = useState(initialDiagnosis?.diagnosis ?? "");
    const [justSaved, setJustSaved] = useState(false);

    // sync textareas when backend diagnosis loads
    useEffect(() => {
        setReportedProblem(initialDiagnosis?.reportedProblem ?? "");
        setDiagnosis(initialDiagnosis?.diagnosis ?? "");
    }, [initialDiagnosis?.reportedProblem, initialDiagnosis?.diagnosis]);

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
                        {loading ? (
                            <Skeleton className="mt-1 h-4 w-56 rounded-md" />
                        ) : (
                            <span className="animate-in fade-in duration-500">
                                {initialDiagnosis?.updatedAt
                                    ? `Última actualización: ${formatDateTime(initialDiagnosis.updatedAt)}`
                                    : "Registra la falla reportada y la inspección inicial al recibir el equipo."}
                            </span>
                        )}
                    </CardDescription>
                    <CardAction>
                        <Button type="submit" size="sm" disabled={loading || (!isDirty && !justSaved)}>
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
                            {loading ? (
                                <Skeleton className="min-h-24 w-full rounded-md" />
                            ) : (
                                <Textarea
                                    id="reported-problem"
                                    value={reportedProblem}
                                    onChange={(e) => setReportedProblem(e.target.value)}
                                    placeholder="Ej: El equipo se cayó, no da imagen o se descarga rápido..."
                                    className="animate-in fade-in duration-500 min-h-24"
                                />
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="initial-diagnosis">Inspección / diagnóstico inicial</FieldLabel>
                            {loading ? (
                                <Skeleton className="min-h-24 w-full rounded-md" />
                            ) : (
                                <Textarea
                                    id="initial-diagnosis"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Ej: Pantalla sin respuesta táctil, consumo en fuente USB-C normal, Face ID operativo..."
                                    className="animate-in fade-in duration-500 min-h-24"
                                />
                            )}
                        </Field>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    );
}
