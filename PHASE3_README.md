# Phase 3: Sensor Monitoring & Environmental Data - Implementation Guide

## 📋 Overview

Phase 3 implements a complete environmental monitoring system with real-time sensor data tracking, threshold management, and automated alerts for warehouse zones.

## 🎯 Features Implemented

### Backend

- ✅ **Sensor Data Simulator** - Realistic sensor readings generator
- ✅ **Sensor API Routes** - Complete RESTful API for sensor operations
- ✅ **Threshold Management** - Configure acceptable ranges per zone
- ✅ **Alert System** - Automatic threshold breach detection
- ✅ **Real-time Polling** - 10-second interval updates

### Frontend

- ✅ **SensorMonitoring Page** - Full environmental dashboard
- ✅ **SensorCard Component** - Visual sensor readings with status
- ✅ **useEnvironmentalData Hook** - Sensor data management
- ✅ **Zone Selector** - Switch between warehouse zones
- ✅ **Alert Integration** - Display sensor alerts in dashboard

### Warehouse Zones

1. **Grain Storage** - For cereals and pulses (15-25°C, 40-60% humidity)
2. **Cold Storage** - For temperature-sensitive items (2-8°C, 80-90% humidity)
3. **Dry Storage** - For items needing low humidity (18-25°C, 40-50% humidity)
4. **Fresh Produce** - For fruits and vegetables (10-15°C, 85-95% humidity)

## 🗄️ Database Setup

### Step 1: Run SQL Schema

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Open the file: `server/database/phase3-sensors-schema.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** to execute

This will create:

- `warehouses` table
- `sensor_thresholds` table
- `sensor_readings` table
- `sensor_alerts` table
- Row Level Security (RLS) policies
- Automatic default threshold triggers

### Step 2: Create a Test Warehouse

After running the schema, insert a test warehouse:

```sql
-- Get your owner user ID first
SELECT id, email FROM auth.users WHERE email = 'your-owner-email@example.com';

-- Insert warehouse (replace 'YOUR_USER_ID_HERE')
INSERT INTO public.warehouses (name, location, capacity, owner_id)
VALUES ('Test Warehouse', 'Mumbai, Maharashtra', 1000, 'YOUR_USER_ID_HERE');

-- Get the warehouse ID
SELECT id, name FROM public.warehouses;
```

### Step 3: Assign Warehouse to Manager

If you have a manager account, assign them to the warehouse:

```sql
-- Get your manager user ID
SELECT id, email, role FROM public.user_profiles WHERE role = 'manager';

-- Assign manager to warehouse (replace IDs)
UPDATE public.user_profiles
SET warehouse_id = 'WAREHOUSE_ID_HERE'
WHERE id = 'MANAGER_USER_ID_HERE';
```

## 🚀 Running the Application

### Start Backend Server

```powershell
cd server
npm start
```

The server will run on `http://localhost:5000`

### Start Frontend Client

```powershell
cd client
npm run dev
```

The client will run on `http://localhost:5173`

## 📱 Using the Sensor Monitoring System

### For Managers

1. **Login** as a manager account
2. **Navigate** to **Sensors** from the sidebar
3. **View** real-time sensor data for your assigned warehouse
4. **Switch zones** using the zone selector buttons
5. **Simulate data** using the "Simulate Data" button for testing
6. **Acknowledge alerts** when threshold breaches occur

### For Owners

1. **Login** as an owner account
2. **Navigate** to **Sensors** from the sidebar
3. **Select warehouse** from dropdown (if multiple warehouses)
4. **View** sensor data across all owned warehouses
5. **Monitor** environmental conditions across locations

## 🧪 Testing the System

### Generate Test Sensor Data

The system includes a simulator for testing. Click the **"Simulate Data"** button in the UI or use the API:

```bash
# Using curl (replace with your JWT token)
curl -X POST http://localhost:5000/api/sensors/simulate/WAREHOUSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"criticalChance": 0.15}'
```

This generates sensor readings with a 15% chance of critical values (for testing alerts).

### API Endpoints

All sensor endpoints require authentication. Include JWT token in header:
`Authorization: Bearer YOUR_TOKEN`

**Get Current Readings:**

```
GET /api/sensors/readings/:warehouseId
```

**Get Historical Data:**

```
GET /api/sensors/readings/:warehouseId/history?zone=Cold%20Storage&limit=50
```

**Get Zone-Specific Readings:**

```
GET /api/sensors/readings/:warehouseId/zone/Grain%20Storage
```

**Get Thresholds:**

```
GET /api/sensors/thresholds/:warehouseId
```

**Update Threshold:**

```
POST /api/sensors/thresholds
Content-Type: application/json

{
  "warehouse_id": "uuid",
  "zone": "Cold Storage",
  "temp_min": 2,
  "temp_max": 8,
  "humidity_min": 80,
  "humidity_max": 90,
  "ethylene_max": 1.0,
  "co2_max": 1000,
  "ammonia_max": 25
}
```

**Get Active Alerts:**

```
GET /api/sensors/alerts/:warehouseId?acknowledged=false
```

**Acknowledge Alert:**

```
POST /api/sensors/alerts/:alertId/acknowledge
```

**Simulate Sensor Data:**

```
POST /api/sensors/simulate/:warehouseId
Content-Type: application/json

{
  "criticalChance": 0.1
}
```

**Get Available Zones:**

```
GET /api/sensors/zones
```

## 📊 Sensor Thresholds by Zone

### Grain Storage

- **Temperature:** 15°C - 25°C
- **Humidity:** 40% - 60%
- **Ethylene:** < 1.0 ppm
- **CO2:** < 1000 ppm
- **Ammonia:** < 25 ppm

