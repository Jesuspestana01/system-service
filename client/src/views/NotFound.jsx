import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("role") && localStorage.getItem("id"));
  const homePath = isAuthenticated ? "/main" : "/";

  return (
    <section className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center shadow-xs">
        <CardHeader className="justify-items-center gap-2 pt-8">
          <div className="mb-1 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileQuestion className="size-7" />
          </div>
          <Badge variant="outline" className="font-mono">
            Error 404
          </Badge>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Página no encontrada
          </CardTitle>
          <CardDescription className="text-balance">
            La ruta <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{location.pathname}</code> no existe o fue movida.
          </CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Regresar
          </Button>
          <Button nativeButton={false} render={<Link to={homePath} />}>
            <Home />
            {isAuthenticated ? "Ir al panel principal" : "Ir al inicio de sesión"}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
};

export default NotFound;
