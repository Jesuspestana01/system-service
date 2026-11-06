import { AppHeader } from "@/components/layout/AppHeader";

// Estructura base de las vistas tipo dashboard: navbar + contenido centrado
export function DashboardLayout({ children }) {
    return (
        <div className="min-h-svh bg-muted/30">
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">{children}</main>
        </div>
    );
}
