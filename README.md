# Godam Solutions — Smart Warehouse Management

> **Team Nexus | Problem Statement 26010**

A full-stack warehouse management platform for agricultural supply chains. Godam Solutions connects warehouse owners, managers, and quality-control representatives with real-time sensor monitoring, AI-powered PDF parsing, smart allocation, and impact analytics.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _Deployed on Vercel_ |
| Backend  | _Deployed on Render_ |

### Test Credentials

| Role    | Email               | Password |
|---------|---------------------|----------|
| Owner   | owner@godam.com     | 123456   |
| Manager | manager@godam.com   | 123456   |
| QC Rep  | qc@godam.com        | 123456   |

---

## Features

- **Role-Based Dashboards** — Separate dashboards for Owner, Manager, and QC Rep with tailored views and permissions.
- **Warehouse Management** — Add, view, and manage warehouses with capacity and location details.
- **Inventory Tracking** — Batch-level inventory with crop type, quantity, quality grades, and expiry tracking.
- **Real-Time Sensor Monitoring** — Live temperature, humidity, and air-quality readings with configurable alert thresholds.
- **Alert System** — Automated alerts when sensor readings exceed safe limits; viewable from any role.
- **Smart Allocation Engine** — Risk-scored allocation of warehouse space to incoming produce; considers crop compatibility, capacity, and environmental factors.
- **AI PDF Parsing** — Upload agricultural requirement PDFs; Google Gemini extracts structured data for allocation requests.
- **Dispatch History** — Track dispatched batches with timeline and status.
- **Farmer Management** — Owner/Manager can manage farmer contacts and link them to inventory.
- **Impact Analytics** — Dashboard with warehouse utilization, waste reduction, and revenue metrics.
- **Messaging** — In-app message threads between roles.
- **Settings** — Profile, notification preferences, and theme configuration.

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Node.js, Express |
| Database  | Supabase (PostgreSQL + Row-Level Security) |
| Auth      | JWT + Supabase Auth |
| AI        | Google Gemini API |
| Animation | GSAP, Framer Motion |
| Charts    | Recharts |
| Deployment| Vercel (client) + Render (server) |

---

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # ProtectedRoute, RoleRoute
│   │   │   ├── common/     # Shared components
│   │   │   ├── dashboard/  # Dashboard widgets, charts, tables
│   │   │   ├── home/       # Landing page sections
│   │   │   ├── landing/    # Marketing page components
│   │   │   ├── layout/     # AppLayout, Sidebar, Navbar
│   │   │   └── sensors/    # Sensor cards and charts
│   │   ├── config/         # API base URL config
│   │   ├── context/        # AuthContext, WarehouseContext
│   │   ├── hooks/          # Custom hooks (useInventory, useAllocations, etc.)
│   │   ├── lib/            # Supabase client setup
│   │   ├── pages/          # All page-level components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helpers, risk calculation, formatters
│   ├── vercel.json         # Vercel SPA rewrite config
│   └── package.json
│
├── server/                 # Express backend
│   ├── server.js           # Entry point
│   ├── config/             # Supabase & Gemini clients
│   ├── middleware/         # JWT auth middleware
│   ├── routes/             # API route handlers
│   │   ├── auth.js         # Sign-up, login, profile
│   │   ├── sensors.js      # Sensor data & alerts
│   │   ├── warehouses.js   # Warehouse CRUD
│   │   ├── allocation.js   # Allocation engine
│   │   ├── pdf-parse.js    # Gemini-powered PDF extraction
│   │   ├── messages.js     # In-app messaging
│   │   ├── contacts.js     # Contact management
│   │   └── analytics.js    # Impact analytics
│   ├── utils/              # Allocation engine, risk scoring, sensor simulator
│   ├── scripts/            # Seed & debug scripts
│   └── package.json
│
├── docs/                   # Documentation
│   ├── ALERT_SYSTEM.md
│   ├── PROJECT_STRUCTURE.md
│   └── setup/              # Supabase & testing setup guides
│
├── render.yaml             # Render deployment blueprint
└── test-data/              # Sample requirement PDFs
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://ai.google.dev) key

### 1. Clone the repo

```bash
git clone https://github.com/adityaaa08012006/Nexus_Harshil_26010.git
cd Nexus_Harshil_26010
```

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

### Frontend on Vercel

1. Import the repo on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your Render backend URL).
5. Deploy.

### Backend on Render

1. Create a **Web Service** on [Render](https://render.com) from the repo.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install` | Start Command: `node server.js`.
4. Add environment variables from `server/.env`.
5. Set `CLIENT_URL` to your Vercel deployment URL.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/health` | Health check |
| POST   | `/api/auth/login` | User login |
| POST   | `/api/auth/register` | User registration |
| GET    | `/api/sensors/:warehouseId` | Sensor readings |
| GET    | `/api/warehouses` | List warehouses |
| POST   | `/api/allocation/calculate` | Run allocation engine |
| POST   | `/api/pdf-parse/upload` | Parse PDF with Gemini AI |
| GET    | `/api/messages` | Get message threads |
| GET    | `/api/contacts` | List contacts |
| GET    | `/api/analytics/impact` | Impact dashboard data |

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Built with care by Team Nexus**
