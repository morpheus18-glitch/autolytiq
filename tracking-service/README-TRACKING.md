# 📊 Customer Tracking & Analytics System

Complete customer behavior tracking system with real-time analytics, session replay, and behavioral insights for automotive dealerships.

## 🎯 Features

### Core Tracking
- ✅ **Page View Tracking** - Every page visit, referrer, UTM parameters
- ✅ **Event Tracking** - Clicks, form submissions, vehicle views, interactions
- ✅ **Session Management** - Automatic session detection and reconstruction
- ✅ **User Identification** - Anonymous and identified user tracking
- ✅ **Device Detection** - Browser, OS, device type, screen resolution
- ✅ **Geographic Data** - IP-based location tracking

### Advanced Features
- ✅ **Heatmap Data** - Click coordinates for visualization
- ✅ **Scroll Tracking** - Engagement depth measurement
- ✅ **Time on Page** - Precise engagement timing
- ✅ **Conversion Funnels** - Multi-step conversion tracking
- ✅ **Vehicle Interest** - Detailed vehicle engagement metrics
- ✅ **Lead Scoring** - Behavioral scoring for hot leads
- ✅ **Session Replay** - Reconstruct customer journeys

### Analytics
- ✅ **Real-time Metrics** - Active users, live traffic
- ✅ **Traffic Sources** - UTM attribution, referrers
- ✅ **Top Content** - Most viewed pages and vehicles
- ✅ **Device Analytics** - Browser and device breakdown
- ✅ **Geographic Reports** - Location-based insights
- ✅ **Conversion Analysis** - Funnel performance

---

## 🚀 Quick Start

### 1. Start Services with Docker

```bash
cd tracking-service
docker-compose -f docker-compose.tracking.yml up -d
```

This starts:

- **ClickHouse** on port 8123 (HTTP) and 9000 (native)
- **Redis** on port 6379
- **Tracking API** on port 5001
- **Grafana** on port 3001

### 2. Initialize Frontend Tracking

```typescript
// app/layout.tsx or main.tsx
import { initializeTracker } from '@/lib/tracker';

// Initialize on app mount
useEffect(() => {
  initializeTracker({
    apiUrl: process.env.NEXT_PUBLIC_TRACKING_URL || 'http://localhost:5001/api/tracking',
    tenantId: 'your-tenant-id',
    debug: process.env.NODE_ENV === 'development',
  });
}, []);
```

### 3. Track Events in Components

```typescript
import { useTracking } from '@/hooks/useTracking';

function VehicleCard({ vehicle }) {
  const { trackVehicleView } = useTracking();

  const handleClick = () => {
    trackVehicleView(vehicle.id, {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
    });
  };

  return (
    <div onClick={handleClick} data-vehicle-id={vehicle.id}>
      {/* Vehicle card content */}
    </div>
  );
}
```

### 4. Identify Users

```typescript
import { getTracker } from '@/lib/tracker';

function LoginPage() {
  const handleLogin = async (email, password) => {
    const user = await login(email, password);
    
    // Identify the user for tracking
    getTracker().identify(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
    });
  };
}
```

-----

## 📊 ClickHouse Setup

### Access ClickHouse CLI

```bash
# Via Docker
docker exec -it automotive-clickhouse clickhouse-client

# Or via local client
clickhouse-client --host localhost --port 9000
```

### Verify Schema Creation

```sql
USE automotive_tracking;

SHOW TABLES;
-- Should show:
-- customer_events
-- customer_sessions
-- customer_profiles
-- vehicle_interests
-- conversion_funnels
-- click_heatmap

-- Check event count
SELECT count() FROM customer_events;
```

### Sample Queries

```sql
-- Active users in last 5 minutes
SELECT count(DISTINCT session_id) as active_sessions
FROM customer_events
WHERE event_timestamp >= now() - INTERVAL 5 MINUTE;

-- Most viewed vehicles today
SELECT
    JSONExtractString(properties, 'vehicleId') as vehicle_id,
    count() as views
FROM customer_events
WHERE event_name = 'vehicle_view'
  AND event_timestamp >= today()
GROUP BY vehicle_id
ORDER BY views DESC
LIMIT 10;

-- Traffic sources
SELECT
    utm_source,
    utm_medium,
    count(DISTINCT session_id) as sessions
FROM customer_events
WHERE event_timestamp >= now() - INTERVAL 7 DAY
GROUP BY utm_source, utm_medium
ORDER BY sessions DESC;
```

