import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// table header toolbar with title, counter skeleton, search input and filter slots
export function DataToolbar({
    title,
    description,
    loading = false,
    search,
    onSearchChange,
    searchPlaceholder = "Buscar...",
    children,
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {loading ? (
                    <Skeleton className="mt-1 h-4 w-36 rounded-md" />
                ) : (
                    description && (
                        <p className="animate-in fade-in duration-500 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )
                )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="pl-8 sm:w-64"
                    />
                </div>
                {children}
            </div>
        </div>
    );
}
