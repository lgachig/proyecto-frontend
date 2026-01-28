# UCE Smart Parking – Frontend

Sistema de parqueadero inteligente para la Universidad Central del Ecuador. Permite a estudiantes, docentes y administradores reservar y gestionar espacios de estacionamiento, ver el mapa en tiempo real y consultar estadísticas.

## ¿Qué hace el proyecto?

- **Usuarios (estudiantes/docentes):** ver el mapa de zonas y slots, reservar y liberar puestos, consultar historial de reservas y gestionar datos del vehículo.
- **Administradores:** dashboard con análisis de flujo, reportes de ocupación, gestión de slots y zonas, y estadísticas de uso.
- **Autenticación:** login/registro con Supabase; rutas protegidas según rol (`r001` estudiante, `r002` docente, `r003` admin).
- **Extras:** menú flotante de zonas para ir al mapa, sugerencia de “puesto habitual” o “más cercano” al entrar al dashboard (si hay créditos), notificaciones en tiempo real y soporte offline de solo lectura (mapa, zonas, historial) con TanStack Query.

## Stack

- **Vite + React** – build y dev
- **React Router DOM** – rutas y layouts (admin/user)
- **Supabase** – auth y datos (sin cambios de lógica de backend)
- **TanStack Query** – caché y soporte offline
- **Tailwind CSS** – estilos
- **Leaflet / react-leaflet** – mapa
- **Recharts, jsPDF, html2canvas** – reportes y exportación

## Cómo ejecutarlo en local

### Requisitos

- Node.js 20+
- npm (o pnpm/yarn)

### Pasos

1. Clonar e instalar dependencias:

   ```bash
   npm install
   ```

2. Arrancar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

3. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

Las variables de Supabase están definidas en `src/lib/supabase.js`. Si quieres usar las tuyas, puedes añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en un `.env` y usarlas en ese archivo o en la build.

### Otros scripts

- `npm run build` – build de producción (salida en `dist/`)
- `npm run preview` – previsualizar el build localmente

## Cómo ejecutarlo con Docker

### Build y ejecución con Docker Compose

```bash
docker compose up --build
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

Opcional: definir en `.env` o en el entorno:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

y pasarlas al servicio en `docker-compose.yml` si quieres que la imagen use tus credenciales en build time.

### Solo imagen Docker (sin Compose)

Build usando el Dockerfile de Vite:

```bash
docker build -f Dockerfile.vite -t uce-parking-front .
docker run -p 3000:80 uce-parking-front
```

Puerto 3000 en el host, 80 en el contenedor (nginx sirve los estáticos de `dist/`).

## Estructura de rutas

- `/` → redirige a `/login`
- `/login`, `/register` – auth
- `/admin` – dashboard admin (requiere rol `r003`)
- `/admin/reports` – monitor de slots
- `/admin/slots` – gestión slots/zonas
- `/admin/statics` – estadísticas
- `/user` – mapa (estudiantes/docentes)
- `/user/reservations` – historial
- `/user/vehicle` – mi vehículo

Las rutas `/admin/*` y `/user/*` están protegidas y redirigen según sesión y rol (misma lógica que el middleware original de Next.js).
