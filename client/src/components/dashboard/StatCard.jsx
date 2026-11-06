import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, hint, icon: Icon, color = "bg-primary/10 text-primary" }) {
    return (
        <Card className="shadow-xs">
            <CardContent className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
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
