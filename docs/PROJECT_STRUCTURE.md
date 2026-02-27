# Project Structure

## Overview

This document describes the organization of the Nexus Warehouse Management System.

## Directory Structure

```
Nexus_Harshil_26010/
├── client/                          # Frontend React + TypeScript application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, logos
│   │   ├── components/              # React components
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── common/              # Reusable UI components
│   │   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── home/                # Landing page components
│   │   │   ├── landing/             # Additional landing components
│   │   │   ├── layout/              # Layout components
│   │   │   └── sensors/             # Sensor monitoring components
│   │   ├── context/                 # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Third-party integrations (Supabase)
│   │   ├── pages/                   # Page components
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Utility functions
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts               # Vite configuration
│   └── tailwind.config.js           # Tailwind CSS configuration
│
├── server/                          # Backend Node.js + Express application
│   ├── config/                      # Configuration files
│   │   ├── gemini.js                # Gemini AI configuration
│   │   └── supabase.js              # Supabase client configuration
│   ├── database/                    # Database-related files
│   │   ├── migrations/              # SQL migration files
│   │   │   ├── schema.sql           # Main database schema
│   │   │   ├── create-parsed-requirements.sql
│   │   │   ├── fix-allocation-requests-fk.sql
│   │   │   ├── phase3-sensors-schema.sql
│   │   │   └── [other migration files]
│   │   └── seeds/                   # Database seed files
│   │       └── seed-phase3.js       # Phase 3 seed data
│   ├── middleware/                  # Express middleware
│   │   └── auth.js                  # Authentication middleware
│   ├── routes/                      # API route handlers
│   │   ├── allocation.js            # Allocation request routes
│   │   ├── auth.js                  # Authentication routes
│   │   ├── contacts.js              # Contact management routes
│   │   ├── inventory.js             # Inventory routes
│   │   ├── pdf-parse.js             # PDF parsing routes (Gemini AI)
│   │   ├── sensors.js               # Sensor data routes
│   │   └── warehouses.js            # Warehouse routes
│   ├── scripts/                     # Utility scripts
│   │   ├── fix-user-roles.js        # Role fixing script
│   │   ├── test-auth.js             # Authentication test
│   │   ├── test-supabase.js         # Supabase connection test
│   │   └── verify-database.js       # Database verification
│   ├── utils/                       # Utility functions
│   │   ├── riskCalculation.js       # Risk calculation logic
│   │   └── sensorSimulator.js       # Sensor simulation
│   ├── .env.example                 # Environment variables template
│   ├── package.json
│   └── server.js                    # Server entry point
│
├── docs/                            # Documentation
│   ├── archive/                     # Archived implementation notes
│   │   ├── FIXES_AUTH_LOGOUT.md     # Auth/logout fix documentation
│   │   ├── IMPLEMENTATION_SUMMARY.md # Implementation summary
│   │   ├── PHASE3_README.md         # Phase 3 documentation
│   │   └── PLAN.md                  # Original project plan
│   ├── setup/                       # Setup guides
│   │   ├── TESTING_SETUP.md         # Testing environment setup
│   │   └── SUPABASE_SETUP.md        # Supabase configuration guide
│   └── PROJECT_STRUCTURE.md         # This file
│
├── test-data/                       # Test data and sample files
│   └── SAMPLE_AGRICULTURAL_REQUIREMENTS.md
│
├── .gitignore
├── LICENSE
└── README.md                        # Main project README

```

## Key Technologies

### Frontend

- **React 18** with TypeScript
- **Vite 7.3.1** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Supabase Client** - Database & Auth

### Backend

- **Node.js** with Express
- **Supabase** - PostgreSQL database with RLS
- **Gemini AI (2.5-flash)** - PDF parsing
- **Multer** - File upload handling

## Database Structure

### Main Tables

- `user_profiles` - User information and roles
- `warehouses` - Warehouse locations
- `batches` - Inventory batches
- `allocation_requests` - Order requests
- `contacts` - Farmers and buyers
- `sensor_readings` - Environmental sensor data
- `sensor_thresholds` - Alert thresholds
- `sensor_alerts` - Generated alerts
- `parsed_requirements` - Parsed PDF requirements

## User Roles

1. **Owner** - Full system access
2. **Manager** - Warehouse management, order fulfillment
3. **QC Representative** - Quality control, requirement uploads

## Features

### PDF Parsing Workflow

1. Upload PDF with agricultural requirements
2. Gemini AI extracts and structures data
3. User reviews and edits parsed items
4. Save draft to database
5. Publish as allocation requests

### Order Management

- Bulk approve/reject orders
- Search and filter functionality
- Deadline urgency indicators
- Quick action buttons

### Inventory Management

- Real-time risk scoring
- Environmental monitoring
- Batch tracking
- Dispatch management

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### PDF Parsing

- `POST /api/pdf-parse/upload` - Upload and parse PDF
- `POST /api/pdf-parse/save` - Save parsed data
- `POST /api/pdf-parse/publish/:id` - Publish to allocation requests
- `GET /api/pdf-parse/parsed/:id` - Get parsed data
- `GET /api/pdf-parse/history` - Get upload history

### Warehouses

- `GET /api/warehouses` - List all warehouses
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Inventory

- `GET /api/inventory/batches` - List batches
- `POST /api/inventory/batches` - Add batch
- `PUT /api/inventory/batches/:id` - Update batch
- `DELETE /api/inventory/batches/:id` - Delete batch

### Allocation Requests

- `GET /api/allocation` - List allocation requests
- `POST /api/allocation` - Create request
- `PUT /api/allocation/:id` - Update request status
- `DELETE /api/allocation/:id` - Delete request

### Sensors

- `GET /api/sensors/readings` - Get sensor readings
- `POST /api/sensors/readings` - Add reading
- `GET /api/sensors/alerts` - Get alerts
- `POST /api/sensors/alerts/acknowledge` - Acknowledge alert

## Environment Variables

### Client (.env)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

### Server (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

## Development

### Start Development Servers

**Client:**

```bash
cd client
npm install
npm run dev
```

**Server:**

```bash
cd server
npm install
node server.js
```

### Run Database Migrations

Execute SQL files in `server/database/migrations/` in Supabase SQL Editor:

1. `schema.sql` - Main schema
2. `create-parsed-requirements.sql` - Parsed requirements table
3. `fix-allocation-requests-fk.sql` - Foreign key constraints
4. Other migrations as needed

### Run Seed Data

```bash
cd server
node database/seeds/seed-phase3.js
```

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication via Supabase Auth
- Service role key for server-side operations
- Environment variables for sensitive data

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

See LICENSE file for details.
