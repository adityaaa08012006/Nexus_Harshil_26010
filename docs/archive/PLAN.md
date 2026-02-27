# 🚀 Godam Solutions - Implementation Plan

## 🎨 Design System

### Color Palette
```css
--color-white: #F7F0F0;           /* Background/Base */
--color-yellow: #F2B50B;           /* Secondary/Accent/Warnings */
--color-green-dark: #25671E;       /* Primary Dark/Headers */
--color-green-light: #48A111;      /* Primary Light/Actions/Success */
```

### Color Usage Guidelines
- **Primary Green Dark (#25671E)**: Navigation bar, headers, primary buttons, role badges
- **Primary Green Light (#48A111)**: Interactive elements, success states, "Fresh" risk indicators, CTAs
- **Secondary Yellow (#F2B50B)**: Warning alerts, moderate risk indicators, highlights, badges
- **White (#F7F0F0)**: Background, cards, content areas, text on dark backgrounds
- **Risk Colors**:
  - Fresh (0-30%): Green Light (#48A111)
  - Moderate (31-70%): Yellow (#F2B50B)  
  - High Risk (71-100%): Red (#DC2626 or similar)

---

## 👥 User Roles & Access Structure

### **Role 1: Warehouse Owner** 🏢
**Access Level:** Full system access across multiple warehouses

**Pages & Views:**
1. **OwnerDashboard** - Multi-warehouse overview
2. **WarehouseDetail** - Single warehouse deep-dive
3. **InventoryPage** - View-only inventory across all warehouses
4. **ImpactDashboard** - Analytics and ROI metrics
5. **ContactsPage** - Manage farmer and buyer contacts
6. **Settings** - System configuration and user management

**Features:**
- Compare performance across warehouses
- View financial metrics and ROI
- Access all analytics and reports
- Manage warehouse managers
- Configure system-wide settings

---

### **Role 2: Warehouse Manager** 📦
**Access Level:** Full control of assigned warehouse

**Pages & Views:**
1. **ManagerDashboard** - Single warehouse overview
2. **InventoryPage** - Full CRUD for batches
3. **BatchDetails** - Detailed batch information
4. **SensorMonitoring** - Real-time environmental data
5. **AllocationPage** - Review and approve allocation requests
6. **ContactsPage** - View farmer/buyer contacts
7. **DispatchHistory** - Track dispatched orders

**Features:**
- Add, edit, delete inventory batches
- Monitor sensor readings and alerts
- Approve/reject allocation requests
- Manage dispatches
- View contacts (read-only)
- Generate warehouse reports

---

### **Role 3: QC Representative** 📋
**Access Level:** Order submission and tracking

**Pages & Views:**
1. **OrderTracking** - Track order status
2. **RequirementUpload** - Submit PDF requirements via AI
3. **AllocationRequests** - Create new allocation requests
4. **OrderHistory** - View past orders
5. **ContactInfo** - View warehouse contact details

**Features:**
- Upload PDF requirements (AI parsing)
- Create allocation requests manually
- Track order status in real-time
- Communicate with warehouse managers
- Reorder from history
- View delivery timelines

---

### **Public Access** 🌐
**Pages:**
1. **LandingPage** - Marketing and product overview
2. **AuthPage** - Login/Register

---

## 📊 Current State Analysis

### ✅ Completed Components

**Frontend:**
- Project structure and scaffolding
- Basic UI components (Button, Input, RiskBadge, Navbar, Sidebar, Footer)
- Three pages (LandingPage, Dashboard, BatchDetails)
- TypeScript type definitions (Batch, Risk, User)
- Placeholder hooks (useAuth, useInventory, useEnvironmentalData)
- App.tsx with basic routing structure

**Backend:**
- Basic Express server setup
- Package.json with dependencies
- Placeholder route files
- Environment configuration template
- Supabase configuration file

### ❌ Missing/Incomplete

**Frontend:**
- Role-specific routing and navigation
- 9+ additional pages (AuthPage, OwnerDashboard, InventoryPage, SensorMonitoring, AllocationPage, ContactsPage, RequirementUpload, OrderTracking, ImpactDashboard)
- Most dashboard components
- Real API integration with Supabase
- Real-time sensor updates
- Form validation
- Error handling and loading states
- Role-based UI rendering

**Backend:**
- Supabase database schema and RLS policies
- All API routes implementation
- Authentication with Supabase Auth
- Risk calculation implementation
- Allocation engine logic
- Gemini AI integration for PDF parsing
- Sensor simulation system
- File upload handling
- Role-based authorization middleware

---

## 🗺️ Feature-to-Role Mapping

### Shared Components (All Roles)
- Navbar with role-appropriate navigation
- Sidebar with role-based menu items
- Footer
- Authentication flow
- Notification system
- Alert panel

### Feature Access Matrix

| Feature | Owner | Manager | QC Rep |
|---------|-------|---------|--------|
| **Dashboard** |
| Multi-warehouse overview | ✅ | ❌ | ❌ |
| Single warehouse dashboard | ✅ (read) | ✅ (full) | ❌ |
| **Inventory Management** |
| View all inventory | ✅ | ✅ | ❌ |
| Add/Edit/Delete batches | ❌ | ✅ | ❌ |
| View batch details | ✅ | ✅ | ❌ |
| **Sensor Monitoring** |
| View sensor data | ✅ | ✅ | ❌ |
| Configure thresholds | ✅ | ✅ | ❌ |
| View alerts | ✅ | ✅ | ❌ |
| **Allocation & Orders** |
| Create allocation request | ❌ | ❌ | ✅ |
| View pending requests | ✅ (read) | ✅ (approve) | ✅ (own) |
| Approve/Reject requests | ❌ | ✅ | ❌ |
| Track order status | ❌ | ✅ | ✅ |
| **Contacts** |
| View contacts | ✅ | ✅ (read) | ✅ (read) |
| Add/Edit/Delete contacts | ✅ | ❌ | ❌ |
| **Analytics & Reports** |
| View impact dashboard | ✅ | ✅ (own warehouse) | ❌ |
| Generate reports | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | ✅ (own data) |
| **PDF Upload (AI)** |
| Upload PDF requirements | ❌ | ❌ | ✅ |
| **Settings** |
| User management | ✅ | ❌ | ❌ |
| System configuration | ✅ | ❌ | ❌ |

---

## 🛤️ Routing Structure

### Public Routes
```
/ → LandingPage
/auth → AuthPage (Login/Register)
```

### Protected Routes (Role-Based)

#### Warehouse Owner Routes
```
/owner/dashboard → OwnerDashboard (multi-warehouse overview)
/owner/warehouse/:id → WarehouseDetail (single warehouse)
/owner/inventory → InventoryPage (view all warehouses)
/owner/analytics → ImpactDashboard (ROI, analytics)
/owner/contacts → ContactsPage (manage contacts)
/owner/settings → SettingsPage (system config)
```

#### Warehouse Manager Routes
```
/manager/dashboard → ManagerDashboard (single warehouse)
/manager/inventory → InventoryPage (CRUD operations)
/manager/batch/:id → BatchDetails (detailed view)
/manager/sensors → SensorMonitoring (environmental data)
/manager/allocation → AllocationPage (approve requests)
/manager/dispatch → DispatchHistory (track dispatches)
/manager/contacts → ContactsPage (read-only)
/manager/analytics → ImpactDashboard (warehouse metrics)
```

#### QC Representative Routes
```
/qc/orders → OrderTracking (track status)
/qc/upload → RequirementUpload (PDF upload with AI)
/qc/request → AllocationRequests (create manual request)
/qc/history → OrderHistory (past orders)
/qc/contacts → ContactInfo (warehouse info)
```

---

## 🎯 Phased Implementation Plan (Restructured by User Role)

### **PHASE 1: Foundation & Infrastructure** ⚡ (Priority: CRITICAL)
**Focus:** Core authentication, database, and routing setup
**Affects:** All user roles

#### 1.1 Database Setup with Supabase
- [ ] Set up Supabase project (create account and new project)
- [ ] Configure `server/config/supabase.js` - Supabase client initialization
- [ ] Create database tables using Supabase SQL Editor or migrations:
  - `users` table (name, email, password, role: owner/manager/qc-rep) - Note: Can use Supabase Auth
  - `warehouses` table (name, location, capacity, owner_id)
  - `batches` table (farmer_id, crop, quantity, entry_date, shelf_life, risk_score, zone, warehouse_id)
  - `sensor_readings` table (warehouse_id, zone, temperature, humidity, ethylene, co2, ammonia, timestamp)
  - `allocation_requests` table (requester_id, crop, quantity, deadline, location, price, status)
  - `contacts` table (type: farmer/buyer, name, phone, email, location, crops, price_history)
  - `dispatches` table (batch_id, allocation_id, destination, dispatch_date, quantity)
- [ ] Set up Row Level Security (RLS) policies for each table
- [ ] Configure database indexes for performance

#### 1.2 Authentication System with Role-Based Access
- [ ] Configure Supabase Authentication (enable email/password auth)
- [ ] Extend `users` table with role field (owner/manager/qc-rep)
- [ ] Implement `/api/auth` routes in `server/routes/auth.js`:
  - POST `/register` - Create new user with role assignment
  - POST `/login` - Authenticate and return session token with user role
  - POST `/logout` - Sign out user
  - GET `/me` - Get current user profile with role
- [ ] Create Supabase auth middleware in `server/middleware/auth.js`
- [ ] Create role-based authorization middleware (check user role from database)
  - `requireAuth()` - Basic authentication check
  - `requireRole(['owner', 'manager'])` - Role-specific access
  - `requireOwnWarehouse()` - Manager can only access their warehouse
- [ ] Build `AuthPage.tsx` component (frontend)
  - Login form with email/password
  - Register form with role selection (for demo purposes)
  - Password reset flow
- [ ] Complete `useAuth.ts` hook with context
  - Store user info with role in context
  - Provide role-checking utilities (`isOwner()`, `isManager()`, `isQC()`)
- [ ] Add protected route wrapper components:
  - `<ProtectedRoute />` - Basic auth check
  - `<RoleRoute allowedRoles={['owner', 'manager']} />` - Role-based
- [ ] Implement role-based navigation
  - Dynamic sidebar menu based on user role
  - Role-specific navbar items
- [ ] Implement token storage and refresh logic

**Deliverables:** 
- Working auth system with role-based access
- Role-aware navigation and routing
- Authorization middleware for API routes

#### 1.3 Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Set up Supabase (create project and get API keys: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Configure Gemini API key
- [ ] Add global error handling middleware
- [ ] Set up Winston or Morgan for logging
- [ ] Configure CORS properly
- [ ] Add request validation with express-validator

**Deliverables:** Working auth system, database connection, user management

---

### **PHASE 2: Core Inventory Management** 📦 (Priority: HIGH)
**Focus:** Inventory CRUD, risk calculation, batch management
**Primary Users:** Warehouse Manager (CRUD), Warehouse Owner (read-only)

**Objective:** Build the central inventory tracking system with role-based access

#### 2.1 Backend - Inventory API
- [ ] Implement `/api/inventory` routes in `server/routes/inventory.js`:
  - GET `/` - Get all batches with role-based filtering:
    - Owner: All warehouses
    - Manager: Only their warehouse
    - QC Rep: No access
  - GET `/:id` - Get single batch details (with warehouse access check)
  - POST `/` - Create new batch entry (Manager only)
  - PUT `/:id` - Update batch (Manager only, own warehouse)
  - DELETE `/:id` - Remove batch (Manager only, own warehouse)
  - GET `/stats` - Get inventory statistics (filtered by role)
  - GET `/warehouse/:warehouseId` - Get warehouse-specific inventory
- [ ] Add query builder for filtering and sorting
- [ ] Implement pagination (limit, offset)
- [ ] Add warehouse-specific inventory queries
- [ ] Create batch validation logic
- [ ] Implement Row Level Security (RLS) policies in Supabase:
  - Managers can only modify batches in their warehouse
  - Owners can read all, but not modify
  - QC Reps have no direct inventory access

#### 2.2 Frontend - Inventory Pages

**For Warehouse Manager:**
- [ ] Create `InventoryPage.tsx` component (full CRUD)
  - Toolbar with "Add Batch" button (green primary color)
  - Batch entry form with validation
  - Inline editing capability
- [ ] Build batch list with data table
  - Color-coded risk badges (green/yellow/red)
  - Zone indicators
  - Quick actions (edit, delete, view details)
- [ ] Add search bar with debounced input
- [ ] Implement filter dropdowns:
  - Zone filter
  - Crop type filter
  - Risk level filter (Fresh/Moderate/High with brand colors)
- [ ] Complete `useInventory.ts` hook with CRUD operations
- [ ] Add batch edit modal
  - Pre-filled form with existing data
  - Validation matching entry form
- [ ] Add delete confirmation dialog
  - Warning message with batch details
  - Confirm/Cancel buttons (brand colors)
- [ ] Create batch status badges and indicators using color palette
  - Fresh: Green light (#48A111)
  - Moderate: Yellow (#F2B50B)
  - High Risk: Red
- [ ] Add sorting functionality (by date, risk, crop, zone)

**For Warehouse Owner:**
- [ ] Same `InventoryPage.tsx` but read-only mode
  - Hide "Add Batch" button
  - Disable edit/delete actions
  - Show view-only message
  - Add warehouse selector dropdown
  - Display inventory across all warehouses

**Shared:**
- [ ] Create `BatchDetails.tsx` page (read-only for all)
  - Full batch information
  - Risk score visualization
  - Historical risk trend
  - Sensor readings correlation
  - Action logs

#### 2.3 Risk Calculation Engine
- [ ] Implement `calculateRiskScore()` in `client/src/utils/riskCalculation.ts`
  - Storage duration vs shelf life (40% weight)
  - Temperature deviation from optimal (25% weight)
  - Humidity levels (15% weight)
  - Gas detection levels (20% weight)
- [ ] Create risk classification thresholds using brand colors:
  - Fresh: 0-30% risk → Green Light (#48A111)
  - Moderate: 31-70% risk → Yellow (#F2B50B)
  - High Risk: 71-100% risk → Red (#DC2626)
- [ ] Add backend risk calculation in `server/utils/riskCalculation.js`
- [ ] Create automatic risk recalculation job (cron)
  - Run every hour
  - Update all batch risk scores
  - Trigger alerts for threshold crossings
- [ ] Build `RiskProgressBar` component with brand colors
- [ ] Build `RiskBadge` component with color-coded indicators
- [ ] Add risk trend indicators (improving/worsening with icons)

**Deliverables:** 
- Full CRUD inventory system for Managers
- Read-only inventory views for Owners
- Working risk scoring system with brand colors
- Role-based access control on all inventory operations

---

### **PHASE 3: Sensor Monitoring & Environmental Data** 🌡️ (Priority: HIGH)
**Focus:** Real-time sensor data, alerts, environmental monitoring
**Primary Users:** Warehouse Manager, Warehouse Owner

**Objective:** Implement simulated sensor system and environmental monitoring with role-based access

#### 3.1 Backend - Sensor System
- [ ] Create sensor data simulator in `server/utils/sensorSimulator.js`:
  - Generate realistic temperature (20-30°C)
  - Generate humidity (40-80%)
  - Generate gas levels (ethylene, CO2, ammonia)
  - Add random fluctuations and spikes
  - Create critical scenarios for testing alerts
- [ ] Implement `/api/sensors` routes in `server/routes/sensors.js`:
  - GET `/readings/:warehouseId` - Current readings by zone (role-filtered)
  - GET `/readings/:warehouseId/history` - Historical data (time range)
  - GET `/readings/:warehouseId/zone/:zone` - Zone-specific data
  - POST `/thresholds` - Set threshold configurations (Manager/Owner only)
  - GET `/thresholds/:warehouseId` - Get threshold settings
  - GET `/alerts/:warehouseId` - Get active alerts (color-coded by severity)
- [ ] Set up real-time sensor updates (using polling or Supabase Realtime)
- [ ] Create alert trigger system for threshold breaches
  - Yellow alerts for warnings (#F2B50B)
  - Red alerts for critical (#DC2626)
- [ ] Add sensor data persistence to Supabase with RLS policies

#### 3.2 Frontend - Monitoring Interface

**For Warehouse Manager:**
- [ ] Create `SensorMonitoring.tsx` page (full access)
  - Zone selector dropdown
  - Threshold configuration button (green primary)
  - Real-time update indicator
- [ ] Build `SensorCard.tsx` component with brand colors:
  - Current value display
  - Threshold indicator (yellow warning, red danger)
  - Status icon (green normal, yellow warning, red danger)
  - Last updated timestamp
  - Background: white (#F7F0F0)
- [ ] Add real-time data charts using Chart.js or Recharts:
  - Temperature line chart (green scale)
  - Humidity line chart (blue scale)
  - Gas level bar charts (color-coded)
  - Use brand colors for chart elements
- [ ] Implement `useEnvironmentalData.ts` hook:
  - Fetch current readings
  - Poll for updates (every 5-10 seconds)
  - Handle Supabase Realtime subscriptions
  - Filter by warehouse based on user role
- [ ] Create threshold configuration modal
  - Form with min/max values
  - Preview of current vs new thresholds
  - Save button (green primary)
- [ ] Add zone selector dropdown
- [ ] Build historical trend graphs with date range picker
- [ ] Add export sensor data functionality (CSV/Excel)

**For Warehouse Owner:**
- [ ] Same `SensorMonitoring.tsx` with warehouse selector
  - View data from all warehouses
  - Compare sensor readings across warehouses
  - Read-only threshold display

#### 3.3 Alert System (All Roles)
- [ ] Create notification service in `server/services/notificationService.js`
- [ ] Enhance `AlertPanel.tsx` component with brand colors:
  - Alert type badges (yellow for warnings, red for critical)
  - Timestamp display
  - Acknowledge button (green when dismissed)
  - Filter by type/priority
  - Background notifications
- [ ] Add alert priority system:
  - Info: Blue
  - Warning: Yellow (#F2B50B)
  - Critical: Red
- [ ] Create alert history page
- [ ] Add browser notifications (with permission)
- [ ] Implement alert sound (optional toggle)
- [ ] Add alert dashboard widget for all user roles

**Deliverables:** 
- Live sensor monitoring with brand color scheme
- Alert system with color-coded severity levels
- Environmental tracking dashboard
- Role-based sensor data access (Owner: all warehouses, Manager: own warehouse)

---

### **PHASE 4: Intelligent Allocation Engine** 🎯 (Priority: HIGH)
**Focus:** Demand-supply matching, smart allocation, order fulfillment
**Key Users:** QC Rep (creates requests), Warehouse Manager (approves), Warehouse Owner (monitors)

**Objective:** Build demand-supply matching and smart allocation logic with role-specific workflows

#### 4.1 Backend - Allocation Logic
- [ ] Implement smart allocation algorithm in `server/utils/allocationEngine.js`:
  - Prioritize high-risk batches (>70% risk) - Yellow/Red in UI
  - Match freshness level to demand type:
    - Fresh (0-30% / Green #48A111) → Retail / Quick Commerce
    - Moderate (31-70% / Yellow #F2B50B) → Hotels / Restaurants
    - High (71-100% / Red) → Processing Units
  - Consider delivery location proximity
  - Factor in delivery deadline
  - Optimize for batch utilization
  - Score matches with confidence percentage
- [ ] Create `/api/allocation` routes in `server/routes/allocation.js`:
  - POST `/requests` - Create allocation request (QC Rep only)
  - GET `/requests` - List requests with role-based filtering:
    - QC Rep: Only their own requests
    - Manager: Requests for their warehouse
    - Owner: All requests (read-only)
  - GET `/requests/:id` - Get single request details
  - POST `/suggestions` - Get AI allocation suggestions (Manager/Owner)
  - POST `/confirm/:id` - Confirm and execute allocation (Manager only)
  - PUT `/requests/:id/status` - Update request status
  - GET `/dispatch-history` - View dispatch history (role-filtered)
- [ ] Add allocation scoring system with visual indicators
- [ ] Create demand-supply matching matrix
- [ ] Implement allocation validation (sufficient quantity, warehouse access, etc.)
- [ ] Add RLS policies for role-based request access

#### 4.2 Frontend - Allocation Interfaces

**For QC Representative:**
- [ ] Create `AllocationRequests.tsx` page (create new requests)
  - Manual request form with validation
  - Crop selection dropdown
  - Quantity and unit inputs
  - Location input with autocomplete
  - Deadline date picker
  - Price input
  - Submit button (green primary #48A111)
- [ ] Create `OrderTracking.tsx` page (track submitted requests)
  - Order status timeline component with brand colors:
    - Submitted: Gray
    - Under Review: Yellow (#F2B50B)
    - Approved: Green (#48A111)
    - Dispatched: Green Dark (#25671E)
    - Delivered: Green Light (#48A111)
  - Communication interface with manager
  - Reorder functionality from history
- [ ] Build `OrderHistory.tsx` page
  - Past orders table with status badges
  - Filter by date, crop, status
  - Reorder quick action button
  - Download invoice/documents

**For Warehouse Manager:**
- [ ] Create `AllocationPage.tsx` component (review and approve)
  - Tabs for "Pending" and "Approved" requests
  - Priority sorting (risk-based, deadline-based)
- [ ] Build `AllocationTable.tsx` component:
  - Pending requests list with color-coded urgency
  - Batch suggestions with confidence scores
  - Match confidence indicators (green high, yellow medium, red low)
  - Batch risk display with brand colors
  - Approve/reject action buttons
  - Quick view batch details
- [ ] Create allocation suggestion cards:
  - Recommended batches (AI-powered)
  - Risk score display with color indicators
  - Freshness indicator using brand colors
  - Allocation reasoning (why this match)
  - Match confidence percentage
- [ ] Build dispatch confirmation dialog
  - Summary of allocation
  - Estimated dispatch date
  - Confirm button (green primary)
- [ ] Create `useAllocation.ts` hook:
  - Fetch allocation requests (filtered by warehouse)
  - Get AI suggestions
  - Confirm allocation
  - Update request status
  - Track dispatch status
- [ ] Add dispatch timeline component
- [ ] Create `DispatchHistory.tsx` page
  - Completed dispatches table
  - Filter by date, crop, destination
  - Performance metrics (avg time, fulfillment rate)

**For Warehouse Owner:**
- [ ] Enhanced allocation overview dashboard
  - View all allocation requests (read-only)
  - Allocation efficiency metrics per warehouse
  - Comparison charts
  - No approval actions (view only)

**Shared Components:**
- [ ] `AllocationStatusBadge` - Color-coded status (brand colors)
- [ ] `MatchConfidenceIndicator` - Visual match quality
- [ ] `AllocationFreshnessCard` - Batch freshness display

#### 4.3 Communication & Notifications
- [ ] Add in-app messaging between QC Rep and Manager
- [ ] Email notifications for status changes
- [ ] Real-time status updates using Supabase Realtime
- [ ] SMS notifications (optional)

**Deliverables:** 
- Working allocation engine with AI-powered suggestions
- Complete QC Rep ordering workflow (create, track, reorder)
- Manager approval interface with batch suggestions
- Owner monitoring dashboard
- Role-based access with proper authorization
- Color-coded status indicators throughout

---

### **PHASE 5: AI-Powered PDF Parsing** 🤖 (Priority: MEDIUM)
**Focus:** Gemini AI integration for PDF requirement extraction
**Primary User:** QC Representative

**Objective:** Integrate Gemini AI for automatic requirement extraction from PDFs uploaded by QC Reps

#### 5.1 Backend - Gemini Integration
- [ ] Install `@google/generative-ai` package
- [ ] Set up Gemini AI client in `server/config/gemini.js`
- [ ] Implement `/api/pdf-parse` routes in `server/routes/pdf-parse.js`:
  - POST `/upload` - Upload PDF file (QC Rep only)
  - POST `/parse` - Parse PDF with Gemini AI
  - GET `/extracted/:id` - Get extracted data
  - POST `/structured` - Convert to structured allocation request format
  - DELETE `/cleanup/:id` - Remove processed files
- [ ] Configure Multer + Supabase Storage for file upload handling
  - Store PDFs temporarily in Supabase Storage
  - Organize by user/timestamp
  - Auto-delete after processing
- [ ] Create PDF text extraction utility (pdf-parse library)
- [ ] Design Gemini AI prompt for requirement extraction:
  - Extract crop type and variety
  - Extract quantity and unit of measurement
  - Extract delivery location/address
  - Extract deadline/required date
  - Extract price/budget constraints
  - Extract quality specifications (grade, freshness requirements)
  - Extract contact information
  - Handle multiple formats and languages
- [ ] Add validation for extracted data
  - Confidence scores for each field
  - Flag low-confidence extractions for manual review
- [ ] Create structured response formatter
  - Map AI response to AllocationRequest schema
  - Provide fallback values
- [ ] Handle parsing errors gracefully
  - Return partial results with error flags
  - Log failed parsing attempts
- [ ] Add file cleanup after processing
- [ ] Add rate limiting for Gemini API calls
- [ ] Implement RLS policy (QC Reps can only access their own uploads)

#### 5.2 Frontend - Upload Interface (QC Representative Only)

- [ ] Create `RequirementUpload.tsx` page with brand styling
  - Page header with instructions (green dark #25671E)
  - Upload section with white background (#F7F0F0)
  
- [ ] Build PDF upload component:
  - Drag-and-drop zone with dashed border (green light #48A111)
  - File browser button (green primary button)
  - File type validation (PDF only)
  - File size limit display
  - Upload progress bar (green gradient)
  - Success/error messages with color coding
  
- [ ] Add PDF preview display (optional)
  - Thumbnail preview
  - File name and size
  - Remove/replace file option
  
- [ ] Create AI parsing indicator
  - Loading spinner during AI processing
  - "AI is extracting requirements..." message
  - Progress stages indicator
  
- [ ] Create editable form for parsed data:
  - Pre-filled fields from AI extraction
  - Confidence indicators per field (green high, yellow medium, red low)
  - Crop selection dropdown (with AI suggestion highlighted)
  - Quantity input with unit selector
  - Location input with autocomplete (Google Maps API)
  - Date picker for deadline (AI-extracted date pre-selected)
  - Price/budget input with currency
  - Quality specifications textarea
  - Additional notes textarea
  - "Confidence Score" badge per field
  
- [ ] Build `usePdfParser.ts` hook:
  - Upload file to Supabase Storage
  - Trigger Gemini AI parsing
  - Fetch parsed data with polling
  - Handle parsing errors
  - Submit structured allocation request
  - Track upload/parse status
  
- [ ] Add comprehensive form validation:
  - Required field checks
  - Format validation (dates, numbers, locations)
  - Real-time error messages (red)
  - Success validation indicators (green)
  
- [ ] Show parsing progress/loading states:
  - Uploading file → Extracting text → AI processing → Results ready
  - Step indicator with brand colors
  
- [ ] Add manual entry option
  - "Skip AI and enter manually" button
  - Same form but empty fields
  - Option to switch between AI and manual mid-flow
  
- [ ] Create success confirmation screen
  - Success message with green check icon
  - Summary of submitted request
  - Request ID/tracking number
  - "Track Order" button (green primary)
  - "Submit Another Request" button (outline)

#### 5.3 PDF Upload Enhancements
- [ ] Add support for multiple file formats (optional):
  - Images (JPG, PNG) with OCR
  - Word documents (.doc, .docx)
  - Excel spreadsheets (.xls, .xlsx)
  
- [ ] Create upload history for QC Rep
  - Past uploads list
  - Re-parse option
  - Download original PDF
  
- [ ] Add template library
  - Sample requirement documents
  - Format guidelines
  - Best practices for better AI extraction

**Deliverables:** 
- AI-powered PDF parsing with Gemini integration
- User-friendly upload interface for QC Reps
- Editable form with confidence indicators
- Manual entry fallback option
- Seamless conversion to allocation request
- Brand color scheme throughout the flow

---

### **PHASE 6: Role-Specific Dashboards & Views** 👥 (Priority: MEDIUM)
**Focus:** Create tailored dashboard experiences for each user role
**All Users:** Each role gets customized views and metrics

**Objective:** Build comprehensive, role-specific dashboard interfaces with brand color scheme

#### 6.1 Warehouse Owner Dashboard 🏢

**Pages:**
- [ ] Create `OwnerDashboard.tsx` - Main overview page
  - Header with welcome message and user info
  - Background: white (#F7F0F0)
  - Accent elements: green dark (#25671E)

**Dashboard Components:**
- [ ] Build multi-warehouse overview card grid:
  - Total inventory across warehouses (key metric card)
  - Total warehouses count
  - Utilization metrics with gauge charts
  - Risk exposure summary (color-coded: green/yellow/red)
  - Revenue/dispatch stats (green positive indicators)
  - Active alerts count (yellow/red badges)
  - Cards on white background with green accents

- [ ] Add `WarehouseAnalytics.tsx` component:
  - Performance comparison chart (bar/line charts)
  - Efficiency metrics per warehouse
  - Trends over time (line charts with green primary)
  - Warehouse ranking table
  - Interactive warehouse selector

- [ ] Create comparative metrics table:
  - Side-by-side warehouse comparison
  - Sortable columns
  - Color-coded performance indicators
  - Export to Excel/PDF functionality

- [ ] Add financial performance indicators:
  - Inventory turnover rate (higher is better - green)
  - Storage cost per unit
  - Revenue by warehouse (bar chart)
  - Profit margin indicators
  - ROI visualization

- [ ] Build `WarehouseDetail.tsx` page:
  - Single warehouse deep-dive view
  - Zone-wise breakdown with visual map
  - Manager activity logs
  - Inventory composition (pie chart)
  - Recent alerts and sensor readings
  - Performance trends

- [ ] Add utilization heatmap visualization:
  - Zone usage heatmap with color gradient
  - Time-based utilization trends
  - Capacity planning insights

- [ ] Create warehouse selector dropdown:
  - "All Warehouses" option for aggregate view
  - Individual warehouse selection
  - Quick stats preview on hover

**Navigation & Layout:**
- [ ] Owner-specific sidebar menu (green dark #25671E)
- [ ] Quick action tiles (green light #48A111)
- [ ] Breadcrumb navigation

**Deliverables:**
- Complete Owner dashboard with multi-warehouse analytics
- Financial and performance metrics
- Warehouse comparison tools
- Read-only access to all data

---

#### 6.2 Warehouse Manager Dashboard 📦

**Pages:**
- [ ] Enhance existing `Dashboard.tsx` → `ManagerDashboard.tsx`
  - Single warehouse focus
  - Actionable metrics and quick actions
  - Real-time updates

**Dashboard Components:**
- [ ] Build quick action cards (prominent placement):
  - "Add New Batch" shortcut (green primary button #48A111)
  - "View Pending Allocations" with count badge (yellow #F2B50B if pending)
  - "Check Critical Alerts" with urgent alert count (red if critical)
  - "Generate Report" button (green outline)
  - Cards with hover effects

- [ ] Create key metrics section:
  - Total batches in warehouse
  - Batches by risk level (green/yellow/red pie chart)
  - Available capacity (gauge chart)
  - Today's dispatches count
  - Active alerts count
  - Cards on white background

- [ ] Add current alerts panel:
  - Top 5 critical alerts
  - Color-coded by severity
  - "View All Alerts" link (yellow if warnings exist)
  - Quick acknowledge action

- [ ] Build inventory risk overview:
  - Risk distribution chart (donut chart with brand colors)
  - High-risk batches table (sortable)
  - Recommended actions (AI-powered suggestions)

- [ ] Create shift performance section:
  - Today's activity summary
  - Batches added/removed today
  - Dispatches completed
  - Alerts resolved
  - Team member activity (if multi-user)

- [ ] Add recent activity feed:
  - Real-time activity log
  - Batch modifications
  - Allocation approvals
  - Sensor alerts
  - Color-coded event types
  - Timestamps

- [ ] Build dispatch timeline widget:
  - Upcoming dispatches (next 7 days)
  - In-progress dispatches
  - Dispatch calendar view
  - Quick status updates

- [ ] Add sensor overview cards:
  - Current temperature (color-coded by threshold)
  - Current humidity
  - Gas level warnings (if any)
  - "View Details" link to sensor page

**Customization:**
- [ ] Add real-time metric updates (5-second refresh)
- [ ] Create collapsible sections for mobile view
- [ ] Add dashboard customization options:
  - Drag-and-drop widget arrangement
  - Show/hide widgets
  - Save layout preference
- [ ] Add export dashboard as PDF

**Deliverables:**
- Action-oriented Manager dashboard
- Real-time metrics and alerts
- Quick access to key functions
- Mobile-responsive layout

---

#### 6.3 QC Representative Interface 📋

**Pages:**
- [ ] Create `QCDashboard.tsx` - QC Rep main page
  - Order-focused layout
  - Simple, clean design with brand colors

**Dashboard Components:**
- [ ] Build order status overview:
  - Pending orders count (yellow badge #F2B50B)
  - Approved orders count (green badge #48A111)
  - In-transit orders count
  - Delivered orders count
  - Color-coded status cards

- [ ] Create quick action section:
  - "Upload PDF Requirement" button (green primary #48A111)
  - "Create Manual Request" button (green outline)
  - "Reorder from History" button
  - Large, touch-friendly buttons

- [ ] Build active orders panel:
  - Current orders with status
  - Estimated delivery dates
  - Track order button per item
  - Communication status indicator

- [ ] Add `OrderTracking.tsx` page (detailed view):
  - Order status timeline component:
    - Request Submitted (gray)
    - Under Review (yellow #F2B50B)
    - Allocation Suggested (yellow)
    - Approved (green light #48A111)
    - Dispatch Confirmed (green dark #25671E)
    - In Transit (blue)
    - Delivered (green light #48A111)
  - Progress bar with color coding
  - Detailed status information
  - Estimated delivery date
  - Actual delivery date (when complete)

- [ ] Add communication interface:
  - Message warehouse manager button
  - In-app chat widget
  - View message history
  - Notification badge for unread messages
  - Email/SMS notification preferences

- [ ] Create reorder functionality:
  - "Reorder" button on past orders
  - Pre-fill form with previous order details
  - Modify quantity/date before submitting
  - Quick reorder (one-click with same details)

- [ ] Build `OrderHistory.tsx` page:
  - Searchable order history table
  - Filter by:
    - Date range
    - Crop type
    - Status (delivered, cancelled, etc.)
    - Warehouse
  - Sort by date, status, crop
  - Download invoice/documents per order
  - Performance stats (avg delivery time, fulfillment rate)

- [ ] Create `ContactInfo.tsx` page:
  - Warehouse contact details
  - Manager contact information
  - Operating hours
  - Location map
  - Email/Phone links

**Features:**
- [ ] Add delivery tracking map (optional)
  - Google Maps integration
  - Real-time truck location (if available)
  - Estimated arrival time

- [ ] Create notification center:
  - Status update notifications
  - Message notifications
  - Delivery reminders
  - Badge count on nav icon

- [ ] Add order summary export (PDF/Email)

**Deliverables:**
- Complete QC Rep workflow
- Order tracking with visual timeline
- Easy reorder functionality
- Communication tools
- Clean, user-friendly interface

---

#### 6.4 Shared Components (All Roles)

- [ ] Build `MetricCard.tsx`:
  - Reusable metric display
  - Icon support
  - Color-coded values
  - Trend indicators (up/down arrows)
  - Loading skeleton state

- [ ] Create `RiskDistributionChart.tsx`:
  - Pie/donut chart with brand colors
  - Interactive legend
  - Percentage display

- [ ] Build `RecentActivityFeed.tsx`:
  - Real-time activity stream
  - Color-coded event types
  - Expandable details
  - Filter by activity type

- [ ] Create `AlertWidget.tsx`:
  - Compact alert display for dashboards
  - Color-coded severity
  - Dismissable
  - Link to full alerts page

**Deliverables:**
- Three fully customized dashboards (Owner, Manager, QC Rep)
- Role-specific metrics and actions
- Consistent brand color usage
- Responsive design for all dashboards
- Real-time data updates

---

### **PHASE 7: Contact Management & Network** 📇 (Priority: MEDIUM)
**Focus:** Farmer and buyer contact database
**Primary User:** Warehouse Owner (full CRUD), Manager & QC Rep (read-only)

**Objective:** Build comprehensive contact management system with role-based access

#### 7.1 Backend - Contacts API
- [ ] Implement `/api/contacts` routes in `server/routes/contacts.js`:
  - GET `/farmers` - Get all farmer contacts (role-filtered)
  - GET `/buyers` - Get all buyer contacts (role-filtered)
  - GET `/:id` - Get single contact details
  - POST `/` - Add new contact (Owner only)
  - PUT `/:id` - Update contact information (Owner only)
  - DELETE `/:id` - Remove contact (Owner only)
  - GET `/search` - Search contacts by name/crop/location
  - GET `/price-reference` - Get market price references
  - GET `/recent` - Get recently contacted
- [ ] Add contact categorization (farmer/buyer/both)
- [ ] Create search and filter functionality
- [ ] Implement contact history tracking:
  - Transaction history
  - Communication logs
  - Price negotiations
  - Order history
- [ ] Add crop-based contact filtering
- [ ] Create seasonal availability tracking
- [ ] Implement RLS policies (Owner: full access, Manager/QC: read-only)

#### 7.2 Frontend - Contacts Interface

**For Warehouse Owner (Full Access):**
- [ ] Create `ContactsPage.tsx` component
  - Page header with "Add Contact" button (green primary #48A111)
  - Background: white (#F7F0F0)

- [ ] Build contact card grid:
  - Contact photo/avatar with fallback initials
  - Name and contact type badge:
    - Farmer: Green badge (#48A111)
    - Buyer: Yellow badge (#F2B50B)
    - Both: Green dark badge (#25671E)
  - Primary crop/products list
  - Contact info (phone/email) with click-to-call/email
  - Location with map pin icon
  - Quick action buttons:
    - Edit (green outline)
    - Delete (red outline)
    - View details (green link)
    - Call/Email/Message icons

- [ ] Add comprehensive search bar:
  - Real-time filtering as you type
  - Search by name, phone, email, location, crops
  - Search icon in green primary
  - Clear search button

- [ ] Implement advanced filter options:
  - Contact type dropdown (Farmer/Buyer/Both)
  - Crop specialization multi-select
  - Location/region filter
  - Recent activity filter (last 7/30/90 days)
  - Active filters display chips (green)
  - Clear all filters button

- [ ] Create add/edit contact modal:
  - Modal header with brand colors
  - Form with validation:
    - Contact type selector (radio buttons)
    - Name input (required)
    - Phone input with validation
    - Email input with validation
    - Location input with autocomplete (Google Maps)
    - Crop multi-select with checkboxes
    - Price history table (for existing contacts)
    - Notes textarea
  - Save button (green primary)
  - Cancel button (gray outline)

- [ ] Add communication log viewer:
  - Timeline view of past interactions
  - Filter by communication type
  - Add new communication entry
  - Link to orders/transactions

- [ ] Build price reference table:
  - Crop name
  - Current market price
  - Contact's last offered price
  - Price trends (up/down arrows with colors)
  - Date of last update
  - Source information
  - Color code good prices (green) vs high prices (yellow/red)

- [ ] Add contact import/export:
  - Import from CSV/Excel
  - Export to CSV/Excel
  - Template download for imports
  - Bulk upload with validation

- [ ] Create contact favorites/pinning:
  - Star/pin favorite contacts
  - Favorites section at top
  - Quick access to frequently contacted

**For Warehouse Manager (Read-Only):**
- [ ] Same `ContactsPage.tsx` in read-only mode
  - Hide "Add Contact" button
  - Disable edit/delete actions
  - Show view-only indicators
  - Can search and filter
  - Can view contact details
  - Can initiate communication (call/email)

**For QC Representative (Limited Read-Only):**
- [ ] Create simplified `ContactInfo.tsx` page
  - View warehouse contacts only
  - Basic contact information
  - Call/Email functionality
  - No buyer/farmer details (business privacy)

**Shared Components:**
- [ ] `ContactCard.tsx` - Reusable contact display
- [ ] `ContactTypeBadge.tsx` - Color-coded type indicator
- [ ] `PriceHistoryChart.tsx` - Visual price trends
- [ ] `CommunicationTimeline.tsx` - Interaction history

#### 7.3 Contact Features
- [ ] Add contact notes and tags
  - Quick notes per contact
  - Custom tags for categorization
  - Tag-based filtering

- [ ] Build relationship management:
  - Track preferred contacts
  - Rating system (1-5 stars)
  - Reliability score
  - Response time tracking

- [ ] Add bulk operations (Owner only):
  - Bulk delete
  - Bulk tag assignment
  - Bulk export

- [ ] Create contact analytics:
  - Most contacted
  - Best price providers
  - Most reliable suppliers
  - Regional distribution map

**Deliverables:**
- Complete contact management for Owners
- Read-only contact views for Managers and QC Reps
- Price reference and market data
- Import/export functionality
- Communication logging
- Role-based access control

---

### **PHASE 8: Analytics & Reporting** 📊 (Priority: MEDIUM)
**Focus:** Impact tracking, analytics, ROI metrics, reporting
**Primary Users:** Warehouse Owner (all warehouses), Warehouse Manager (own warehouse)

**Objective:** Build comprehensive analytics and reporting with role-based data access

#### 8.1 Analytics Engine (Backend)
- [ ] Create analytics service in `server/services/analyticsService.js`:
  - Calculate waste reduction metrics
  - Track inventory turnover
  - Measure allocation efficiency
  - Compute cost savings
  - Calculate ROI
  - Trend analysis algorithms

- [ ] Implement analytics calculation functions:
  - Before/after loss comparison (baseline vs current)
  - Risk intervention success rate (% of high-risk batches saved)
  - Average dispatch time (warehouse efficiency)
  - Fulfillment rate (% of requests fulfilled)
  - Revenue per batch
  - Storage cost optimization
  - Spoilage prevention savings

- [ ] Add data aggregation endpoints:
  - GET `/api/analytics/overview` - Summary stats (role-filtered)
  - GET `/api/analytics/waste-reduction` - Waste metrics
  - GET `/api/analytics/efficiency` - Efficiency metrics per warehouse
  - GET `/api/analytics/roi` - ROI calculations
  - GET `/api/analytics/trends` - Time-series data
  - GET `/api/analytics/comparison` - Warehouse comparison (Owner only)
  - GET `/api/analytics/export` - Data export

- [ ] Create benchmarking against industry standards:
  - Compare with agricultural industry averages
  - Goal tracking (set targets, measure progress)
  - Performance scoring

- [ ] Add date range filtering for reports:
  - Last 7/30/90 days
  - Custom date range
  - Month/Quarter/Year views

- [ ] Implement data export functionality:
  - Export as CSV
  - Export as Excel
  - Export as PDF report

- [ ] Add RLS policies (Owner: all data, Manager: own warehouse only)

#### 8.2 Impact Dashboard (Frontend)

**For Warehouse Owner:**
- [ ] Create `ImpactDashboard.tsx` page (full system analytics)
  - Page header with date range selector
  - Export report button (green primary #48A111)
  - Background: white (#F7F0F0)

- [ ] Build key metric cards (prominent at top):
  - Total waste reduced (kg/tons):
    - Large number display
    - Green positive indicator (#48A111)
    - Comparison to previous period
    - Trend arrow (up/down)
  - Cost savings (₹):
    - Currency formatted
    - Green for savings (#48A111)
    - Percentage improvement
  - Efficiency improvement (%):
    - Percentage display
    - Green for positive, yellow for neutral, red for negative
    - Progress bar
  - Successful interventions (#):
    - Count of high-risk batches saved
    - Green badge (#48A111)
    - Success rate percentage

- [ ] Add analytics visualizations with brand colors:
  - Waste reduction trend chart:
    - Line chart over time
    - Green line (#48A111)
    - Shaded area underneath
    - Comparison baseline (dashed line)
    - Annotations for key events

  - Risk intervention timeline:
    - Gantt-style timeline
    - Color-coded interventions (green/yellow/red by risk level)
    - Success/failure indicators
    - Interactive tooltips

  - Before/after comparison bars:
    - Horizontal bar chart
    - Before: Red/Gray
    - After: Green (#48A111)
    - Percentage improvement labels
    - Multiple metrics side-by-side

  - ROI growth chart:
    - Area chart with green gradient
    - Cumulative savings over time
    - Investment vs returns comparison
    - Break-even point annotation

  - Warehouse performance comparison:
    - Multi-series bar chart
    - Each warehouse different shade of green
    - Sortable by metric
    - Interactive legend

  - Efficiency metrics gauge:
    - Semi-circle gauge charts
    - Color zones (red/yellow/green)
    - Current value with needle
    - Target line indicator

- [ ] Create printable report layout:
  - Print-optimized CSS
  - Company branding/logo
  - Executive summary section
  - Key metrics snapshot
  - Charts and visualizations
  - Date range and filters applied
  - Page breaks for multi-page reports

- [ ] Add PDF export functionality:
  - Generate PDF from dashboard
  - Include all charts and metrics
  - Professional formatting
  - Save/download options
  - Email report functionality

- [ ] Build customizable date range selector:
  - Quick select buttons (7/30/90 days, YTD)
  - Custom date picker
  - Comparison period selector (vs last period, vs last year)
  - Apply filters button (green primary)

- [ ] Create shareable report links:
  - Generate unique shareable link
  - Password protection option
  - Expiration date setting
  - View-only access

- [ ] Add benchmark comparison view:
  - Industry average indicators
  - Percentile ranking
  - Goal tracking progress
  - Best-in-class comparison

- [ ] Implement scheduled report generation:
  - Schedule weekly/monthly reports
  - Email automation
  - Report recipients management
  - Custom report templates

**For Warehouse Manager:**
- [ ] Same `ImpactDashboard.tsx` but warehouse-specific
  - Metrics for their warehouse only
  - No multi-warehouse comparison
  - Cannot view other warehouse data
  - Can export own warehouse reports

**Additional Analytics Features:**
- [ ] Build interactive filters:
  - Filter by warehouse (Owner only)
  - Filter by date range
  - Filter by crop type
  - Filter by zone
  - Multiple filters simultaneously

- [ ] Add drill-down capability:
  - Click metric cards to see details
  - Click chart elements for more info
  - Navigate to related data
  - Breadcrumb navigation

- [ ] Create analytics insights (AI-powered):
  - Automated insights generation
  - "What's working well" highlights (green)
  - "Needs attention" alerts (yellow/red)
  - Recommendations for improvement
  - Trend predictions

- [ ] Build KPI tracking:
  - Set custom KPIs
  - Track progress to goals
  - Visual progress indicators
  - Alert when targets met/missed

- [ ] Add comparative analysis:
  - Month-over-month
  - Year-over-year
  - Warehouse-to-warehouse (Owner only)
  - Performance trends

**Shared Components:**
- [ ] `AnalyticsCard.tsx` - Reusable metric display
- [ ] `ChartContainer.tsx` - Wrapper for charts with consistent styling
- [ ] `DateRangePicker.tsx` - Custom date range selector
- [ ] `ExportButton.tsx` - Export functionality component
- [ ] `BenchmarkIndicator.tsx` - Show comparison to benchmarks

**Deliverables:**
- Comprehensive analytics engine
- Visual impact dashboard with brand colors
- PDF/Excel export functionality
- Role-based analytics access
- Scheduled reporting
- Benchmark comparisons
- Shareable reports

---

### **PHASE 9: Polish & Enhancement** ✨ (Priority: LOW)
**Focus:** UI/UX refinement, performance optimization, brand consistency
**All Users:** Improved experience across all roles

**Objective:** Polish the application with consistent brand styling, performance optimization, and enhanced UX

#### 9.1 UI/UX Improvements with Brand Colors

**Loading States:**
- [ ] Add loading states to all async operations:
  - Skeleton loaders for tables (gray shimmer effect)
  - Spinner for API calls (green primary #48A111)
  - Progress bars for uploads (green gradient #48A111 to #25671E)
  - Loading text with animation
  - Percentage indicators for long operations

**Error Handling:**
- [ ] Implement error boundaries:
  - Component-level error catching
  - Fallback UI with brand styling
  - Error icon (red)
  - "Something went wrong" message
  - Retry button (green primary)
  - Report error option
  - User-friendly error messages

**Empty States:**
- [ ] Create empty states for all lists with brand styling:
  - No inventory: 
    - Icon in light gray
    - "No batches yet" message
    - "Add your first batch" button (green primary #48A111)
    - Background: white (#F7F0F0)
  - No alerts:
    - Green checkmark icon
    - "All clear! No alerts" message
    - Positive messaging with green accents
  - No contacts:
    - Address book icon
    - "No contacts found" message
    - "Add contact" CTA (green primary)
  - No orders:
    - Order icon
    - "No orders yet" message
    - "Create request" button (green primary)

**Animations & Transitions:**
- [ ] Add smooth transitions and animations:
  - Page transitions (fade in/out)
  - Modal animations (slide up with bounce)
  - Hover effects on cards:
    - Subtle shadow increase
    - Border color change to green primary
    - Scale transform (1.02x)
  - Loading animations (spinning, pulsing)
  - Success animations (checkmark with green glow)
  - Button hover states (darken/lighten brand colors)
  - Sidebar expand/collapse animation
  - Dropdown menu animations
  - Toast notification slide-ins

**Brand Color Application:**
- [ ] Apply color palette consistently across all components:
  - Primary buttons: Green light (#48A111)
  - Primary button hover: Green dark (#25671E)
  - Secondary buttons: Yellow (#F2B50B)
  - Background: White (#F7F0F0)
  - Headers: Green dark (#25671E)
  - Links: Green light (#48A111)
  - Success states: Green light (#48A111)
  - Warning states: Yellow (#F2B50B)
  - Error states: Red (#DC2626)
  - Neutrals: Grays for text and borders

**Mobile Responsiveness:**
- [ ] Ensure full mobile responsiveness:
  - Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
  - Mobile-first CSS approach
  - Bottom navigation for mobile:
    - Green dark background (#25671E)
    - White icons
    - Active tab indicator (yellow #F2B50B)
  - Swipeable cards for inventory/orders
  - Touch-friendly buttons (44px minimum tap target)
  - Collapsible filters on mobile
  - Hamburger menu with brand colors
  - Responsive tables (horizontal scroll or stacked)
  - Mobile-optimized forms (large inputs, proper keyboard types)
  - Landscape orientation handling

**Dark Mode (Optional):**
- [ ] Add dark mode (if time permits):
  - Theme toggle switch
  - Dark color palette:
    - Background: #1a1a1a
    - Primary: Adjusted green light for dark bg
    - Secondary: Adjusted yellow
    - Text: #f5f5f5
  - Persistent theme preference in localStorage
  - Smooth theme transition
  - Logo variant for dark mode
  - Chart color adjustments

**Accessibility:**
- [ ] Improve accessibility:
  - ARIA labels on all interactive elements
  - ARIA live regions for dynamic content
  - Keyboard navigation:
    - Tab order optimization
    - Focus visible styles (green outline)
    - Escape to close modals
    - Enter to submit forms
    - Arrow keys for navigation
  - Focus indicators (green border #48A111)
  - Alt text for all images
  - Sufficient color contrast (WCAG AA compliance):
    - Green dark on white: ✓
    - Green light on white: Check and adjust if needed
    - Yellow on white: Check and adjust  - Text size minimum 16px for body
  - Screen reader support:
    - Semantic HTML
    - Descriptive link text
    - Form labels
    - Dynamic content announcements
  - Skip to main content link
  - Reduced motion support (prefers-reduced-motion)

**Visual Consistency:**
- [ ] Create design system documentation:
  - Color usage guidelines
  - Typography scale
  - Spacing system (4px, 8px, 16px, 24px, 32px)
  - Component library documentation
  - Icon set standardization
  - Border radius standards
  - Shadow system

- [ ] Standardize component styling:
  - Button variants (primary, secondary, outline, ghost)
  - Input field styling
  - Card styling
  - Badge variants
  - Modal styling
  - Table styling
  - Form styling

#### 9.2 Performance Optimization
- [ ] Implement React optimizations:
  - React.memo for expensive components (tables, charts)
  - useMemo for computed values (risk calculations, filters)
  - useCallback for event handlers (prevents re-renders)
  - Code splitting with React.lazy (per-route splitting)
  - Virtualization for long lists (react-window)
  - Debouncing for search inputs (300ms delay)
  - Throttling for scroll events

- [ ] Add lazy loading:
  - Lazy load routes
  - Lazy load components below the fold
  - Lazy load images (Intersection Observer)
  - Preload critical routes
  - Prefetch on hover (next likely pages)

- [ ] Optimize API calls:
  - Request debouncing for search
  - Response caching (react-query or SWR)
  - Pagination implementation (50 items per page)
  - GraphQL (optional alternative to REST)
  - Batch requests where possible
  - Cancel in-flight requests on unmount

- [ ] Implement caching strategies:
  - Browser localStorage for:
    - User preferences
    - Theme selection
    - Column visibility settings
    - Filter presets
  - IndexedDB for offline data (batches, contacts)
  - Service worker for PWA capabilities
  - API response caching (5-minute TTL)
  - Image caching

- [ ] Optimize assets:
  - Compress images (80% quality)
  - Use WebP format with fallback
  - Lazy load images below fold
  - SVG for icons and logos
  - Minify CSS/JS in production
  - Remove unused CSS (PurgeCSS)
  - Font optimization (subset fonts)

- [ ] Add bundle size optimization:
  - Tree shaking (ensure imports are tree-shakeable)
  - Remove unused dependencies
  - Code splitting per route
  - Analyze bundle (webpack-bundle-analyzer)
  - Target bundle size: <500KB initial

#### 9.3 Additional Features
- [ ] Add data export functionality:
  - Export inventory to CSV/Excel
  - Export contacts to Excel
  - Export reports to PDF
  - Export sensor data to CSV
  - Export with filters applied
  - Batch export multiple tables

- [ ] Create print-friendly views:
  - Print stylesheets (@media print)
  - Hide navigation/sidebar when printing
  - Black/white optimized for cost savings
  - Page breaks for multi-page content
  - Logo/branding on prints
  - Date/time stamp on prints

- [ ] Add bulk operations:
  - Bulk batch update (change zone, update quantities)
  - Bulk dispatch confirmation
  - Multi-select with actions
  - Select all/none toggle
  - Bulk delete with confirmation
  - Progress indicator for bulk operations

- [ ] Implement notification system:
  - In-app notifications:
    - Notification center/dropdown
    - Unread badge count (yellow #F2B50B)
    - Mark as read functionality
    - Notification types with icons
  - Browser push notifications:
    - Request permission on login
    - Critical alerts only
    - Customizable in settings
  - Email notifications:
    - Send summary emails
    - Real-time critical alerts
    - Daily/weekly digests
  - Notification preferences:
    - Toggle by notification type
    - Choose channels (in-app, email, push)
    - Quiet hours setting

- [ ] Add keyboard shortcuts:
  - Quick navigation (Ctrl+K command palette)
  - Action shortcuts:
    - Ctrl+N: New batch (Manager)
    - Ctrl+S: Search
    - Ctrl+E: Export
    - Ctrl+P: Print
    - Escape: Close modal
  - Search shortcut (/)
  - Help menu (?) - Show keyboard shortcuts
  - Visual shortcut hints on hover

- [ ] Create onboarding tour:
  - First-time user guide (role-specific)
  - Feature highlights with tooltips
  - Interactive walkthrough (step-by-step)
  - Progress indicator (e.g., "2 of 5")
  - Skip option (not mandatory)
  - "Don't show again" checkbox
  - Reactivate from help menu
  - Brand colored highlights (green/yellow)

**Deliverables:**
- Polished, performant application
- Consistent brand color usage throughout
- Mobile-responsive design
- Accessible interface (WCAG AA)
- Optimized loading times
- Enhanced user experience
- Production-ready polish

---

### **PHASE 10: Testing & Deployment** 🚀 (Priority: CRITICAL)

**Objective:** Ensure quality, stability, and deploy to production

#### 10.1 Testing
- [ ] Write unit tests:
  - Test risk calculation functions
  - Test allocation algorithm
  - Test utility functions
  - Test data formatters
- [ ] Test API endpoints:
  - Use Postman/Insomnia
  - Test all CRUD operations
  - Test authentication flows
  - Test error handling
- [ ] Test React components:
  - Use React Testing Library
  - Test user interactions
  - Test component rendering
  - Test hooks
- [ ] Integration testing:
  - Test end-to-end workflows
  - Test auth → inventory → allocation flow
  - Test PDF upload → parse → submit flow
  - Test sensor monitoring → alert → intervention
- [ ] Cross-browser testing:
  - Chrome
  - Firefox
  - Safari
  - Edge
- [ ] Mobile device testing:
  - iOS Safari
  - Android Chrome
  - Different screen sizes
  - Touch interactions

#### 10.2 Documentation
- [ ] Create API documentation:
  - Endpoint descriptions
  - Request/response examples
  - Authentication guide
  - Error codes reference
- [ ] Write user manual:
  - Getting started guide
  - Feature documentation
  - Role-specific guides
  - FAQ section
- [ ] Add inline code comments:
  - Complex logic explanation
  - Function documentation
  - Type definitions
- [ ] Create deployment guide:
  - Environment setup
  - Configuration steps
  - Database migration
  - Troubleshooting
- [ ] Document environment variables:
  - Required variables
  - Optional variables
  - Example values

#### 10.3 Deployment
- [ ] Set up production environment:
  - Configure production .env
  - Set up production Supabase (production project/database)
  - Configure error tracking (Sentry)
  - Set up monitoring (New Relic/Datadog)
- [ ] Deploy backend:
  - Choose platform (Railway/Render/Heroku/AWS)
  - Configure build scripts
  - Set up environment variables
  - Configure domain/SSL
  - Test deployed API
- [ ] Deploy frontend:
  - Choose platform (Vercel/Netlify/AWS S3+CloudFront)
  - Configure build settings
  - Set up environment variables
  - Configure custom domain
  - Enable HTTPS
- [ ] Set up CI/CD:
  - GitHub Actions workflow
  - Automated testing
  - Automated deployment
  - Branch protection rules
- [ ] Configure monitoring:
  - Uptime monitoring
  - Error tracking
  - Performance monitoring
  - Log aggregation
- [ ] Set up backups:
  - Database backup schedule
  - Backup restoration testing
  - Disaster recovery plan

**Deliverables:** Fully tested, documented, and deployed production application

---

## 🛠️ Technology Stack

### Design System
- **Color Palette:**
  - Primary Green Dark: #25671E (headers, navigation, primary dark elements)
  - Primary Green Light: #48A111 (buttons, CTAs, success states, fresh indicators)
  - Secondary Yellow: #F2B50B (warnings, moderate risk, accents, badges)
  - White: #F7F0F0 (backgrounds, cards, content areas)
  - Risk Colors: Green (#48A111), Yellow (#F2B50B), Red (#DC2626)

- **Typography:**
  - Font Family: System fonts (San Francisco, Segoe UI, Roboto, etc.)
  - Base Size: 16px
  - Scale: 12px, 14px, 16px, 18px, 24px, 32px, 48px

- **Spacing System:**
  - Base unit: 4px
  - Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

### Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS (customized with brand colors)
- **UI Components:** Custom component library with brand styling
- **Charts:** Chart.js or Recharts (configured with brand colors)
- **Forms:** React Hook Form + Yup validation
- **HTTP Client:** Axios with interceptors
- **State Management:** Context API / Zustand (if needed)
- **Routing:** React Router v6 with role-based route protection
- **Real-time:** Supabase Realtime subscriptions

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with role-based access control
- **File Upload:** Multer + Supabase Storage
- **AI:** Gemini API (@google/generative-ai)
- **Validation:** express-validator
- **Logging:** Morgan / Winston
- **Security:** Helmet, CORS, rate limiting

### DevOps
- **Deployment:** Vercel (frontend) + Railway/Render (backend)
- **Database Hosting:** Supabase (managed PostgreSQL)
- **File Storage:** Supabase Storage
- **Version Control:** Git + GitHub
- **Environment Management:** dotenv
- **Testing:** Jest + React Testing Library
- **CI/CD:** GitHub Actions

---

## 📊 Success Metrics

### For Production
- Reduce post-harvest losses by 15-20%
- Improve inventory turnover by 25%
- Reduce spoilage intervention time by 50%
- Achieve 90%+ allocation efficiency
- Support 50+ warehouses

---

## 🚨 Risk Mitigation

### Technical Risks
- **Gemini API Limits:** Implement rate limiting and caching
- **Database Performance:** Add indexes, implement pagination
- **Real-time Updates:** Use polling as fallback to WebSocket
- **Mobile Performance:** Optimize bundle size, lazy loading

### Schedule Risks
- **Scope Creep:** Stick to MVP for hackathon
- **Integration Issues:** Test early and often
- **Learning Curve:** Focus team members on familiar tech
- **Deployment Issues:** Deploy early to staging environment

---

## 👥 Team Task Assignment (Suggested)

### Team Member 1: Backend Lead + Database
- **Focus:** API development, Supabase setup, authentication
- Phase 1.1: Supabase database setup and RLS policies
- Phase 1.2: Authentication system with role-based access
- Phase 2.1: Inventory API with role filtering
- Phase 4.1: Allocation engine and API
- Phase 5.1: Gemini AI integration for PDF parsing
- Phase 7.1: Contacts API
- Testing: API endpoint testing

### Team Member 2: Frontend Lead + Component Library
- **Focus:** UI components, brand styling, dashboard development
- Design System: Set up Tailwind with brand colors
- Phase 1.2: AuthPage and authentication flow
- Phase 2.2: Inventory pages for Manager and Owner
- Phase 6: All three role-specific dashboards
- Phase 9.1: UI/UX polish and brand consistency
- Component library: Reusable components with brand styling

### Team Member 3: Full-Stack + Real-time Features
- **Focus:** Sensor system, allocation UI, real-time updates
- Phase 3.1 & 3.2: Sensor system (backend + frontend)
- Phase 3.3: Alert system with real-time updates
- Phase 4.2: Allocation interfaces (QC Rep + Manager views)
- Phase 8: Analytics engine and dashboard
- Real-time features: Supabase Realtime integration
- Phase 10: Testing and deployment

### Team Member 4: Designer/Frontend + QC Rep Workflow
- **Focus:** Design, mobile responsiveness, QC Rep features
- Design System: Color palette application, component design
- Landing Page: Polish and brand application
- Phase 5.2: PDF upload interface (QC Rep feature)
- Phase 6.3: QC Representative interface (OrderTracking, RequirementUpload)
- Phase 7.2: Contacts page UI
- Phase 9: Mobile responsiveness and accessibility
- UX testing: Ensure intuitive role-based navigation

---

## 🏁 Conclusion

This restructured plan provides a comprehensive, role-based roadmap from current state to production-ready application. The updated structure emphasizes:

### Key Highlights:
- **Role-Based Design:** Each user type (Owner, Manager, QC Rep) has tailored views and workflows
- **Brand Identity:** Consistent color palette (#F7F0F0, #F2B50B, #25671E, #48A111) throughout
- **Supabase Architecture:** PostgreSQL database with Row Level Security for role-based access
- **AI Integration:** Gemini-powered PDF parsing for QC Representatives
- **Real-time Features:** Live sensor monitoring and allocation updates
- **Scalability:** Designed to support multiple warehouses and growing user base

### Implementation Approach:
1. **Phase 1-2:** Foundation (auth, database, basic inventory)
2. **Phase 3-4:** Core features (sensors, allocation, risk management)
3. **Phase 5-6:** Role-specific features (PDF parsing, dashboards)
4. **Phase 7-8:** Advanced features (contacts, analytics)
5. **Phase 9-10:** Polish and deployment

### For Hackathon Success:
- **MVP Focus:** Prioritize Phases 1-4 for a working prototype
- **Demo-Ready Features:** Focus on visual impact (dashboards, charts, real-time updates)
- **Role Switching:** Implement easy role switching for demo purposes
- **Sample Data:** Create realistic demo data for all user types
- **Brand Consistency:** Apply color palette from day one

### For Long-term Success:
- Complete all phases systematically
- Maintain **role-based access control** throughout
- Build with **scalability** in mind (multi-warehouse support)
- Ensure **brand consistency** across all interfaces
- Maintain **code quality** and documentation
- Regular **security audits** for RLS policies
- **User feedback** loops for each role

### Success Metrics:
- **Technical:** All three user roles functional with proper access control
- **Design:** Consistent brand application across all pages
- **Performance:** Fast page loads, responsive UI
- **User Experience:** Intuitive navigation for each role
- **Impact:** Demonstrable waste reduction and efficiency gains

---

**Last Updated:** February 27, 2026  
**Project:** Godam Solutions - Intelligent Warehouse Management  
**Team:** Nexus (Aditya Rajput, Ved Jadhav, Harshil Biyani, Ansh Dudhe)

**Brand Colors:**  
🟢 Primary Green Dark: #25671E | 🟢 Primary Green Light: #48A111  
🟡 Secondary Yellow: #F2B50B | ⚪ White: #F7F0F0