-----

## 🔧 Backend Integration

### Express Controller

```typescript
// backend/src/controllers/tracking.controller.ts
import { Request, Response } from 'express';
import { trackingService } from '../services/tracking.service';

export const recordEvents = async (req: Request, res: Response) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Invalid events array' });
    }

    await trackingService.insertEvents(events);

    // Trigger ML analysis for high-intent events
    const highIntentEvents = events.filter(e => 
      ['form_submit', 'test_drive_request', 'finance_application'].includes(e.event_name)
    );

    if (highIntentEvents.length > 0) {
      // Queue for ML processing
      await queueMlAnalysis(highIntentEvents);
    }

    res.status(200).json({ 
      success: true, 
      processed: events.length 
    });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to record events' });
  }
};
```

### Express Routes

```typescript
// backend/src/routes/tracking.routes.ts
import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// Event ingestion
router.post('/events', trackingController.recordEvents);

// Analytics endpoints
router.get('/analytics/realtime', analyticsController.getRealTimeMetrics);
router.get('/analytics/traffic-sources', analyticsController.getTrafficSources);
router.get('/analytics/top-pages', analyticsController.getTopPages);
router.get('/analytics/hot-leads', analyticsController.getHotLeads);
router.get('/analytics/funnel', analyticsController.getFunnelAnalysis);

// Session reconstruction
router.get('/sessions/:sessionId', analyticsController.getSessionReplay);

export default router;
```

-----

## 📈 Analytics Queries

### Real-Time Dashboard

```typescript
// Get current active users
const activeUsers = await clickhouse.query({
  query: `
    SELECT
      count(DISTINCT session_id) as active_sessions,
      count(DISTINCT customer_id) as identified_users
    FROM customer_events
    WHERE event_timestamp >= now() - INTERVAL 5 MINUTE
      AND tenant_id = {tenant_id:String}
  `,
  query_params: { tenant_id: tenantId },
});
```

### Hot Leads Detection

```typescript
// Identify high-intent customers
const hotLeads = await clickhouse.query({
  query: `
    SELECT
      customer_id,
      count() as total_events,
      countIf(event_name = 'vehicle_view') as vehicle_views,
      countIf(event_name = 'financing_calculator') as finance_checks,
      countIf(event_name = 'form_submit') as form_submits,
      max(event_timestamp) as last_activity,
      
      -- Intent Score
      (vehicle_views * 5) + 
      (finance_checks * 10) + 
      (form_submits * 20) as intent_score
    FROM customer_events
    WHERE tenant_id = {tenant_id:String}
      AND event_timestamp >= now() - INTERVAL 7 DAY
      AND customer_id IS NOT NULL
    GROUP BY customer_id
    HAVING intent_score >= 50
    ORDER BY intent_score DESC, last_activity DESC
    LIMIT 100
  `,
  query_params: { tenant_id: tenantId },
});
```

### Conversion Funnel

```typescript
// Analyze conversion funnel
const funnelData = await clickhouse.query({
  query: `
    SELECT
      countIf(step_1_visit IS NOT NULL) as visitors,
      countIf(step_2_vehicle_view IS NOT NULL) as vehicle_viewers,
      countIf(step_3_detail_view IS NOT NULL) as detail_viewers,
      countIf(step_5_form_submit IS NOT NULL) as form_submissions,
      countIf(step_6_test_drive IS NOT NULL) as test_drives,
      
      -- Conversion Rates
      (vehicle_viewers / visitors) * 100 as step1_to_2,
      (detail_viewers / vehicle_viewers) * 100 as step2_to_3,
      (form_submissions / detail_viewers) * 100 as step3_to_5,
      (test_drives / form_submissions) * 100 as step5_to_6
    FROM conversion_funnels
    WHERE tenant_id = {tenant_id:String}
      AND created_at >= now() - INTERVAL 30 DAY
  `,
  query_params: { tenant_id: tenantId },
});
```

-----

## 🎨 Frontend Usage Examples

### Automatic Page View Tracking

