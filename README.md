# iSpot · System Service

**Sistema integral de gestión para centro de servicio técnico especializado en dispositivos Apple.**

![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/Licencia-Todos_los_derechos_reservados-b91c1c?style=flat-square)

---

## Descripción general

**iSpot · System Service** es una aplicación full-stack diseñada para digitalizar y controlar todo el flujo operativo de un taller de servicio técnico Apple: desde la recepción del equipo y el diagnóstico inicial hasta el seguimiento por técnicos, control de inventario (con y sin rastreo de stock), presupuesto detallado, historial por cliente y administración de personal por roles.

---

## Vista previa interactiva (Modo Demo)

Para facilitar su evaluación en portafolio sin requerir credenciales ni modificar la base de datos en producción, la pantalla de inicio ([Landing](client/src/views/Landing.jsx)) incluye un módulo de **Vista previa interactiva**:

- **Datos ficticios completos en memoria (`sessionStorage`):** órdenes en distintos estados, clientes, inventario con stock normal/bajo/agotado, servicios sin rastreo de existencias, catálogo de modelos Apple y equipo de empleados.
- **Simulación de red e interfaz:** todas las peticiones se enrutan mediante [`demo.service.js`](client/src/services/demo.service.js) y [`api.js`](client/src/services/api.js), mostrando los estados de carga con `Skeleton` y transiciones suaves (`animate-in fade-in`).
- **Cambio de rol en vivo:** desde la barra superior del modo demo puedes alternar en tiempo real entre **Administrador**, **Técnico** y **Vendedor** para comprobar las restricciones de permisos en cada vista.
- **Reinicio instantáneo:** el botón **Reiniciar datos** restaura el estado inicial de la demostración en cualquier momento.

---

## Módulos y funcionalidades

### 1. Panel principal (`/main`)
- Saludo contextual según la hora del día y resumen general en tiempo real.
- Tarjetas de acceso rápido a **Órdenes**, **Clientes** e **Inventario** (reflejando exactamente la cantidad de productos rastreables con stock bajo o agotado).
- Tabla con las **últimas 5 órdenes ingresadas** y navegación directa a su detalle.
- Acceso exclusivo a **Gestionar empleados** visible únicamente para administradores.

### 2. Órdenes de servicio y detalle (`/orders`, `/orders/:orderId`)
- Flujo completo de estados: `Recibido` → `En diagnóstico` → `En reparación` → `Listo` → `Entregado`.
- **Diagnóstico inicial de recepción:** registro editable de la falla reportada por el cliente y la inspección técnica inicial.
- **Bitácora de informes del técnico:** historial cronológico de avances vinculados directamente a los técnicos activos registrados en la base de datos (mostrando `Sin técnicos` si aún no existen técnicos creados).
- **Presupuesto y cobros:**
  - Carga de repuestos desde inventario (con descuento y reposición automática de stock cuando aplica) o creación de servicios personalizados.
  - Edición en línea de cantidad, precio unitario, descuento por línea y descuento general porcentual con cálculo automático del total.
- **Catálogo dinámico de modelos Apple:** creación y administración de modelos agrupados por categoría (`iPhone`, `MacBook`, `iPad`, `iMac`, `Mac mini / Mac Studio`, `Apple Watch`, `AirPods`) persistidos en PostgreSQL.

### 3. Gestión de clientes (`/customers`, `/customers/:customerId`)
- Alta, edición y eliminación de clientes (también de forma inline al crear una orden).
- Formateo automático en interfaz para cédula (`V-{número}`) y número telefónico (`+58 {código}-{número}`).
- Ficha individual de cliente con estadísticas (órdenes registradas, en taller, completadas, total facturado) e historial filtrable de sus equipos atendidos.

### 4. Inventario y servicios sin rastreo (`/inventory`)
- Control de repuestos y accesorios con generación secuencial de código SKU (`INV-xxx`), ajuste rápido de stock (`-` / `+`) con historial de movimientos, precio y stock mínimo.
- **Conceptos sin rastreo de inventario (`trackStock: false`):** soporte nativo para servicios intangibles (como *Asesoría técnica* o *Diagnóstico en placa*) que permanecen siempre disponibles para facturar sin generar alertas de stock bajo ni exigir unidades.

### 5. Control de acceso por roles y empleados (`/employees`, `/signup`)
El sistema implementa permisos diferenciados tanto en la UI como en las acciones permitidas ([`permissions.js`](client/src/lib/permissions.js)):

| Rol | Órdenes | Clientes | Inventario | Empleados | Registro público |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrador** | Acceso total | Acceso total | Crear, editar, ajustar stock y eliminar | Gestión completa (crear, editar, rol, estado, eliminar) | — |
| **Técnico** | Acceso total | Acceso total | Solo lectura (cantidades y precios) | Sin acceso | — |
| **Vendedor** (`recepción`) | Crear, ver y editar (sin eliminar) | Crear, ver y editar (sin eliminar) | Solo lectura (sin crear, editar ni eliminar) | Sin acceso | Rol asignado por defecto al registrarse |

---

## Stack tecnológico

