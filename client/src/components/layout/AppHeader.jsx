import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth.service";

export function AppHeader({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-16 items-center justify-between px-4 md:px-8">
                <Link to="/main" className="flex items-center gap-2 font-medium">
                        <img className="h-15" src="/system-service-logo.png"/>
                </Link>
                <div className="flex items-center gap-2">
                    {children}
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut />
                        Cerrar sesión
                    </Button>
                </div>
            </nav>
        </header>
    );
}
