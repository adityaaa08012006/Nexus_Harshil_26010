# Alert System for Managers

## Overview

The alert system enables managers to receive real-time notifications when new allocation requests (orders) are created by QC representatives. This helps managers stay informed and respond promptly to incoming orders.

## Features

### For Managers

- **Warehouse-Specific Notifications**: Managers only receive alerts for orders assigned to their warehouse
- **Order Notifications**: Automatic alerts when QC reps submit new allocation requests for their warehouse
- **Alert Center**: Unified view of both sensor alerts and order alerts
- **Badge Notifications**: Alert count displayed in sidebar navigation
- **Filter Options**: View active, acknowledged, or all alerts
- **Acknowledgment**: Mark alerts as acknowledged to clear them from active view

### For QC Representatives

- **Warehouse Selection**: Must select a specific warehouse when creating allocation requests
- **Automatic Alert Creation**: When creating an allocation request, an alert is automatically generated for that warehouse's manager
- **No Manual Action Required**: Alert creation happens seamlessly in the background

## Implementation Details

### Database Structure

- **Table**: `alerts`
- **Type**: Added 'order' to alert types
- **Severity Levels**: info, warning, critical
- **Fields**: id, warehouse_id, zone (location), type, severity, message, is_acknowledged, acknowledged_by, acknowledged_at, created_at

### Alert Message Format

```
New order request for {quantity}{unit} of {crop} ({variety}) - {request_id}
```

Example: "New order request for 500kg of Wheat (Winter) - AR-12345-ABCD"

### API Integration

- **Endpoint**: POST /api/allocation
- **Trigger**: Automatically creates alert after successful allocation request creation
- **Visibility**: Only the manager of the specified warehouse can see the order alert
- **Warehouse Assignment**: warehouse_id must be provided when creating allocation requests

### Frontend Components

1. **AlertsPage**: Displays both sensor alerts and order alerts
2. **useAlertCount Hook**: Counts unacknowledged alerts for sidebar badge
3. **Alert Types**:
   - Sensor alerts (temperature, humidity, gas, etc.)
   - Order alerts (new allocation requests)

## User Workflow

### QC Representative Creates Order

1. QC rep fills out allocation request form
2. Selects a specific warehouse for order fulfillment
3. Submits request via RequirementUpload page
4. System creates allocation_request record with warehouse_id
5. System automatically creates alert for that warehouse's manager
6. Alert appears in the manager's Alert page

### Manager Receives Notification

1. Manager sees alert badge count increase in sidebar
2. Navigates to Alerts page
3. Views new order alert with details
4. Reviews order in Manager Dashboard
5. Acknowledges alert to clear it
6. Approves or rejects the order

## Database Migration

### Required Migrations

1. **File**: `server/database/migrations/add-order-alerts.sql`
   - Adds 'order' type to alerts table
   - Creates index for better query performance
   - Adds documentation comments

2. **File**: `server/database/migrations/add-warehouse-to-allocation-requests.sql`
   - Adds warehouse_id column to allocation_requests table
   - Creates foreign key relationship with warehouses table
   - Creates index for better query performance

**Note**: Both migrations must be executed in Supabase before the alert system will work properly.

## Testing Checklist

- [ ] Execute both database migrations in Supabase
- [ ] QC rep selects warehouse when creating allocation request
- [ ] Only the selected warehouse's manager receives alert notification
- [ ] Other warehouse managers do NOT see the alert
- [ ] Alert count badge updates in manager's sidebar
- [ ] Manager can view alert details specific to their warehouse
- [ ] Manager can acknowledge alert
- [ ] Alert disappears from active view after acknowledgment
- [ ] Alert count decreases after acknowledgment
- [ ] Manager Dashboard only shows orders for their warehouse

## Future Enhancements

Potential improvements:

- Email notifications for high-priority orders
- Push notifications for mobile devices
- Alert filtering by warehouse for multi-location managers
- Alert escalation for urgent orders
- Bulk acknowledgment of multiple alerts
- Alert history and analytics
