import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export function SignupForm({
  className,
  ...props
}) {
  // TODO [BACKEND - POST /api/auth/register]:
  // Manejar `onSubmit` validando que `password === confirmPassword` y llamando a `register(...)`
  // en `src/services/auth.service.js` (modelo `User`: name, lastName, username, email, password, role).
  return (
    <form className={cn("flex flex-col gap-4", className)} {...props}>
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Completa el siguiente formulario para crear tu cuenta
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
          <Input
            id="name"
            type="text"
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
            required
            className="bg-background"
          />
          <FieldDescription>Por favor, confirma tu contraseña.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Crear cuenta</Button>
          <FieldDescription className="px-6 text-center">
            ¿Ya tienes una cuenta? <Link to={"/"}>Inicia sesión</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
