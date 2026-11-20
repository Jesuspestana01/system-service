import { Link, useNavigate } from "react-router-dom";
import { Eye, LogOut, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNormalizedRole } from "@/lib/permissions";
import { logout } from "@/services/auth.service";
import {
    DEMO_ROLE_OPTIONS,
    isDemoMode,
    resetDemoData,
    switchDemoRole,
} from "@/services/demo.service";

export function AppHeader({ children }) {
    const navigate = useNavigate();
    const demoActive = isDemoMode();
    const activeRole = getNormalizedRole();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const isRoleSelected = (roleValue) => {
        if (roleValue === "recepción") return activeRole === "vendedor";
        return activeRole === roleValue;
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* interactive demo banner with live role switching and data reset */}
            {demoActive && (
                <div className="border-b border-amber-200/80 bg-amber-50/90 px-4 py-1.5 text-xs text-amber-900 md:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-amber-300 bg-amber-100/80 text-amber-800">
                                <Eye className="size-3" />
                                Modo Demo
                            </Badge>
                            <span className="hidden sm:inline text-amber-800/90">
                                Vista previa con datos ficticios · Los cambios son temporales
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="hidden text-amber-800/80 md:inline">Probar como:</span>
                            <div className="flex items-center rounded-md border border-amber-300/80 bg-white/70 p-0.5">
                                {DEMO_ROLE_OPTIONS.map((option) => {
                                    const selected = isRoleSelected(option.role);
                                    return (
                                        <button
                                            key={option.role}
                                            type="button"
                                            onClick={() => switchDemoRole(option.role)}
                                            className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                                selected
                                                    ? "bg-amber-600 text-white shadow-xs"
                                                    : "text-amber-900 hover:bg-amber-100"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                className="h-6 border-amber-300 bg-white/80 text-[11px] text-amber-900 hover:bg-amber-100"
                                onClick={resetDemoData}
                            >
                                <RotateCcw className="size-3" />
                                Reiniciar datos
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex h-16 items-center justify-between px-4 md:px-8">
                <Link to="/main" className="flex items-center gap-2 font-medium">
                    <img className="h-15" src="/system-service-logo.png" alt="iSpot logo" />
                </Link>
                <div className="flex items-center gap-2">
                    {children}
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut />
                        {demoActive ? "Salir de la demo" : "Cerrar sesión"}
                    </Button>
                </div>
            </nav>
        </header>
    );
}
