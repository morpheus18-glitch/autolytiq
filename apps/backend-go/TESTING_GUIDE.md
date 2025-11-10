# AutolytiQ Go Backend - Testing Guide

**Last Updated**: 2025-11-10
**Status**: 53 Endpoints Ready for Testing
**Server**: http://localhost:3001

---

## Prerequisites

### 1. Database Setup

The server requires a PostgreSQL database. Set the `DATABASE_URL` environment variable:

```bash
# Local PostgreSQL
export DATABASE_URL="postgresql://user:password@localhost:5432/autolytiq?sslmode=disable"

# DigitalOcean Managed PostgreSQL (VPC)
export DATABASE_URL="postgresql://db-autolytiq:AVNS_r6HQxLXjLSfiUWhkh-y@private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com:25060/db-autolytiq?sslmode=require"

# DigitalOcean Managed PostgreSQL (Public)
export DATABASE_URL="postgresql://db-autolytiq:AVNS_r6HQxLXjLSfiUWhkh-y@pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com:25060/db-autolytiq?sslmode=require"
```

### 2. JWT Keys

The server needs RSA key pair for JWT signing. Place keys in `apps/backend/keys/`:

```bash
# Should exist from Node.js backend
ls -la /root/autolytiq/apps/backend/keys/
# jwt-private.pem
# jwt-public.pem
```

### 3. Start Server

```bash
cd /root/autolytiq/apps/backend-go
export DATABASE_URL="your_connection_string"
./bin/server
```

Expected output:
```
✅ JWT public key loaded successfully
✅ JWT private key loaded successfully
🚀 Server starting on port 3001
```

---

## Quick Health Check

Test basic connectivity:

```bash
# Health endpoint (no auth required)
curl http://localhost:3001/health

# Expected response:
{
  "service": "autolytiq-backend-go",
  "status": "ok",
  "version": "1.0.0"
}

# Version endpoint (no auth required)
curl http://localhost:3001/api/version

# Expected response:
{
  "framework": "fiber",
  "runtime": "go",
  "version": "1.0.0"
}
```

---

## Authentication Flow

### 1. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autolytiq.com",
    "password": "your_password"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "admin@autolytiq.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "tenantId": "tenant_abc"
  }
}
```

### 2. Use Token for Protected Endpoints

```bash
# Save token to variable
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Make authenticated request
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Endpoint Testing (By Module)

### Customers API

```bash
# List customers
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Create customer
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-0100",
    "type": "BUYER"
  }'

# Get customer by ID
curl http://localhost:3001/api/customers/cust_123 \
  -H "Authorization: Bearer $TOKEN"

# Update customer
curl -X PUT http://localhost:3001/api/customers/cust_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-0200"
  }'

# Delete customer (soft delete)
curl -X DELETE http://localhost:3001/api/customers/cust_123 \
  -H "Authorization: Bearer $TOKEN"
```

### Vehicles API

```bash
# List vehicles
curl http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer $TOKEN"

# Search vehicles
curl "http://localhost:3001/api/vehicles/search?q=Toyota&minPrice=20000&maxPrice=30000" \
  -H "Authorization: Bearer $TOKEN"

# Create vehicle
curl -X POST http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "year": 2024,
    "make": "Toyota",
    "model": "Camry",
    "mileage": 12000,
    "askingPrice": 28500
  }'

# Get by VIN
curl http://localhost:3001/api/vehicles/vin/1HGBH41JXMN109186 \
  -H "Authorization: Bearer $TOKEN"
```

### Deals API

```bash
# List deals
curl http://localhost:3001/api/deals \
  -H "Authorization: Bearer $TOKEN"

# Filter deals
curl "http://localhost:3001/api/deals?status=DRAFT&stage=NEGOTIATION" \
  -H "Authorization: Bearer $TOKEN"

# Create deal
curl -X POST http://localhost:3001/api/deals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "vehicleId": "veh_456",
    "salespersonId": "user_789",
    "salePrice": 28500,
    "downPayment": 5000,
    "termMonths": 60,
    "interestRate": 4.99
  }'

# Submit deal for approval
curl -X POST http://localhost:3001/api/deals/deal_123/submit \
  -H "Authorization: Bearer $TOKEN"
```

### Notes API

```bash
# Create note for customer
curl -X POST http://localhost:3001/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "customer",
    "entityId": "cust_123",
    "content": "Customer is interested in financing options"
  }'

# Get notes for customer
curl http://localhost:3001/api/notes/customer/cust_123 \
  -H "Authorization: Bearer $TOKEN"

# Pin note
curl -X POST http://localhost:3001/api/notes/note_123/pin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isPinned": true
  }'
```

### Notifications API

```bash
# Get notifications for current user
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Get unread count
curl http://localhost:3001/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -X POST http://localhost:3001/api/notifications/notif_123/read \
  -H "Authorization: Bearer $TOKEN"

# Mark all as read
curl -X POST http://localhost:3001/api/notifications/mark-all-read \
  -H "Authorization: Bearer $TOKEN"
```