```typescript
// pages/_app.tsx or app/layout.tsx
import { usePageViewTracking } from '@/hooks/useTracking';

function MyApp({ Component, pageProps }) {
  // Automatically tracks page views on route changes
  usePageViewTracking();

  return <Component {...pageProps} />;
}
```

### Track Vehicle Interactions

```typescript
function VehicleDetailPage({ vehicle }) {
  const { trackVehicleView, trackEvent } = useTracking();

  useEffect(() => {
    // Track vehicle view on page load
    trackVehicleView(vehicle.id, {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
    });
  }, [vehicle.id]);

  const handlePhotoClick = (photoIndex: number) => {
    trackEvent('vehicle_photo_click', {
      vehicleId: vehicle.id,
      photoIndex,
    });
  };

  const handleFinancingClick = () => {
    trackEvent('financing_calculator_open', {
      vehicleId: vehicle.id,
      vehiclePrice: vehicle.price,
    });
  };

  return (
    <div>
      <VehicleGallery onPhotoClick={handlePhotoClick} />
      <button onClick={handleFinancingClick}>
        Calculate Payment
      </button>
    </div>
  );
}
```

### Track Form Submissions

```typescript
function ContactForm() {
  const { trackFormSubmit } = useTracking();

  const handleSubmit = async (data) => {
    // Track form submission
    trackFormSubmit('contact_form', {
      formType: 'contact',
      fields: Object.keys(data),
      // Don't send PII in tracking
    });

    await submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Track Test Drive Requests

```typescript
function TestDriveButton({ vehicle }) {
  const { trackEvent } = useTracking();

  const handleClick = () => {
    trackEvent('test_drive_request', {
      vehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
    });

    // Open test drive modal
    openTestDriveModal(vehicle);
  };

  return (
    <button onClick={handleClick}>
      Schedule Test Drive
    </button>
  );
}
```

-----

## 🔍 Session Replay

### Reconstruct Customer Journey

```typescript
// Get all events for a session
const sessionEvents = await clickhouse.query({
  query: `
    SELECT
      event_timestamp,
      event_name,
      page_path,
      page_title,
      time_on_page,
      scroll_depth,
      properties,
      device_type,
      browser
    FROM customer_events
    WHERE session_id = {session_id:String}
      AND tenant_id = {tenant_id:String}
    ORDER BY event_timestamp ASC
  `,
  query_params: { 
    session_id: sessionId,
    tenant_id: tenantId,
  },
});

// Reconstruct timeline
const timeline = sessionEvents.rows.map(event => ({
  timestamp: event.event_timestamp,
  action: event.event_name,
  page: event.page_path,
  duration: event.time_on_page,
  details: JSON.parse(event.properties),
}));
```

-----

## 🛡️ Privacy & GDPR Compliance

### Important Considerations

1. **Cookie Consent**: Implement cookie consent banner
1. **Data Retention**: Events auto-delete after 2 years (TTL)
1. **PII Handling**: Don’t track sensitive personal data
1. **Right to be Forgotten**: Implement data deletion endpoint
1. **Opt-out**: Allow users to disable tracking

### Example: Data Deletion

```typescript
// Delete all data for a customer
await clickhouse.query({
  query: `
    ALTER TABLE customer_events 
    DELETE WHERE customer_id = {customer_id:String}
      AND tenant_id = {tenant_id:String}
  `,
  query_params: { 
    customer_id: customerId,
    tenant_id: tenantId,
  },
});

// Also delete from other tables
await clickhouse.query({
  query: `
    ALTER TABLE customer_sessions 
    DELETE WHERE customer_id = {customer_id:String}
      AND tenant_id = {tenant_id:String}
  `,
  query_params: { 
    customer_id: customerId,
    tenant_id: tenantId,
  },
});
```

-----

## 📊 Grafana Dashboards

Access Grafana at <http://localhost:3001>

**Default credentials:**

- Username: `admin`
- Password: `admin_change_me`

### Pre-built Dashboards

1. **Real-time Traffic** - Live user activity
1. **Conversion Funnel** - Step-by-step conversion
1. **Vehicle Analytics** - Most viewed vehicles
1. **Traffic Sources** - UTM attribution
1. **Device Analytics** - Browser/device breakdown
1. **Hot Leads** - High-intent customers

-----

## 🔧 Troubleshooting

### Events Not Appearing

```bash
# Check if ClickHouse is running
docker ps | grep clickhouse

