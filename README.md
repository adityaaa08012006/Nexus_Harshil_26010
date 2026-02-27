# 🌾 Godam Solutions

**Intelligent Post-Harvest Warehouse Optimization Framework**

---

## 1️⃣ Executive Summary

Godam Solutions is a scalable, data-driven warehouse management platform designed to reduce post-harvest losses in agricultural supply chains.

By integrating:

- Environmental monitoring (simulated sensors)
- Batch-level inventory tracking
- Spoilage risk scoring
- Demand-linked allocation
- AI-powered requirement parsing

Godam Solutions transforms traditional warehouses into intelligent, optimized decision-making hubs.

The platform bridges farmers, warehouse managers, and buyers through a structured and intelligent ecosystem, minimizing waste and maximizing value realization.

---

## 2️⃣ Problem Statement

India faces significant post-harvest losses due to:

- Absence of temperature and humidity monitoring
- Overstocking or underutilization of storage units
- Limited traceability of stored produce
- Delayed detection of spoilage conditions
- Poor coordination between warehouses and market demand

These inefficiencies lead to:

- Post-harvest losses
- Reduced farmer income
- Supply chain disruptions
- Price volatility

Despite expansion of storage infrastructure, many facilities lack intelligent optimization systems.

---

## 3️⃣ Current Solutions & Gaps

### Existing Systems

- Basic ERP dashboards
- Manual spreadsheet tracking
- Isolated cold storage systems
- Reactive (not predictive) decision making

### Gaps Identified

- No real-time spoilage intelligence
- No demand-aware allocation
- No freshness-based routing
- No AI-based requirement structuring
- No integrated farmer/market contact database

---

## 4️⃣ Proposed Solution – Godam Solutions

Godam Solutions is built around three integrated pillars:

### 🔹 A. Multi-Role Warehouse Platform

#### 1️⃣ Warehouse Owner

- Multi-warehouse visibility
- Performance analytics
- Utilization tracking
- Risk exposure monitoring

#### 2️⃣ Warehouse Manager

- Batch-level inventory management
- Sensor-based freshness monitoring (simulated)
- Smart allocation engine
- Maintenance tracking
- Farmer contact database
- Market price reference

#### 3️⃣ Quick Commerce Representative

- Upload requirement PDF
- Gemini parses and converts to structured editable form
- Confirm quantity, deadline, location, price
- Initiate allocation request

### 🔹 B. Sensor-Based Spoilage Intelligence (Simulated MVP)

**Sensors modeled:**

- Ethylene (ripening detection)
- MQ-137 (ammonia decay detection)
- CO₂ monitoring
- Temperature + Humidity (BME280 simulation)
- Moisture levels

**System calculates:**

#### 📊 Freshness Risk Score

Based on:

- Storage duration vs shelf life
- Temperature deviation
- Gas detection
- Demand velocity

**Classification:**

- **Fresh** → Retail / Quick Commerce
- **Moderate** → Hotels / Restaurants
- **Advanced** → Processing Units

### 🔹 C. Intelligent Allocation Engine

The rule-based allocation system:

- Prioritizes high-risk batches
- Matches with highest demand zones
- Minimizes stagnation
- Optimizes dispatch timing

**Simulated Result:**

> Compared to naive FIFO allocation, Godam Solutions reduces high-risk inventory stagnation by ~20% in simulated demand fluctuation cycles.

---

## 5️⃣ Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Fully Responsive UI

### Backend

- Node.js
- Express.js

### AI Integration

- Gemini API for PDF parsing and advisory suggestions

### Architecture

- Modular REST API
- Role-based access control
- Scalable cloud-ready deployment

---

## 5.5️⃣ Design Mockup Concept

Godam Solutions blends **Agricultural/Eco aesthetics** with a **high-tech Enterprise Intelligence** feel, creating a unique visual identity that resonates with both the agricultural context and the sophisticated technology platform.

### Visual Style & Approach

**Design Philosophy:**

- Modern Nature-Inspired palette combining earth tones with vibrant accents
- Clean, enterprise-grade interface with heavy white space
- Agricultural imagery balanced with data-driven intelligence displays

**Landing Page:**