### TradeIns API

```bash
# Create trade-in
curl -X POST http://localhost:3001/api/trade-ins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "2HGFC2F50JH123456",
    "year": 2018,
    "make": "Honda",
    "model": "Accord",
    "mileage": 45000,
    "estimatedValue": 18000,
    "payoffAmount": 12000
  }'

# Appraise trade-in
curl -X POST http://localhost:3001/api/trade-ins/trade_123/appraise \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualCashValue": 17500,
    "allowance": 18000,
    "condition": "GOOD"
  }'
```

---

## Postman Collection

### Import Collection

1. Open Postman
2. Click "Import"
3. Paste this URL: `https://www.postman.com/collections/autolytiq-go-backend`
4. Or create manually using endpoints from `API_ENDPOINTS.md`

### Environment Variables

Create a Postman environment with:

```json
{
  "base_url": "http://localhost:3001",
  "token": "{{auth_token}}",
  "tenant_id": "tenant_abc",
  "user_id": "user_123"
}
```

---

## Integration Testing

### Test Scenarios

#### Scenario 1: Complete Deal Flow

1. Create customer
2. Create vehicle
3. Create deal (linking customer + vehicle)
4. Add note to deal
5. Submit deal for approval
6. Verify status changed to PENDING

#### Scenario 2: Trade-In Workflow

1. Create customer
2. Create trade-in vehicle
3. Appraise trade-in
4. Create new vehicle (purchase)
5. Create deal with trade-in
6. Verify relationships

#### Scenario 3: Multi-Tenant Isolation

1. Login as User A (Tenant 1)
2. Create customer
3. Login as User B (Tenant 2)
4. Try to access Tenant 1's customer (should fail with 404)
5. Verify tenant isolation

---

## Performance Testing

### Load Testing with `hey`

```bash
# Install hey
go install github.com/rakyll/hey@latest

# Test health endpoint (1000 requests, 50 concurrent)
hey -n 1000 -c 50 http://localhost:3001/health

# Expected results:
# Total: < 1s
# Requests/sec: > 1000
# Average latency: < 10ms
```

### Benchmarking vs Node.js

```bash
# Go backend
hey -n 10000 -c 100 http://localhost:3001/health

# Node.js backend (for comparison)
hey -n 10000 -c 100 http://localhost:3000/health

# Compare:
# - Total time
# - Requests/sec
# - Average latency
# - Memory usage (ps aux | grep server)
```

---

## Error Scenarios

### Test Error Handling

```bash
# Invalid JSON
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# Expected: 400 Bad Request

# Missing required fields
curl -X POST http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024
  }'

# Expected: 400 Bad Request, "VIN, year, make, and model are required"

# Unauthorized access
curl http://localhost:3001/api/customers

# Expected: 401 Unauthorized

# Resource not found
curl http://localhost:3001/api/customers/nonexistent_id \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found

# Duplicate VIN
curl -X POST http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "year": 2024,
    "make": "Toyota",
    "model": "Camry",
    "mileage": 12000
  }'

# Create again with same VIN
# Expected: 409 Conflict, "Vehicle with VIN ... already exists"
```

---

## Monitoring & Debugging

### Check Server Logs

```bash
# View logs in real-time
./bin/server

# Sample output:
# [2025-11-10 01:44:37] 200 - POST /api/auth/login (45.23ms)
# [2025-11-10 01:44:38] 200 - GET /api/customers (12.45ms)
```

### Database Queries

```bash
# Connect to PostgreSQL
PGPASSWORD=your_password psql -U username -h localhost -d autolytiq

# Check customer count
SELECT COUNT(*) FROM customers WHERE tenant_id = 'tenant_abc';

# Check recent deals
SELECT id, deal_number, status, created_at
FROM deals
WHERE tenant_id = 'tenant_abc'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Server Won't Start

**Issue**: `Failed to connect to database`
**Solution**: Set `DATABASE_URL` environment variable

**Issue**: `Failed to load JWT public key`
**Solution**: Ensure keys exist in `apps/backend/keys/`

**Issue**: `Address already in use`
**Solution**: Kill existing process on port 3001

```bash
lsof -ti:3001 | xargs kill -9
```

### Authentication Failures

**Issue**: `Invalid credentials`
**Solution**: Verify user exists in database with correct password hash

**Issue**: `Token expired`
**Solution**: Login again to get fresh token (24-hour expiry)

### Permission Errors

**Issue**: `You can only edit your own notes`
**Solution**: Notes are creator-locked. Use correct user's token.

---

## Next Steps

1. **Set up CI/CD Testing**: Integrate tests into GitHub Actions
2. **Create E2E Test Suite**: Playwright/Cypress for full workflows
3. **Performance Baseline**: Document baseline metrics for comparison
4. **Frontend Integration**: Test with React frontend making real API calls
5. **Load Testing**: Stress test with realistic traffic patterns

---

**All 53 endpoints are ready for testing!** 🚀

For production deployment, see: `DEPLOYMENT_CHECKLIST.md`
