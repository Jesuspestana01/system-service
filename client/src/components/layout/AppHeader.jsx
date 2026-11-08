import { Link, useNavigate } from "react-router-dom";
import { GalleryVerticalEnd, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO [BACKEND - POST /api/auth/logout]:
        // Llamar a `logout()` de `src/services/auth.service.js` para limpiar el JWT (`tokenStorage.clear()`) antes de salir.
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-16 items-center justify-between px-4 md:px-8">
                <Link to="/main" className="flex items-center gap-2 font-medium">
                        <img className="h-15" src="/system-service-logo.png"/>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut />
                    Cerrar sesión
                </Button>
            </nav>
        </header>
    );
}