- **Hero Section:** High-quality agricultural imagery with bold headlines emphasizing sustainability ("Saving the Earth" / "Optimizing Harvests")
- **Clear Call-to-Action:** Prominent "Get Started" button for immediate engagement
- **Feature Grid:** Simplified presentation of core innovations and platform capabilities
- **Responsive Design:** Seamlessly adapts from desktop to mobile viewing

### Dashboard Layout: The Intelligence Engine

The dashboard serves as the command center for warehouse optimization, featuring:

#### Sidebar Navigation

- **Desktop:** Persistent vertical sidebar on the left with links for Dashboard, Inventory, Monitoring, and Reports
- **Mobile:** Collapsible hamburger menu to maximize screen real estate

#### Top Metric Cards

Four responsive cards displaying critical KPIs:

1. **Total Inventory** - Current stock levels across warehouse
2. **High-Risk Batch %** - Percentage of inventory requiring immediate attention
3. **Storage Utilization** - Warehouse capacity usage metrics
4. **Active Alerts** - Real-time notifications for threshold breaches

#### Main Content Area

**Batch Tracking Table:**

- Detailed list of incoming produce batches
- Farmer IDs for traceability
- Shelf life indicators
- Current risk scores with visual cues

**Risk Scoring Engine:**

- Color-coded progress bars for at-a-glance assessment
- Green indicators for safe inventory
- Red indicators for high-risk batches requiring intervention
- Visual representation of spoilage probability

**Environmental Monitoring:**

- Real-time line charts tracking temperature fluctuations
- Humidity monitoring displays
- Historical trend analysis
- Threshold breach alerts

**Utilization Heatmap:**

- Visual representation of warehouse zones
- Capacity usage indicators by section
- Hot spots highlighting congested areas
- Optimization recommendations

### Frontend Architecture

The frontend follows a modular, scalable structure:

```
src/
├── assets/             # Brand assets and icons
│   ├── icons/         # Leaf, thermometer, warehouse icons
│   └── logos/         # Brand logos and variations
│
├── components/         # Reusable UI elements
│   ├── common/        # Universal components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── RiskBadge.tsx
│   │
│   ├── dashboard/     # Dashboard-specific components
│   │   ├── MetricCards.tsx
│   │   ├── RiskChart.tsx
│   │   ├── InventoryTable.tsx
│   │   └── AlertPanel.tsx
│   │
│   └── layout/        # Structural components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── hooks/             # Custom React hooks
│   ├── useEnvironmentalData.ts
│   ├── useInventory.ts
│   └── useAuth.ts
│
├── pages/             # Route components
│   ├── LandingPage.tsx    # Nature-inspired introduction
│   ├── Dashboard.tsx       # Primary data-driven interface
│   └── BatchDetails.tsx    # Detailed traceability data
│
├── types/             # TypeScript interfaces
│   ├── Batch.ts
│   ├── Risk.ts
│   └── User.ts
│
├── utils/             # Helper functions
│   ├── riskCalculation.ts  # Spoilage risk scoring logic
│   └── formatters.ts       # Data formatting utilities
│
└── App.tsx            # Routing and global state management
```

### Mobile Responsiveness Strategy

Godam Solutions ensures seamless operation across all devices:

#### Adaptive Navigation

- **Desktop:** Full sidebar with expanded menu items
- **Tablet:** Condensed sidebar with icon-first display
- **Mobile:** Hamburger menu or bottom navigation bar for space efficiency

#### Stackable Grids

Tailwind CSS responsive utilities enable flexible layouts:

- `grid-cols-1` on mobile (single column)
- `md:grid-cols-2` on tablets (two columns)
- `lg:grid-cols-4` on desktop (four columns)
- Top metric cards stack vertically on mobile, display in a single row on desktop

#### Scrollable Data Tables

- Tables with multiple columns wrapped in `overflow-x-auto` containers
- Horizontal swiping enabled on small screens
- Fixed column headers for context during scrolling
- Priority columns remain visible while less critical data scrolls

#### Touch-Friendly Targets

- All interactive elements maintain minimum 44px height
- Adequate spacing between clickable elements
- Large tap targets for "Early Intervention" alerts
- Swipe gestures for common actions on mobile

#### Progressive Enhancement