# Check ClickHouse logs
docker logs automotive-clickhouse

# Verify events are being received
docker logs automotive-tracking-api

# Check event count in ClickHouse
docker exec automotive-clickhouse clickhouse-client \
  --query "SELECT count() FROM automotive_tracking.customer_events"
```

### Performance Issues

```sql
-- Check table sizes
SELECT
    table,
    formatReadableSize(sum(bytes)) as size,
    sum(rows) as rows
FROM system.parts
WHERE database = 'automotive_tracking'
GROUP BY table;

-- Optimize tables if needed
OPTIMIZE TABLE customer_events FINAL;
```

-----

## 🚀 Production Deployment

### Environment Variables

```bash
# ClickHouse
CLICKHOUSE_URL=https://clickhouse.your-domain.com
CLICKHOUSE_DATABASE=automotive_tracking
CLICKHOUSE_USER=production_user
CLICKHOUSE_PASSWORD=secure_password

# Redis
REDIS_URL=redis://redis.your-domain.com:6379

# Security
API_KEY=generate-secure-random-key

# CORS
CORS_ORIGINS=https://your-dealership.com,https://app.your-dealership.com
```

### Scaling Recommendations

1. **ClickHouse Cluster** - Shard data across multiple nodes
1. **Redis Cluster** - For high-volume caching
1. **Load Balancer** - Distribute tracking API requests
1. **CDN** - Serve tracking script from CDN
1. **Queue System** - Use RabbitMQ/Kafka for event buffering

-----

## 📚 API Reference

### POST /api/tracking/events

**Request:**

```json
{
  "events": [
    {
      "event_name": "page_view",
      "event_timestamp": 1699564800000,
      "session_id": "sess_123",
      "tenant_id": "tenant_456",
      "page_url": "https://dealership.com/inventory",
      "page_path": "/inventory",
      "properties": {}
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "processed": 1
}
```

### GET /api/tracking/analytics/realtime

**Response:**

```json
{
  "active_sessions": 42,
  "identified_users": 18,
  "anonymous_users": 24,
  "page_views_last_minute": 127
}
```

-----

## 📄 License

Proprietary - Automotive DMS System

-----

## 🆘 Support

For issues or questions:

1. Check troubleshooting section above
1. Review ClickHouse logs
1. Verify frontend tracker is initialized
1. Check network requests in browser DevTools

-----

**Part 2 Complete!** ✅

You now have a complete customer tracking system with:

- High-volume event storage (ClickHouse)
- Real-time analytics capabilities
- Session replay and reconstruction
- Behavioral lead scoring
- Complete frontend SDK
- Docker orchestration
- Production-ready architecture

```
---

## ✅ **COMPLETION CHECKLIST FOR PART 2**

After completing all tasks, you should have:

- [x] ClickHouse schema with 6+ tables
- [x] 12+ pre-built analytics queries
- [x] Complete frontend tracking SDK
- [x] React hooks for easy integration
- [x] TypeScript types for all data structures
- [x] Docker Compose orchestration
- [x] Grafana dashboards
- [x] Complete documentation
- [x] Privacy/GDPR considerations
- [x] Production deployment guide

## 🧪 **Testing Instructions**

```bash
# 1. Start all services
cd tracking-service
docker-compose -f docker-compose.tracking.yml up -d

# 2. Verify services are running
docker ps
# Should see: clickhouse, redis, tracking-api, grafana

# 3. Check ClickHouse
docker exec -it automotive-clickhouse clickhouse-client
# Run: SHOW DATABASES; USE automotive_tracking; SHOW TABLES;

# 4. Test tracking in frontend
# Initialize tracker in your app and verify events in ClickHouse

# 5. View Grafana dashboards
open http://localhost:3001
# Login: admin / admin_change_me

# 6. Query some data
docker exec automotive-clickhouse clickhouse-client \
  --query "SELECT count() FROM automotive_tracking.customer_events"
```

-----

**PART 2 is now complete!** 🎉

You have a production-ready customer tracking system that can handle millions of events per day with real-time analytics.

Ready for **PART 3: Settings & Configuration Module**? 🚀
