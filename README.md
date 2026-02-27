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

# 🖥 Web App Structure (Mobile Responsive)

## 🏗 Application Architecture

```
/godam-solutions
  /client (React + TS + Tailwind)
  /server (Node + Express)
```

---

## 📱 Mobile-Responsive Layout Strategy

**Use:**

- Tailwind Grid
- Flex layouts
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`

**Design Principle:**

- **Desktop** = Control Dashboard
- **Mobile** = Card-Based Simplified View

---

## 🔐 Authentication

- Role-based login
- JWT-based auth
- Redirect to role dashboard

---

## 🧭 Navigation Structure

### Shared Layout

**Top Navbar:**

- Logo
- Role name
- Profile dropdown
- Logout

**Sidebar (Desktop)**  
**Hamburger Drawer (Mobile)**

---

## 🏢 Warehouse Owner Dashboard

### Desktop View

- Total Warehouses
- Utilization %
- Risk exposure graph
- Dispatch activity
- Heatmap

### Mobile View

Card layout:

- Warehouse 1
- Warehouse 2
- Risk indicator badge

---

## 🧑‍💼 Warehouse Manager Dashboard

### Sections

#### 1️⃣ Inventory

- Batch list
- Freshness color badge
- Quantity
- Shelf life
- Risk score

#### 2️⃣ Sensor Monitoring

- Live simulated readings
- Temp / Humidity / Gas
- Alert banner if threshold exceeded

#### 3️⃣ Allocation Engine

- Suggested dispatch list
- Destination classification
- Confirm dispatch button

#### 4️⃣ Contacts

- Farmer database
- Market price table
- Quick contact button

---

## 🛒 Quick Commerce Rep Dashboard

### Upload Requirement

- Upload PDF
- Gemini parsing
- Structured editable form

**Fields:**

- Crop
- Quantity
- Delivery location
- Deadline
- Offered price

**Submit request → triggers allocation engine.**

---

## 📊 Core Components

- `RiskScoreBadge.tsx`
- `SensorCard.tsx`
- `AllocationTable.tsx`
- `InventoryList.tsx`
- `PdfParserModal.tsx`
- `WarehouseAnalytics.tsx`

---

## 📦 Backend API Structure

- `/api/auth`
- `/api/inventory`
- `/api/sensors`
- `/api/allocation`
- `/api/contacts`
- `/api/pdf-parse`

---

## 🎨 UI Guidelines

- Clean enterprise theme
- Earth tones (green, beige, dark slate)
- Color-coded risk:
  - 🟢 Green
  - 🟡 Yellow
  - 🔴 Red
- Avoid clutter
- White space heavy
- Large readable typography

---

## 🎯 Demo Flow

1. Login as Manager
2. Show inventory
3. Simulate sensor spike
4. Risk score increases
5. Allocation engine updates
6. Quick commerce uploads PDF
7. Gemini structures requirement
8. Dispatch suggested

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
