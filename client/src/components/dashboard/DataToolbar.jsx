import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Encabezado de la tabla: título + buscador + filtros adicionales (children)
export function DataToolbar({ title, description, search, onSearchChange, searchPlaceholder = "Buscar...", children }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
