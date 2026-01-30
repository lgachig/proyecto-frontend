# UCE Smart Parking – Frontend

Smart parking system for Universidad Central del Ecuador. Enables students, teachers, and administrators to reserve and manage parking spaces, view a real-time map, and consult statistics.

## What the application does

### Users (Students / Teachers)
- **Parking map**: View zones and slots on an interactive map with real-time availability
- **Reservations**: Reserve and release parking spots directly from the map; view ETA and walking route
- **My reservations**: View reservation history with stats (total reservations, favorite slot, current status); updates in real time without page reload
- **My vehicle**: Manage vehicle data (plate, model, color)
- **Smart suggestion**: On dashboard entry, suggests "usual spot" if available (based on history)
- **Zones menu**: Quick navigation to different parking zones on the map

### Administrators
- **Dashboard**: Flow analysis, occupancy overview, charts
- **Reports**: Occupancy monitoring, export to PDF
- **Slots management**: Create, edit, and manage parking slots and zones
- **Statistics**: Usage statistics and decision support

### Authentication & Security
- Login/register with Supabase
- Protected routes by role: `r001` (student), `r002` (teacher), `r003` (admin)
- Weekly reservation limits: 3 for students, 5 for teachers

### Extras
- Real-time notifications (Supabase)
- Offline support (read-only) with TanStack Query for map, zones, history
- Responsive design for mobile and desktop
- Collapsible sidebar with hamburger menu on small screens

## Tech stack

- **Vite + React** – Build and dev server
- **React Router DOM** – Routing and layouts (admin/user)
- **Supabase** – Auth and database
- **TanStack Query** – Caching and offline support
- **Tailwind CSS** – Styling
- **Leaflet / react-leaflet** – Map
- **Recharts, jsPDF, html2canvas** – Reports and export

## Running locally

### Requirements
- Node.js 20+
- npm (or pnpm/yarn)

### Steps

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open in the browser: [http://localhost:3000](http://localhost:3000)

### Environment variables (optional)

Supabase URL and key are set in `src/lib/supabase.js`. To use your own project, add a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Then update `src/lib/supabase.js` to read from `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Other scripts
- `npm run build` – Production build (output in `dist/`)
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint

## Running with Docker

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

The app is available at [http://localhost:3000](http://localhost:3000).

Optional: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or in the environment, and pass them as build args in `docker-compose.yml` if you want the image to use your Supabase project.

### Standalone Docker image

Build using the Vite Dockerfile:

```bash
docker build -f Dockerfile.vite -t uce-parking-front .
docker run -p 3000:80 uce-parking-front
```

The container serves static files on port 80 (nginx). Map port 3000 on the host to 80 in the container.

## Route structure

- `/` → Redirects to `/login`
- `/login`, `/register` – Auth
- `/admin` – Admin dashboard (requires role `r003`)
- `/admin/reports` – Occupancy monitor
- `/admin/slots` – Slots and zones management
- `/admin/statics` – Statistics
- `/user` – Parking map (students/teachers)
- `/user/reservations` – Reservation history
- `/user/vehicle` – My vehicle

Routes under `/admin/*` and `/user/*` are protected and redirect based on session and role.
