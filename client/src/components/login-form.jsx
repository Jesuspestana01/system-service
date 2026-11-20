import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, Play, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/services/auth.service";
import { startDemoSession } from "@/services/demo.service";

const DEMO_ROLE_CARDS = [
  { role: "administrador", label: "Admin", icon: ShieldCheck },
  { role: "técnico", label: "Técnico", icon: Wrench },
  { role: "recepción", label: "Vendedor", icon: UserCheck },
];

export const LoginForm = ({ className, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredMessage = location.state?.registeredMessage;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/main");
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setSubmitting(false);
    }
  };

  // launch portfolio preview mode with fictional data
  const handleStartDemo = (role = "administrador") => {
    startDemoSession(role);
    navigate("/main");
  };

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta
            </p>
          </div>

          {registeredMessage && !error && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
              {registeredMessage}
            </div>
          )}

          {error && (
            <FieldError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center">
              {error}
            </FieldError>
          )}

          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <FieldDescription className="text-center">
              ¿No tienes una cuenta?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Regístrate
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>

      {/* portfolio interactive demo preview section */}
      <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Eye className="size-4 text-primary" />
            <span>Vista previa interactiva</span>
          </div>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[11px] text-amber-700">
            Datos ficticios
          </Badge>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Prueba órdenes, clientes, inventario, facturación y permisos por rol sin crear cuenta ni modificar la base de datos real.
        </p>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleStartDemo("administrador")}
        >
          <Play className="size-3.5" />
          Probar demo interactiva
        </Button>

        <div className="space-y-1.5 pt-0.5">
          <p className="text-center text-[11px] text-muted-foreground">
            O entra directo con un rol específico:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_ROLE_CARDS.map((card) => {
              const RoleIcon = card.icon;
              return (
                <Button
                  key={card.role}
                  type="button"
                  variant="outline"
                  size="xs"
                  className="justify-center gap-1 bg-background text-xs"
                  onClick={() => handleStartDemo(card.role)}
                >
                  <RoleIcon className="size-3" />
                  {card.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
