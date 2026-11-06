import { Link, useNavigate } from "react-router-dom";
import { GalleryVerticalEnd, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: limpiar la sesión (token, contexto, etc.) cuando el backend esté listo
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-16 items-center justify-between px-4 md:px-8">
                <Link to="/main" className="flex items-center gap-2 font-medium">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-5" />
                    </div>
                    <span className="text-lg">Logo</span>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut />
                    Cerrar sesión
                </Button>
            </nav>
        </header>
    );
}
