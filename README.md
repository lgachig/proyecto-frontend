# UCE Smart Parking – Frontend

Smart parking system for **Universidad Central del Ecuador (UCE)**.  
This frontend application allows students, professors, and administrators to manage parking spaces, visualize availability on a real-time map, and analyze usage statistics.

The project focuses on clarity, modular architecture, and real-time interaction using modern frontend technologies.

---

## What the application does

### Users (Students / Professors)

- **Parking map**  
  Interactive map displaying parking zones and slots with real-time availability.

- **Reservations**  
  Users can reserve and release parking slots directly from the map.

- **My reservations**  
  Reservation history with live updates, including:
  - Total reservations
  - Current active session
  - Most frequently used slot

- **Vehicle management**  
  Users can register and update their vehicle information:
  - License plate
  - Brand
  - Model
  - Color

- **Smart suggestion**  
  When accessing the user dashboard, the system suggests the most frequently used parking slot if it is currently available.

- **Zone menu**  
  Quick navigation menu that centers the map on each parking zone.  
  Zones include a configured central latitude and longitude managed by the administrator.

---

### Administrators

- **Admin dashboard**  
  Overview of parking usage, occupancy indicators, and system activity.

- **Reports**  
  - Real-time occupancy monitoring
  - Ability to end active parking sessions
  - Export reports to PDF format

- **Slot and zone management**  
  Administrators can:
  - Create, edit, and delete parking slots
  - Create and manage parking zones
  - Configure zone coordinates used in the user map and zone menu

- **Statistics**  
  Aggregated usage data to support analysis and decision-making.

---

### Authentication and security

- Authentication and user management handled by **Supabase Auth**
- Role-based protected routes:
  - `r001` – Student
  - `r002` – Professor
  - `r003` – Administrator
- Weekly reservation limits:
  - Students: 3 reservations per week
  - Professors: 5 reservations per week

---

### Extra features

- **Real-time notifications** using Supabase Realtime, filtered per user
- **Offline read support**:
  - Cached data using TanStack Query
  - Persisted client state using Zustand
  - The app displays the last available data when offline
- **Responsive design** with collapsible sidebar for mobile devices

---

## Technical stack

- **Vite + React** – Development server and build tooling
- **React Router DOM** – Routing and layout separation (admin / user)
- **Supabase** – Authentication, database, and real-time events
- **TanStack Query** – Server state caching and synchronization
- **Zustand** – Client-side state management with persistence
- **Tailwind CSS** – Styling and responsive layout
- **Leaflet / react-leaflet** – Interactive map rendering
- **Recharts, jsPDF, html2canvas** – Charts and PDF report export

---

## Project structure

The application is **feature-based and componentized**.

```
src/
├── components/
├── contexts/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── store/
├── constants/
└── utils/
```

---

## How to run the project

### Requirements
- Node.js 20+
- npm (or pnpm / yarn)

### Steps

```bash
npm install
npm run dev
```

Open: http://localhost:3000

---

## Environment variables (optional)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Docker

```bash
docker compose up --build
```

or

```bash
docker build -f Dockerfile.vite -t uce-smart-parking-front .
docker run -p 3000:80 uce-smart-parking-front
```

---

## Routes

- `/login`, `/register`
- `/admin`
- `/admin/reports`
- `/admin/slots`
- `/user`
- `/user/reservations`
- `/user/vehicle`