- Core functionality works on all devices
- Advanced features progressively enabled based on screen size
- Optimized images and assets for mobile networks
- Lazy loading for improved performance

---

## 6️⃣ Innovation & Uniqueness

✔ Freshness-based intelligent routing  
✔ Simulated multi-sensor spoilage detection  
✔ AI-powered PDF requirement extraction  
✔ Demand-aware allocation engine  
✔ Integrated farmer & market contact system  
✔ Risk scoring + advisory layer

> **Most systems monitor. Godam Solutions optimizes decisions.**

---

## 7️⃣ Target Customers

- Agricultural warehouses
- Cold storage networks
- Aggregator hubs
- Quick commerce supply centers
- Agri-tech startups

---

## 8️⃣ Business Model

### SaaS Model

- Per warehouse monthly subscription
- Tier-based feature unlock

### Enterprise Deployment

- Multi-warehouse integration
- Data analytics add-on

### Future Hardware Integration

- Sensor kit + software bundle

---

## 9️⃣ Market Opportunity

**India:**

- One of the largest agricultural producers globally
- Billions lost annually in post-harvest wastage
- Rapid growth in cold storage & quick commerce infrastructure

Godam Solutions addresses a scalable and expanding infrastructure gap.

---

## 🔟 Impact

### 📈 Economic

- Reduced post-harvest losses
- Increased farmer income
- Better inventory turnover
- Improved warehouse efficiency

### 🌱 Environmental

- Reduced food waste
- Lower carbon emissions
- Efficient resource utilization

### 🌍 SDG Alignment

- **SDG 2:** Zero Hunger
- **SDG 9:** Industry & Infrastructure
- **SDG 12:** Responsible Consumption

---

## 11️⃣ Risks & Mitigation

| Risk                 | Mitigation                         |
| -------------------- | ---------------------------------- |
| Sensor inaccuracy    | Threshold tuning + manual override |
| AI parsing failure   | Editable structured fallback       |
| Adoption resistance  | Clean UI + simple workflows        |
| Data inconsistencies | Role-based validation system       |

---

## 12️⃣ Roadmap & Future Scope

### Phase 1 (Hackathon MVP)

- Inventory management
- Risk scoring engine
- Allocation logic
- PDF parsing
- Role-based dashboards

### Phase 2

- Real hardware integration
- Predictive demand analytics
- Multi-warehouse optimization

### Phase 3

- AI-based procurement planning
- Network-wide logistics optimization
- Farmer-facing transparency portal

---

## 13️⃣ Financial Snapshot (Projected)

**Example:**

```
50 warehouses × ₹8,000/month
= ₹4,00,000/month
= ₹48,00,000/year
```

High-margin SaaS model with strong scalability.

---

## 🔥 Conclusion

Godam Solutions transforms passive agricultural storage into an intelligent, data-driven ecosystem that minimizes losses, improves efficiency, and strengthens post-harvest supply chains.

---

# 🖥 Web Application Pages

The Godam Solutions platform is designed as a responsive web application that works seamlessly on both desktop and mobile devices. The system is divided based on user roles to ensure efficient warehouse management, inventory monitoring, and demand coordination.

## 🏗 Application Architecture

```
/godam-solutions
  /client (React + TypeScript + Tailwind CSS)
  /server (Node.js + Express)
```

---

## 📱 Public Pages

### 1️⃣ Landing Page

**User Base:** Public / Judges / Visitors

**Purpose:**  
Introduces the platform and explains the problem it solves — post-harvest losses in agricultural supply chains.

**Key Features:**

- Overview of the problem and solution
- Platform introduction and value proposition
- Key benefits of Godam Solutions
- Architecture overview
- Link to login/demo
- Visual explanation of the smart warehouse concept
- Responsive hero section with agricultural imagery
- Feature grid showcasing core innovations

> This page is critical for first impressions during judging.

---

### 2️⃣ Authentication & Role Selection Page

**User Base:** All Users

**Purpose:**  
Allows users to securely log in and access dashboards based on their role in the system.

**Key Features:**

- Secure login system
- Role-based access control
- User session management (JWT)
- Redirect to appropriate dashboard
- Mobile-friendly login interface
- Password recovery option

**Roles Supported:**

- Warehouse Owner
- Warehouse Manager
- Quick Commerce Representative

