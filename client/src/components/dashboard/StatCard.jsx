import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// summary metric card with skeleton loading state and smooth fade-in transition
export function StatCard({
    title,
    value,
    hint,
    icon: Icon,
    color = "bg-primary/10 text-primary",
    loading = false,
}) {
    return (
        <Card className="shadow-xs">
            <CardContent className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <div className="flex min-h-8 items-center">
                        {loading ? (
                            <Skeleton className="h-7 w-16 rounded-md" />
                        ) : (
                            <p className="animate-in fade-in duration-500 text-2xl font-bold tracking-tight">
                                {value}
                            </p>
                        )}
                    </div>
                    {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
                </div>
                {Icon && (
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", color)}>
                        <Icon className="size-5" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