### Frontend (`client/`)
- **Core:** React 19, React Router DOM 7, Vite (`rolldown-vite`)
- **Estilos y UI:** Tailwind CSS v4, `@base-ui/react` / componentes estilo shadcn/ui, `tw-animate-css`, Lucide React, Tipografía Geist Variable

### Backend (`server/`)
- **Core:** Node.js (ES Modules), Express 5
- **Base de datos y ORM:** PostgreSQL (Neon DB en la nube con respaldo a PostgreSQL local) y Sequelize 6
- **Seguridad y utilidades:** `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`
- **Sincronización automática:** utilidad `syncDatabase()` en [`server/index.js`](server/index.js) que actualiza tipos `ENUM` en PostgreSQL y ejecuta `sequelize.sync({ alter: true })` automáticamente al iniciar el servidor.

---

## Estructura del proyecto

```text
system-service/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── customers/       # Diálogo de creación/edición de clientes
│       │   ├── dashboard/       # StatCard, DataToolbar, PageHeader, RowActions, tablas vacías
│       │   ├── employees/       # Diálogo de gestión de empleados
│       │   ├── inventory/       # ProductFormDialog (con/sin rastreo de stock)
│       │   ├── layout/          # AppHeader (con barra de Modo Demo) y DashboardLayout
│       │   ├── orders/          # Diagnóstico, Informes, Facturación, Equipo y Modelos Apple
│       │   ├── ui/              # Primitivos de interfaz (Card, Dialog, Table, Skeleton, etc.)
│       │   ├── login-form.jsx   # Formulario de acceso + tarjeta de Vista Previa Demo
│       │   └── signup-form.jsx  # Registro público de usuarios (rol Vendedor por defecto)
│       ├── data/                # Catálogos base, estados de órdenes y helpers
│       ├── lib/                 # Formateadores (cédula, teléfono, moneda, fechas) y permisos
│       ├── services/            # Capa de API REST + motor demo.service.js
│       ├── views/               # Vistas principales de la aplicación
│       └── Layout.jsx           # Enrutamiento protegido y reactividad del modo demo
├── server/
│   ├── models/                  # Modelos Sequelize (User, Client, Equipment, DeviceModel, ServiceOrder, Inventory, etc.)
│   ├── routes/                  # Rutas REST Express (/api/*)
│   └── index.js                 # Conexión Neon DB / PostgreSQL y syncDatabase()
├── LICENSE                      # Licencia propietaria — Todos los derechos reservados
├── package.json                 # Scripts monorepo
└── README.md
```

---

## Endpoints principales de la API (`/api`)

- `GET /api/dashboard/summary` — Contadores globales para el panel principal.
- `GET | POST | PUT | DELETE /api/users` y `POST /api/users/login` — Autenticación y gestión de usuarios/técnicos.
- `GET | POST | PUT | DELETE /api/clients` — Gestión de clientes y su historial de órdenes.
- `GET | POST | PUT | DELETE /api/service-orders` — Ciclo completo de órdenes de servicio, además de endpoints dedicados:
  - `PUT /api/service-orders/:id/equipment`
  - `PATCH /api/service-orders/:id/status`
  - `PATCH /api/service-orders/:id/diagnosis`
  - `POST | DELETE /api/service-orders/:id/reports`
  - `POST | PATCH | DELETE /api/service-orders/:id/items`
  - `PATCH /api/service-orders/:id/billing`
- `GET | POST | DELETE /api/equipment/models` y `/api/equipment` — Catálogo de modelos y registro de equipos.
- `GET | POST | PUT | DELETE /api/inventory` y `PATCH /api/inventory/:id/stock` — Control de inventario, productos sin rastreo y movimientos.

---

## Instalación y desarrollo local (uso exclusivo autorizado)

> [!CAUTION]
> Este repositorio es público únicamente como muestra de portafolio profesional. **No está permitida su descarga para implementación, despliegue o uso comercial/personal sin permiso expreso por escrito del autor.** Consulta [`LICENSE`](./LICENSE) para más detalles.

Para referencia técnica de ejecución en entorno de desarrollo autorizado:

1. **Instalar dependencias:**
   ```bash
   npm run install-all
   ```

2. **Variables de entorno en `server/.env`:**
   ```env
   PORT=3010
   SECRET="tu_clave_jwt_segura"
   NEON_CONNECTION_STRING="postgresql://usuario:password@host/neondb?sslmode=require"

   # O respaldo local con PostgreSQL:
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=system_service
   ```

3. **Variables de entorno en `client/.env`:**
   ```env
   VITE_API_URL=http://localhost:3010/api
   ```

4. **Iniciar cliente y servidor en paralelo:**
   ```bash
   npm run dev
   ```

---

## Derechos de autor y licencia

**Copyright © 2026 Jesus Pestana (`@Jesuspestana01`). Todos los derechos reservados.**

Queda estrictamente prohibida la copia, modificación, distribución, despliegue, alojamiento o implementación total o parcial de esta aplicación sin autorización previa y por escrito de **Jesus Pestana** (`jesuspestana77@gmail.com`). Consulta los términos completos en el archivo [`LICENSE`](./LICENSE).