---

## 🏢 Warehouse Owner Pages

These pages are designed for high-level monitoring and operational oversight.

### 3️⃣ Warehouse Owner Dashboard

**User Base:** Warehouse Owner

**Purpose:**  
Provides a consolidated overview of all warehouses managed by the owner.

**Key Features:**

- Overview of total warehouses
- Warehouse utilization statistics
- Risk exposure indicators across facilities
- Inventory distribution insights
- Dispatch activity overview
- Warehouse performance metrics
- Comparative analytics between warehouses
- Financial performance indicators

> This page focuses on analytics and decision-level insights.

**Mobile Adaptation:**

- Card-based layout for each warehouse
- Swipeable warehouse cards
- Expandable sections for detailed metrics

---

### 4️⃣ Warehouse Detail Page

**User Base:** Warehouse Owner

**Purpose:**  
Displays detailed operational data for a specific warehouse.

**Key Features:**

- Real-time inventory levels
- Spoilage risk distribution
- Storage conditions overview
- Manager activity logs
- Current supply vs demand analysis
- Performance trends and historical data
- Zone-wise utilization heatmap
- Alert history and resolution tracking

> Allows owners to monitor operational efficiency at the facility level.

**Mobile Adaptation:**

- Tabbed interface for different data views
- Scrollable metrics cards
- Collapsible sections for detailed analytics

---

## 🧑‍💼 Warehouse Manager Pages

These pages represent the core operational layer of the system.

### 5️⃣ Warehouse Manager Dashboard

**User Base:** Warehouse Manager

**Purpose:**  
Acts as the main control center for warehouse operations.

**Key Features:**

- Inventory summary with risk indicators
- Real-time sensor data overview
- Active risk alerts and notifications
- Incoming demand requests
- System-generated allocation suggestions
- Recent dispatch updates
- Quick action tools and shortcuts
- Performance metrics for the current shift

> This will be the primary demo page during the hackathon.

**Mobile Adaptation:**

- Priority alerts at the top
- Collapsible metric cards
- Quick action buttons with large touch targets
- Bottom navigation for key functions

---

### 6️⃣ Inventory Management Page

**User Base:** Warehouse Manager

**Purpose:**  
Allows managers to monitor and manage warehouse stock efficiently.

**Key Features:**

- Batch-level inventory tracking
- Crop classification and categorization
- Quantity tracking with unit conversion
- Shelf-life monitoring with countdown timers
- Freshness scoring with visual indicators
- Risk indicators for each batch
- Stock updates and adjustments
- Batch search and filtering
- Farmer traceability information
- Zone-wise inventory distribution

> This solves the problem of limited traceability in warehouses.

**Mobile Adaptation:**

- Card-based batch display
- Swipe actions for quick updates
- Horizontal scrolling for tables
- Filter drawer for advanced search

---

### 7️⃣ Sensor Monitoring Page

**User Base:** Warehouse Manager

**Purpose:**  
Displays environmental conditions inside the warehouse using simulated sensor data.

**Key Features:**

- Real-time temperature monitoring
- Humidity monitoring with threshold indicators
- Gas level detection (Ethylene, CO₂, Ammonia)
- Spoilage risk alerts
- Real-time simulated sensor feed
- Environmental trend visualization
- Zone-wise environmental status
- Historical data and trend analysis
- Threshold breach notifications
- Sensor health status

> This demonstrates the smart storage capability of the system.

**Mobile Adaptation:**

- Large sensor reading cards
- Swipeable zone views
- Simplified charts optimized for mobile
- Alert banner at the top

---

### 8️⃣ Allocation & Dispatch Page

**User Base:** Warehouse Manager

**Purpose:**  
Helps managers allocate inventory based on demand and freshness levels.

**Key Features:**

- Incoming demand requests queue
- System-generated allocation suggestions
- Freshness-based routing recommendations
- Dispatch approval system
- Supply-demand matching engine
- Optimization insights and reasoning
- Batch priority ranking
- Automatic risk-based prioritization
- Destination classification (Retail/Processing/Hotels)
- Dispatch history and tracking

> This page highlights the intelligent allocation engine.

**Mobile Adaptation:**

