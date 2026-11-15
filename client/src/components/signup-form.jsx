import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { register } from "@/services/auth.service";

// signup form that registers new users with the seller role ('recepción')
export function SignupForm({ className, ...props }) {
  const navigate = useNavigate();

  // form fields and submission state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // validate inputs and register user as seller
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        role: "recepción",
      });
      navigate("/", {
        state: {
          registeredMessage: "Cuenta creada exitosamente. Inicia sesión para continuar.",
        },
      });
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)} {...props}>
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Completa el siguiente formulario para crear tu cuenta
          </p>
        </div>

        {/* error alert */}
        {error && (
          <FieldError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center">
            {error}
          </FieldError>
        )}

        <Field>
          <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background"
          />
          <FieldDescription>
            Debe tener al menos 8 caracteres.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-background"
          />
          <FieldDescription>Por favor, confirma tu contraseña.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
          <FieldDescription className="px-6 text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link to={"/"} className="underline underline-offset-4">
              Inicia sesión
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
