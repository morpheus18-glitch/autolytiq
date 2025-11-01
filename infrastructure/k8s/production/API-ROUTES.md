# AutolytiQ API Routes & Endpoints Documentation

## Overview
This document describes all available API routes and endpoints in the AutolytiQ platform.

## Base URLs

### Production Domains
- **Frontend/App**: `https://app.autolytiq.com`
- **API**: `https://api.autolytiq.com`
- **ML Service**: `https://ml.autolytiq.com`
- **Alternative Domains**:
  - `https://autolytiq.com` → Frontend
  - `https://www.autolytiq.com` → Frontend
  - `https://dms.autolytiq.com` → Frontend (DMS interface)

### Internal Services (Kubernetes)
- **Backend**: `backend.autolytiq-prod.svc.cluster.local:80`
- **Frontend**: `frontend.autolytiq-prod.svc.cluster.local:80`
- **ML Service**: `ml-service.autolytiq-prod.svc.cluster.local:80`
- **Rust Pricing**: `rust-pricing.autolytiq-prod.svc.cluster.local:50051` (gRPC)
- **Redis**: `redis.autolytiq-prod.svc.cluster.local:6379`

---

## Health & Monitoring Endpoints

### Backend Health
**No authentication required**

#### `GET /health`
Overall system health check

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T23:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 4
    }
  }
}
```

#### `GET /ready`
Kubernetes readiness probe

**Response 200:**
```json
{
  "status": "ready",
  "timestamp": "2025-10-31T23:00:00.000Z"
}
```

#### `GET /live`
Kubernetes liveness probe

**Response 200:**
```json
{
  "status": "alive",
  "timestamp": "2025-10-31T23:00:00.000Z",
  "uptime": 12345.67,
  "memory": {
    "used": 256,
    "total": 512
  }
}
```

#### `GET /health/database`
Database connection health

#### `GET /health/ml`
ML service connectivity health

#### `GET /health/pricing`
Rust pricing service health

#### `GET /health/ml/cache`
ML cache statistics

---

## API Endpoints
**Base Path**: `/api`
**Authentication**: Required (JWT Bearer Token)
**Multi-tenancy**: X-Tenant header required

### Authentication
All API endpoints require:
- **Authorization**: `Bearer <JWT_TOKEN>`
- **X-Tenant**: `<tenant_id>`

### Leads Management

#### `GET /api/leads`
List all leads for tenant

#### `POST /api/leads`
Create a new lead

#### `GET /api/leads/:id`
Get lead details

#### `PUT /api/leads/:id`
Update lead

#### `DELETE /api/leads/:id`
Delete lead

---

### Timeline

#### `GET /api/timeline`
Get unified customer timeline (all touchpoints)

**Query Parameters:**
- `customerId` (string, optional) - Filter by customer
- `leadId` (string, optional) - Filter by lead
- `categories` (array, optional) - Filter by categories: ACTIVITY, COMMUNICATION, APPOINTMENT, DEAL, SERVICE
- `types` (array, optional) - Filter by specific types: EMAIL, CALL, SMS, etc.
- `actorId` (string, optional) - Filter by user
- `fromDate` (ISO date, optional) - Start date
- `toDate` (ISO date, optional) - End date
- `cursor` (ISO timestamp, optional) - Pagination cursor
- `limit` (number, optional) - Results per page (1-100, default: 50)

**Response 200:**
```json
{
  "events": [
    {
      "id": "evt_123",
      "category": "COMMUNICATION",
      "type": "EMAIL",
      "title": "Follow-up email sent",
      "body": "Thank you for your interest...",
      "occurredAt": "2025-11-01T10:30:00Z",
      "createdAt": "2025-11-01T10:30:00Z",
      "actor": {
        "id": "user_456",
        "firstName": "Sarah",
        "lastName": "Johnson"
      },
      "direction": "OUTBOUND",
      "status": "DELIVERED"
    }
  ],
  "nextCursor": "2025-10-31T15:20:00Z",
  "hasMore": true
}
```

#### `GET /api/timeline/stats/:customerId`
Get timeline statistics for customer

**Response 200:**
```json
{
  "totalEvents": 123,
  "activityCount": 45,
  "communicationCount": 67,
  "appointmentCount": 11,
  "lastInteraction": "2025-11-01T10:30:00Z"
}
```

---

### Activities

#### `GET /api/activities`
List all activities

#### `POST /api/activities`
Create activity

#### `GET /api/activities/:id`
Get activity details

#### `PUT /api/activities/:id`
Update activity

#### `DELETE /api/activities/:id`
Delete activity

---

### Communications

#### `GET /api/communications`
List communications

#### `POST /api/communications`
Send communication (email/SMS)

#### `GET /api/communications/:id`
Get communication details

---

### Appointments

#### `GET /api/appointments`
List appointments

#### `POST /api/appointments`
Create appointment

#### `GET /api/appointments/:id`
Get appointment details

#### `PUT /api/appointments/:id`
Update appointment

#### `DELETE /api/appointments/:id`
Cancel appointment

---

### Automations

#### `GET /api/automations`
List automation rules

#### `POST /api/automations`
Create automation rule

#### `GET /api/automations/:id`
Get automation details

#### `PUT /api/automations/:id`
Update automation

#### `DELETE /api/automations/:id`
Delete automation

---

### Machine Learning

#### `POST /api/ml/predict`
Get ML predictions

#### `POST /api/ml/score`
Score lead/deal

#### `GET /api/ml/models`
List available ML models

---

### F&I (Finance & Insurance)

#### `GET /api/fi/products`
List F&I products

#### `POST /api/fi/compliance/check`
Run compliance check

#### `GET /api/fi/menu/:dealId`
Get F&I menu for deal

---

### Desking

#### `POST /api/desking/calculate`
Calculate deal structure

#### `GET /api/desking/worksheet/:dealId`
Get deal worksheet

#### `POST /api/desking/optimize`
Optimize deal structure

---

### Lead Routing

#### `POST /api/lead-routing/test`
Test lead routing rules

**Roles Required**: ADMIN, BDC, SALES

---

## Webhook Endpoints
**Base Path**: `/api`
**Authentication**: Not required (webhook signature validation)

#### `POST /api/communications/twilio/webhook`
Twilio webhook for SMS status updates

**Content-Type**: `application/x-www-form-urlencoded`

#### `POST /api/communications/sendgrid/webhook`
SendGrid webhook for email events

**Content-Type**: `application/json`

---

## ML Service Endpoints
**Base URL**: `https://ml.autolytiq.com`