- Request cards with swipe-to-approve
- Priority badges for urgent allocations
- Simplified allocation view
- One-tap dispatch confirmation

---

### 9️⃣ Supply Network & Contacts Page

**User Base:** Warehouse Manager

**Purpose:**  
Provides quick access to supply chain contacts and market references.

**Key Features:**

- Farmer contact database with history
- Market buyers list and preferences
- Crop availability records
- Price reference information by market
- Quick sourcing tools during shortages
- Communication logs
- Seasonal trend data
- Preferred supplier lists
- Contact search and filtering

> This improves supply chain coordination and responsiveness.

**Mobile Adaptation:**

- Contact cards with quick call/message
- Search bar at the top
- Alphabetical scrolling
- Swipe actions for quick contact

---

## 🛒 Quick Commerce Representative Pages

These pages allow demand-side stakeholders to interact with the warehouse network.

### 🔟 Requirement Upload Page

**User Base:** Quick Commerce Representative

**Purpose:**  
Allows buyers to submit product requirements directly to warehouses.

**Key Features:**

- PDF upload for requirements
- AI-powered PDF parsing using Gemini API
- Automatic structured form generation
- Editable requirement fields
- Crop type and quantity specification
- Delivery location input with map
- Deadline specification
- Price offer submission
- Multiple item request support
- Attachment support for additional documentation

> This demonstrates the AI integration component of the project.

**Mobile Adaptation:**

- Camera integration for document capture
- Optimized file upload interface
- Large input fields for easy editing
- Step-by-step form wizard

---

### 1️⃣1️⃣ Order Tracking Page

**User Base:** Quick Commerce Representative

**Purpose:**  
Allows buyers to track the status of their requests and orders.

**Key Features:**

- Request status monitoring
- Real-time allocation updates
- Dispatch tracking with timeline
- Delivery timeline and ETA
- Order history and previous requests
- Status notifications
- Communication with warehouse
- Invoice and documentation access
- Reorder functionality

> This improves transparency in the supply chain.

**Mobile Adaptation:**

- Timeline view for order progress
- Push notification support
- Swipe to view order details
- Quick reorder buttons

---

## 📊 System Insights Page

### 1️⃣2️⃣ Allocation Insights & Impact Dashboard

**User Base:** Warehouse Owner, Warehouse Manager, Judges (Demo)

**Purpose:**  
Shows how the platform improves warehouse efficiency and reduces losses.

**Key Features:**

- Risk reduction analytics and trends
- Spoilage prevention insights
- Inventory optimization metrics
- Demand fulfillment rate tracking
- System performance analysis
- Cost savings calculations
- Before/after comparison metrics
- Waste reduction statistics
- Efficiency improvement graphs
- ROI calculations

> This page demonstrates the impact and effectiveness of Godam Solutions.

**Mobile Adaptation:**

- Scrollable metric cards
- Simplified charts for mobile viewing
- Key metrics highlighted at top
- Expandable sections for detailed data

---

## 📱 Mobile Responsiveness Strategy

The application is designed to be fully mobile responsive, ensuring usability across devices.

### Design Approach

**Responsive Framework:**

- Tailwind CSS responsive utilities
- Adaptive dashboards with breakpoint-specific layouts
- Card-based UI for mobile devices
- Collapsible navigation menus
- Optimized tables for smaller screens
- Touch-friendly interactions

**Breakpoints:**

- **Mobile:** `< 640px` - Single column, stacked cards
- **Tablet:** `640px - 1024px` - Two-column layouts
- **Desktop:** `1024px - 1280px` - Multi-column grids
- **Large screens:** `> 1280px` - Full dashboard layouts

### Mobile-Specific Optimizations

**Navigation:**

- Desktop: Persistent vertical sidebar
- Mobile: Hamburger menu with slide-out drawer
- Bottom navigation bar for key actions

**Data Display:**

- Dashboards convert to stacked cards
- Data tables become scrollable lists with horizontal scroll
- Charts optimize for portrait orientation
- Priority information shown first

**Interactions:**

- All buttons minimum 44px height for easy tapping
- Swipe gestures for common actions
- Pull-to-refresh functionality
- Haptic feedback on actions

**Performance:**

- Lazy loading for images and components
- Progressive image loading
- Optimized bundle size for mobile networks
- Offline capability for critical features

