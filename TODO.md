# Godam Solutions — TODO List

> Last updated: February 28, 2026  
> **Phases 1, 2, 5, and 6 are complete!** This file tracks all remaining work.

---

## Phase 3 — Sensor Monitoring 🌡️

- [ ] **Threshold config modal** — Wire up the "Configure Thresholds" button in `SensorMonitoring.tsx` (currently has no `onClick`). Build a modal with min/max inputs for each sensor type per zone; call `updateThreshold()` from `useEnvironmentalData` on save.
- [ ] **Historical trend charts** — Call `/api/sensors/readings/:warehouseId/history` (backend route already exists) and render a line chart (Recharts) for temperature, humidity, and gas levels with a date range selector.
- [ ] **Sensor data CSV export** — Add an export button that downloads current zone readings as a CSV file.

---

## Phase 4 — Allocation Engine 🎯

- [x] **`DispatchHistory` page** — ✅ COMPLETE. Page exists at `client/src/pages/DispatchHistory.tsx`. Integrated as tabs in both Manager and Owner dashboards instead of separate routes.
- [ ] **Smart allocation prioritization** — Create `server/utils/allocationEngine.js` that sorts/scores allocation matches by: high-risk batches first (>70%), freshness-to-demand-type matching (Fresh→Retail, Moderate→Hotels, High→Processing), deadline proximity, and batch utilization. Wire into the `/api/allocation/suggest-farmers` route.
- [ ] **Post-dispatch tracking screen** — After a Manager approves and dispatches an order, show a confirmation summary with dispatch ID, estimated date, and batch details. Currently the approve dialog just closes.
- [ ] **In-app messaging** — Basic message thread between QC Rep and Manager per allocation request (can use a `messages` table in Supabase). Add a "Message" button on `AllocationManagePage` and `QCOrders`.

---

## Phase 5 — AI PDF Parsing 🤖 ✅ COMPLETE

- [x] **Upload history page** — ✅ COMPLETE. Created `client/src/pages/PdfHistory.tsx` with full history view, edit/resubmit, re-parse, and delete actions. Route `/qc/pdf-history` added.
- [x] **Per-field confidence indicators** — ✅ COMPLETE. Added `ConfidenceBadge` component in `RequirementUpload.tsx` with color-coded badges (Green ≥80%, Yellow 50-79%, Red <50%).
- [x] **Multi-format support** — ✅ COMPLETE. Backend now supports PDF, JPG, PNG, and DOCX files. Added `extractTextFromImage()` in `gemini.js`, mammoth for Word docs, and updated frontend validation.

---

## Phase 6 — Role Dashboards 👥 ✅ COMPLETE

- [x] **Order status timeline UI** — ✅ COMPLETE. Created `OrderStatusTimeline.tsx` component with interactive horizontal timeline (Submitted → Under Review → Approved → Dispatched → Delivered). Integrated into `QCOrders.tsx`.
- [x] **Reorder from history** — ✅ COMPLETE. Added "Reorder" button on completed orders in `QCOrders.tsx` that navigates to `RequirementUpload` with pre-filled form data.
- [x] **`ContactInfo` page for QC Reps** — ✅ COMPLETE. Created `client/src/pages/ContactInfo.tsx` showing warehouse name, location, and manager contact info. Route `/qc/contacts` added.
- [x] **`DispatchHistory` for Manager/Owner** — ✅ COMPLETE. Added as tabs in both `ManagerDashboard.tsx` and `OwnerDashboard.tsx`.

---

## Phase 7 — Contact Management 📇

- [ ] **`contacts.js` backend** — `server/routes/contacts.js` is an empty placeholder (`export default {}`). Implement all routes:
  - `GET /farmers` — list farmers (already handled by `FarmerManagement` via Supabase direct, but no server-side route)
  - `GET /buyers` — list buyer contacts
  - `GET /:id` — single contact
  - `POST /` — create contact (Owner only)
  - `PUT /:id` — update contact (Owner only)
  - `DELETE /:id` — delete contact (Owner only)
  - `GET /search` — search by name/crop/location
- [ ] **Buyer contacts section** — `FarmerManagement.tsx` only handles farmers. Add a "Buyers" tab / separate page for buyer contacts with the same CRUD interface (Owner full access, Manager/QC read-only).
- [ ] **Price reference table** — Add a price history table per farmer/buyer contact showing crop, last offered price, market price, trend arrow (up/down), and date last updated.
- [ ] **Communication/interaction log** — Timeline of past interactions per contact (call, email, order, negotiation). Add a `contact_logs` table in Supabase and a timeline UI component.
- [ ] **Import/export contacts** — CSV/Excel import with validation and bulk export functionality.
- [ ] **`ContactInfo` page for QC Reps** — Simplified read-only view showing only warehouse manager contact info (see Phase 6).

---

## Phase 8 — Analytics & Reporting 📊

> Basic allocation analytics (order counts, fulfillment rate, per-warehouse performance table, order trend chart) are already built inside the **Owner Dashboard → Analytics tab**. What remains is a dedicated backend service, deeper impact metrics, and a standalone `ImpactDashboard` page.

### Backend

- [ ] Create `server/services/analyticsService.js` with functions for:
  - Waste reduction metrics (baseline vs current spoilage rate)
  - Inventory turnover rate
  - Allocation efficiency (fulfillment rate, avg dispatch time)
  - Cost savings / ROI calculation
  - Risk intervention success rate