### Health & Documentation

#### `GET /health`
ML service health check

**Response 200:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### `GET /docs`
Interactive API documentation (Swagger UI)

#### `GET /openapi.json`
OpenAPI 3.0 specification

#### `GET /metrics`
Prometheus metrics

### Prediction Endpoints

#### `POST /predict/approval`
Predict deal approval probability

#### `POST /predict/lead-score`
Calculate lead score

#### `POST /predict/vehicle-value`
Predict vehicle value

---

## Rust Pricing Service
**Protocol**: gRPC
**Host**: `rust-pricing:50051`

### gRPC Methods

#### `GetPrice`
Calculate pricing for deal

#### `HealthCheck`
Service health check

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Missing/invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found
- **422**: Unprocessable Entity - Validation failed
- **429**: Too Many Requests - Rate limited
- **500**: Internal Server Error
- **503**: Service Unavailable

---

## Rate Limiting
- **Rate**: 100 requests per second per IP
- **Connections**: Max 20 concurrent connections per IP

---

## CORS Policy
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Allowed
- **Max Age**: 86400 seconds

---

## Security

### TLS/SSL
- **Minimum Version**: TLSv1.2
- **Preferred**: TLSv1.3
- **Ciphers**:
  - ECDHE-ECDSA-AES128-GCM-SHA256
  - ECDHE-RSA-AES128-GCM-SHA256
  - ECDHE-ECDSA-AES256-GCM-SHA384
  - ECDHE-RSA-AES256-GCM-SHA384

### Request Size Limits
- **Max Body Size**: 25MB
- **Timeouts**:
  - Proxy Send: 120 seconds
  - Proxy Read: 120 seconds

---

## Testing Endpoints

### Using curl

```bash
# Health check (no auth)
curl https://api.autolytiq.com/health

# API request (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Tenant: your-tenant-id" \
     https://api.autolytiq.com/api/leads

# ML prediction
curl -X POST https://ml.autolytiq.com/predict/approval \
     -H "Content-Type: application/json" \
     -d '{"deal_data": {...}}'
```

### Using Internal Services

```bash
# From within cluster
kubectl exec -it <pod> -- curl http://backend/health
kubectl exec -it <pod> -- curl http://ml-service/docs
```

---

## Support

For API support or questions:
- Check health endpoints first
- Review application logs: `kubectl logs -n autolytiq-prod <pod-name>`
- Check Grafana dashboards: `https://grafana.autolytiq.com`

---

**Last Updated**: 2025-10-31
**API Version**: v1
**Documentation Version**: 1.0.0