---

## 📦 Backend API Structure

**Core Endpoints:**

- `/api/auth` - Authentication and authorization
- `/api/inventory` - Batch and inventory management
- `/api/sensors` - Environmental monitoring data
- `/api/allocation` - Demand allocation engine
- `/api/contacts` - Farmer and buyer contacts
- `/api/pdf-parse` - AI-powered PDF parsing
- `/api/warehouses` - Warehouse management
- `/api/reports` - Analytics and insights
- `/api/users` - User management

---

## 🧩 Frontend Components & Page Mapping

This section maps the web pages to their corresponding React components in the `/client/src` directory.

### Page Components (`/client/src/pages`)

| Page               | Component File          | Key Features                             |
| ------------------ | ----------------------- | ---------------------------------------- |
| Landing Page       | `LandingPage.tsx`       | Hero section, feature grid, CTA buttons  |
| Auth Page          | `AuthPage.tsx`          | Login form, role selection, JWT handling |
| Owner Dashboard    | `OwnerDashboard.tsx`    | Multi-warehouse overview, analytics      |
| Warehouse Detail   | `WarehouseDetail.tsx`   | Single warehouse deep-dive               |
| Manager Dashboard  | `Dashboard.tsx`         | ✅ Created - Main control center         |
| Inventory Page     | `InventoryPage.tsx`     | Batch management, risk tracking          |
| Sensor Monitoring  | `SensorMonitoring.tsx`  | Real-time environmental data             |
| Allocation Page    | `AllocationPage.tsx`    | Demand-supply matching                   |
| Contacts Page      | `ContactsPage.tsx`      | Farmer/buyer database                    |
| Requirement Upload | `RequirementUpload.tsx` | PDF upload, AI parsing                   |
| Order Tracking     | `OrderTracking.tsx`     | Request status monitoring                |
| Batch Details      | `BatchDetails.tsx`      | ✅ Created - Traceability view           |
| Impact Dashboard   | `ImpactDashboard.tsx`   | Analytics and insights                   |

### Common Components (`/client/src/components/common`)

| Component       | File            | Purpose                                    |
| --------------- | --------------- | ------------------------------------------ |
| Button          | `Button.tsx`    | ✅ Created - Reusable button with variants |
| Input           | `Input.tsx`     | ✅ Created - Form input fields             |
| Risk Badge      | `RiskBadge.tsx` | ✅ Created - Color-coded risk indicators   |
| Card            | `Card.tsx`      | Container component for content            |
| Modal           | `Modal.tsx`     | Overlay dialogs                            |
| Loading Spinner | `Spinner.tsx`   | Loading states                             |
| Alert           | `Alert.tsx`     | Notification banners                       |
| Badge           | `Badge.tsx`     | Status indicators                          |
| Dropdown        | `Dropdown.tsx`  | Select menus                               |
| Tooltip         | `Tooltip.tsx`   | Contextual help                            |

### Dashboard Components (`/client/src/components/dashboard`)

| Component           | File                     | Purpose                            |
| ------------------- | ------------------------ | ---------------------------------- |
| Metric Cards        | `MetricCards.tsx`        | ✅ Created - Top KPI displays      |
| Risk Chart          | `RiskChart.tsx`          | ✅ Created - Risk visualization    |
| Inventory Table     | `InventoryTable.tsx`     | ✅ Created - Batch listing         |
| Alert Panel         | `AlertPanel.tsx`         | ✅ Created - Active alerts display |
| Sensor Card         | `SensorCard.tsx`         | Environmental readings display     |
| Allocation Table    | `AllocationTable.tsx`    | Demand-supply matching view        |
| Warehouse Analytics | `WarehouseAnalytics.tsx` | Performance metrics                |
| Heatmap             | `UtilizationHeatmap.tsx` | Zone capacity visualization        |
| Timeline            | `DispatchTimeline.tsx`   | Order progress tracking            |
| PDF Parser          | `PdfParserModal.tsx`     | AI-powered PDF upload              |

### Layout Components (`/client/src/components/layout`)