### Cold Storage

- **Temperature:** 2°C - 8°C
- **Humidity:** 80% - 90%
- **Ethylene:** < 1.0 ppm
- **CO2:** < 1000 ppm
- **Ammonia:** < 25 ppm

### Dry Storage

- **Temperature:** 18°C - 25°C
- **Humidity:** 40% - 50%
- **Ethylene:** < 1.0 ppm
- **CO2:** < 1000 ppm
- **Ammonia:** < 25 ppm

### Fresh Produce

- **Temperature:** 10°C - 15°C
- **Humidity:** 85% - 95%
- **Ethylene:** < 1.0 ppm
- **CO2:** < 1000 ppm
- **Ammonia:** < 25 ppm

## 🎨 UI Components

### SensorCard

Displays individual sensor readings with:

- **Current value** with large, bold display
- **Status indicator** (Normal/Warning/Critical)
- **Threshold range** display
- **Color-coded backgrounds** based on status
- **Last updated** timestamp with pulse indicator

### Alert Display

- **Real-time alerts** at top of page when thresholds breached
- **Color-coded severity** (Yellow for warning, Red for critical)
- **Alert messages** with current values
- **Acknowledge functionality** to clear alerts

### Zone Selector

- **Tab-style buttons** for each zone
- **Active zone highlighting** in green
- **Alert badges** on zones with active alerts
- **Smooth transitions** between zones

## 🔧 Customization

### Adding New Zones

Edit `server/utils/sensorSimulator.js`:

```javascript
const ZONE_PARAMETERS = {
  // ... existing zones
  "Your New Zone": {
    temp: { ideal: 20, variance: 3, min: 15, max: 25 },
    humidity: { ideal: 50, variance: 8, min: 40, max: 60 },
    ethylene: { ideal: 0.1, variance: 0.2, max: 1.0 },
    co2: { ideal: 400, variance: 100, max: 1000 },
    ammonia: { ideal: 0, variance: 3, max: 25 },
  },
};
```

Then update the ZONES array in `client/src/pages/SensorMonitoring.tsx`.

### Adjusting Polling Interval

Edit `client/src/pages/SensorMonitoring.tsx`:

```typescript
// Change from 10000ms (10 seconds) to your preferred interval
const { readings, ... } = useEnvironmentalData(warehouseId, undefined, 5000);
```

## 🐛 Troubleshooting

### No Sensor Data Appearing

1. **Check warehouse assignment:**

   ```sql
   SELECT id, name, email, role, warehouse_id
   FROM public.user_profiles
   WHERE email = 'your-email@example.com';
   ```

2. **Verify warehouse exists:**

   ```sql
   SELECT * FROM public.warehouses;
   ```

3. **Generate test data** using the "Simulate Data" button

### Authentication Errors

- Ensure JWT token is valid and not expired
- Check that user has proper role (manager or owner)
- Verify RLS policies are enabled in Supabase

### RLS Permission Errors

If you see "permission denied" errors:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'sensor%';

-- Re-run the RLS policy section from phase3-sensors-schema.sql
```

## 📈 Performance Considerations

### Database Indexes

All critical query paths are indexed:

- `sensor_readings` indexed on warehouse_id, zone, and reading_time
- `sensor_alerts` indexed on warehouse_id and acknowledged status
- Composite indexes for common query patterns

### Data Retention

Consider implementing data archiving for old sensor readings:

```sql
-- Archive readings older than 30 days
DELETE FROM public.sensor_readings
WHERE reading_time < NOW() - INTERVAL '30 days';
```

### Polling Optimization

- Frontend polls every 10 seconds (configurable)
- Only fetches latest reading per zone, not full history
- Alert checks happen server-side to minimize network traffic

## 🔐 Security

### RLS Policies

- **Managers** can only access their assigned warehouse
- **Owners** can access all warehouses they own
- **QC Reps** have no sensor data access
- **Service role** can insert readings (for simulator)

### API Authorization

All sensor endpoints require:

- Valid JWT token
- Proper role (manager or owner)
- Warehouse ownership verification

## 📚 File Structure

```
server/
├── database/
│   └── phase3-sensors-schema.sql      # Database schema
├── utils/
│   └── sensorSimulator.js             # Sensor data generator
└── routes/
    └── sensors.js                     # API endpoints

client/src/
├── components/
│   └── sensors/
│       └── SensorCard.tsx             # Sensor display card
├── hooks/
│   └── useEnvironmentalData.ts        # Sensor data hook
└── pages/
    └── SensorMonitoring.tsx           # Main monitoring page
```

## ✅ Verification Checklist

- [ ] Database schema executed successfully
- [ ] Warehouse created and linked to owner
- [ ] Manager assigned to warehouse (if applicable)
- [ ] Server running without errors
- [ ] Client running and accessible
- [ ] Can login as manager/owner
- [ ] Sensors page loads without errors
- [ ] Can simulate sensor data
- [ ] Sensor cards display readings
- [ ] Zone switching works
- [ ] Alerts appear when thresholds breached
- [ ] Auto-polling updates data every 10 seconds

## 🚀 Next Steps

After Phase 3 is working:

1. **Phase 4** - Allocation Engine (QC Rep workflow, demand-supply matching)
2. **Phase 5** - Advanced Features (real-time WebSockets, mobile app, predictive analytics)

## 💡 Tips

- Use **"Simulate Data"** button liberally during testing
- Set `criticalChance: 0.3` for more frequent alerts
- Monitor browser console for API errors
- Check Supabase logs for database issues
- Test with both manager and owner roles

---

**Phase 3 Complete!** 🎉

Your warehouse now has real-time environmental monitoring with automated alerts.