- [x] Add analytics API endpoints:
  - `GET /api/analytics/overview` — summary stats (role-filtered)
  - `GET /api/analytics/waste-reduction` — waste metrics over time
  - `GET /api/analytics/efficiency` — per-warehouse efficiency
  - `GET /api/analytics/roi` — ROI calculations
  - `GET /api/analytics/trends` — time-series data
  - `GET /api/analytics/comparison` — warehouse comparison (Owner only)
  - `GET /api/analytics/export` — data export (CSV/Excel/PDF)
- [x] Add date range filtering to all analytics endpoints (7/30/90 days, custom range)

### Frontend

- [ ] Create `client/src/pages/ImpactDashboard.tsx` with:
  - Key metric cards: waste reduced, cost savings, efficiency improvement, successful interventions
  - Waste reduction trend line chart (Recharts) with comparison baseline
  - Before/after comparison horizontal bar chart
  - ROI growth area chart with green gradient
  - Warehouse performance comparison chart (Owner only)
  - Efficiency gauge charts
- [x] Add date range selector with quick-pick buttons (7d / 30d / 90d / YTD / custom)
- [x] Add PDF/Excel export of full dashboard report
- [x] Add a dedicated `/owner/analytics` route in `App.tsx` pointing to `ImpactDashboard` (currently Owner analytics lives inside the Owner Dashboard page as a tab, not a standalone page)
- [x] Add an **Analytics** nav item to `ownerNav` and `managerNav` in `AppLayout.tsx` (neither currently has one)

---

## Phase 9 — Polish & Enhancement ✨

> Currently ~5% implemented.

### Loading & Error States

- [ ] Add skeleton loaders to all major tables (inventory, orders, contacts, dispatch) — currently only spinners exist
- [ ] Add React error boundaries around major page sections with styled fallback UI

### Notifications

- [ ] **Notification dropdown** — The bell icon in the top-right navbar header is a placeholder with no `onClick`. Wire it up to show a dropdown of recent unacknowledged alerts (reuse data from `useAlertCount`).
- [ ] Add browser push notification support (request permission on login, fire on critical alerts)

### Performance

- [ ] Add `React.lazy()` + `Suspense` for per-route code splitting
- [ ] Add `useMemo` to risk calculations and filtered lists in `InventoryPage`
- [ ] Add `useCallback` to event handlers in frequently re-rendering components
- [ ] Implement `react-window` virtualization for inventory table when batch count is large

### Mobile Responsiveness

- [ ] Audit and fix all table layouts for mobile (inventory table, allocation table need horizontal scroll or card stacking on small screens)
- [ ] Test all breakpoints: 320px, 375px, 768px, 1024px, 1440px

### UX Polish

- [ ] Add keyboard shortcut: `Ctrl+K` command palette for quick navigation
- [ ] Add onboarding tour for first-time login (role-specific, using a tooltip/step library)
- [ ] Add page transition animations (fade in/out between routes)
- [ ] Standardize all hover/focus styles across buttons, cards, and inputs using brand colors
- [ ] Add `Escape` key to close all modals globally

### Accessibility

- [ ] Add `aria-label` to all icon-only buttons
- [ ] Add `aria-live` regions for dynamic content (alerts, status updates)
- [ ] Ensure all form inputs have associated `<label>` elements
- [ ] Verify WCAG AA color contrast for green light (#48A111) on white

---

## Phase 10 — Testing & Deployment 🚀

> Currently 0% implemented.

### Testing

- [ ] Write unit tests for `riskCalculation.ts` (all 4 factors, edge cases)
- [ ] Write unit tests for `allocationEngine.js` prioritization logic
- [ ] Write unit tests for `formatters.ts` utility functions
- [ ] Add API endpoint tests with Supertest for auth, inventory, sensors, allocation routes
- [ ] Add React Testing Library tests for `InventoryPage`, `AuthPage`, `AllocationManagePage`
- [ ] Add integration test for full flow: register → login → create batch → create allocation → approve

### Documentation

- [ ] Add JSDoc comments to all custom hooks (`useInventory`, `useAllocations`, `useEnvironmentalData`)
- [ ] Write API endpoint documentation (Postman collection or OpenAPI/Swagger spec)
- [ ] Update `README.md` with full setup instructions, environment variables, and dev server commands
- [ ] Write role-specific user guide (what each role can do and how)

### Deployment

- [ ] Set up production Supabase project (separate from dev)
- [ ] Configure production `.env` for server (disable dev-only routes, set `NODE_ENV=production`)
- [ ] Deploy backend to Railway or Render; add environment variables via dashboard
- [ ] Deploy frontend to Vercel; set `VITE_SUPABASE_URL`, `VITE_API_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Configure custom domain and HTTPS
- [ ] Set up GitHub Actions CI/CD:
  - Run build check on every PR
  - Auto-deploy `main` branch to production
- [ ] Configure Sentry for error tracking (frontend + backend)
- [ ] Set up Supabase scheduled database backups

---

## Quick Wins (Low effort, high visibility)

These can be done in under 30 minutes each:

- [ ] Wire up "Configure Thresholds" button in `SensorMonitoring.tsx` → threshold config modal (Phase 3)
- [ ] Wire up bell icon in top navbar → alert dropdown using existing `useAlertCount` data (Phase 9)
- [x] ~~Add "Reorder" button to completed order rows in `QCOrders.tsx`~~ ✅ COMPLETE (Phase 6)
- [x] ~~Add PDF upload history page + route `/qc/pdf-history`~~ ✅ COMPLETE (Phase 5)
- [x] ~~Add `/manager/dispatch` and `/owner/dispatch` routes + `DispatchHistory` placeholder page~~ ✅ COMPLETE (Phase 4/6 - integrated as dashboard tabs)