| Component      | File                | Purpose                             |
| -------------- | ------------------- | ----------------------------------- |
| Navbar         | `Navbar.tsx`        | ✅ Created - Top navigation bar     |
| Sidebar        | `Sidebar.tsx`       | ✅ Created - Collapsible navigation |
| Footer         | `Footer.tsx`        | ✅ Created - Footer content         |
| Page Container | `PageContainer.tsx` | Consistent page wrapper             |
| Breadcrumbs    | `Breadcrumbs.tsx`   | Navigation trail                    |

### Custom Hooks (`/client/src/hooks`)

| Hook                 | File                      | Purpose                              |
| -------------------- | ------------------------- | ------------------------------------ |
| useAuth              | `useAuth.ts`              | ✅ Created - Authentication logic    |
| useInventory         | `useInventory.ts`         | ✅ Created - Inventory data fetching |
| useEnvironmentalData | `useEnvironmentalData.ts` | ✅ Created - Sensor data polling     |
| useAllocation        | `useAllocation.ts`        | Allocation engine integration        |
| usePdfParser         | `usePdfParser.ts`         | Gemini API integration               |
| useWebSocket         | `useWebSocket.ts`         | Real-time updates                    |

### Utility Functions (`/client/src/utils`)

| Module           | File                 | Purpose                                  |
| ---------------- | -------------------- | ---------------------------------------- |
| Risk Calculation | `riskCalculation.ts` | ✅ Created - Spoilage scoring algorithms |
| Formatters       | `formatters.ts`      | ✅ Created - Data formatting utilities   |
| API Client       | `apiClient.ts`       | Axios wrapper with interceptors          |
| Validators       | `validators.ts`      | Form validation logic                    |
| Constants        | `constants.ts`       | App-wide constants                       |
| Date Utils       | `dateUtils.ts`       | Date manipulation helpers                |

### TypeScript Types (`/client/src/types`)

| Type       | File            | Purpose                                 |
| ---------- | --------------- | --------------------------------------- |
| Batch      | `Batch.ts`      | ✅ Created - Inventory batch interfaces |
| Risk       | `Risk.ts`       | ✅ Created - Risk scoring types         |
| User       | `User.ts`       | ✅ Created - User and auth types        |
| Sensor     | `Sensor.ts`     | Environmental data types                |
| Allocation | `Allocation.ts` | Demand-supply types                     |
| Warehouse  | `Warehouse.ts`  | Warehouse data types                    |
| Contact    | `Contact.ts`    | Farmer/buyer types                      |

### Implementation Status

✅ **Created** - Component exists in the codebase  
🔲 **Pending** - To be implemented based on requirements

---

## 🎨 UI Design Guidelines

**Visual Theme:**

- Clean enterprise-grade interface
- Agricultural/eco aesthetic with modern intelligence feel
- Earth tones with vibrant accent colors

**Color System:**

- Risk indicators:
  - 🟢 **Green** - Safe/Fresh (< 30% risk)
  - 🟡 **Yellow** - Moderate (30-70% risk)
  - 🔴 **Red** - High Risk (> 70% risk)

**Design Principles:**

- Avoid clutter - white space heavy
- Large readable typography
- Consistent component library
- Accessible color contrasts (WCAG AA)
- Icon-first navigation
- Progressive disclosure of information

---

## 🎯 Demo Flow

**Demonstration Sequence:**

1. **Landing Page** - Show problem statement and solution
2. **Login as Warehouse Manager** - Role-based authentication
3. **Manager Dashboard** - Overview of warehouse status
4. **View Inventory** - Batch-level tracking with risk scores
5. **Simulate Sensor Spike** - Temperature threshold breach
6. **Risk Score Updates** - Automatic recalculation
7. **Allocation Engine Response** - Priority suggestions update
8. **Quick Commerce Uploads PDF** - AI-powered requirement extraction
9. **Gemini Structures Requirement** - Show parsed and editable form
10. **Allocation Suggested** - Freshness-based routing
11. **Dispatch Confirmed** - Complete the cycle
12. **Impact Dashboard** - Show efficiency gains

**Clean. Controlled. Powerful.**

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👥 Contributors

Built with ❤️ by Team Nexus
Aditya Rajput
Ved Jadhav
Harshil Biyani
Ansh Dudhe

---

**⭐ If you find this project useful, please consider giving it a star!**
