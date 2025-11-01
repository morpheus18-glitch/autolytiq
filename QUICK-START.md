# AutolytiQ Quick Start Guide

## Prerequisites

All services are already running in Docker:
- ✅ PostgreSQL (database)
- ✅ Redis (cache)
- ✅ Prometheus & Grafana (monitoring)

## Step 1: Seed Permissions (Required - First Time Only)

```bash
cd /root/autolytiq/apps/backend
npx tsx src/scripts/seed-permissions.ts
```

Expected output:
```
🌱 Seeding permission definitions...
✅ Seeded 40+ permission definitions
🌱 Seeding role presets...
✅ Seeded 10 role presets
✨ Seeding completed successfully!
```

## Step 2: Start Backend

```bash
cd /root/autolytiq/apps/backend
NODE_ENV=development \
DATABASE_URL="postgresql://autolytiq:autolytiq@localhost:5432/autolytiq?schema=public" \
node dist/index.js
```

Or run in background:
```bash
cd /root/autolytiq
docker compose up -d backend
```

Backend will be available at: **http://localhost:5000**

## Step 3: Start Frontend

```bash
cd /root/autolytiq/apps/frontend
npm run dev
```

Or use production build:
```bash
cd /root/autolytiq/apps/frontend
npm run preview
```

Frontend will be available at: **http://localhost:3000**

## Step 4: Test Login

1. Open browser to **http://localhost:3000/login**

2. Use test credentials (if you have them) or create a user:
```sql
-- Connect to database
docker exec -it autolytiq-postgres psql -U autolytiq -d autolytiq

-- Create test user with admin role preset
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role, is_super_admin, status, permissions, custom_permissions)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM tenants LIMIT 1),
  'admin@test.com',
  '$2a$10$rH6SWuHPwJr.5SzKLr5cpeQhAXM8JDvPMxJQJ2UZFqPvHGO4dLECC', -- password: "password"
  'Test',
  'Admin',
  'ADMIN',
  true,
  'ACTIVE',
  '[]'::jsonb,
  '[]'::jsonb
);
```

3. Login with:
   - **Store ID**: MAIN
   - **Username**: admin@test.com
   - **Password**: password

## Step 5: Access Admin Pages

After logging in, navigate to:

- **Role Presets Management**: http://localhost:3000/admin/role-presets
- **User Permissions**: http://localhost:3000/admin/user-permissions
- **Dashboard**: http://localhost:3000/dashboard

## Key Features to Test

### 1. Custom Permissions
- Go to `/admin/role-presets`
- Create a custom role (e.g., "Custom Sales Manager")
- Select specific permissions
- Save and view the role card

### 2. Assign Permissions to Users
- Go to `/admin/user-permissions`
- Select a user
- Click "Manage Permissions"
- Assign a role preset OR add custom permissions
- Save changes

### 3. AI-Powered Deal Desking

**Create a Deal Worksheet**:
```bash
# API endpoint to test
curl -X POST http://localhost:5000/api/desking/worksheet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dealId": "deal-id-here",
    "structure": {
      "sellingPrice": 25000,
      "downPayment": 5000,
      "tradeInValue": 3000,
      "tradeInPayoff": 2000
    }
  }'
```

**Optimize Deal with AI**:
```bash
curl -X POST http://localhost:5000/api/desking/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "worksheetId": "worksheet-id-here",
    "optimizationGoal": "maximize_gross"
  }'
```

### 4. Digital Deal Jackets

**Create Deal Jacket**:
```bash
curl -X POST http://localhost:5000/api/deals/:dealId/jacket \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Upload Document**:
```bash
curl -X POST http://localhost:5000/api/deals/:dealId/jacket/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "category=customer_id"
```

## Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T02:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Grafana Dashboard
Open http://localhost:3001 (default credentials: admin/admin)

### Prometheus Metrics
Open http://localhost:9090

## Troubleshooting

### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker compose restart postgres
```

### Issue: "Permission denied" errors
```bash
# Run the seed script
cd /root/autolytiq/apps/backend
npx tsx src/scripts/seed-permissions.ts
```

### Issue: "Cannot find module"
```bash
# Rebuild the application
cd /root/autolytiq
npm run build
```

### Issue: Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Rebuild frontend
cd /root/autolytiq/apps/frontend
npm run build
npm run preview
```

## Environment Variables

Key environment variables in `/root/autolytiq/.env`:

```bash
# Database
DATABASE_URL=postgresql://autolytiq:autolytiq@localhost:5432/autolytiq?schema=public

# JWT Authentication
JWT_ISSUER=autolytiq.local
JWT_AUDIENCE=autolytiq.clients

# ML Service (for AI features)
ML_SERVICE_URL=http://ml:8000
ML_SERVICE_TOKEN=dev-ml-token

# Redis
REDIS_URL=redis://localhost:6379

# File Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=autolytiq-assets
```

## Development Workflow

### Watch Mode (Auto-rebuild)
```bash
# Backend
cd /root/autolytiq/apps/backend
npm run dev

# Frontend
cd /root/autolytiq/apps/frontend
npm run dev
```

### Run Tests
```bash
cd /root/autolytiq
npm test
```

### Prisma Studio (Database GUI)
```bash
cd /root/autolytiq/packages/db
npx prisma studio
```
Open http://localhost:5555

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use production database
3. Configure proper JWT keys
4. Enable HTTPS
5. Set up proper monitoring
6. Configure backups
7. Review security settings

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

## Next Steps

1. ✅ Seed permissions
2. ✅ Start services
3. ✅ Login to test
4. ✅ Create custom role presets
5. ✅ Assign permissions to users
6. ✅ Test AI desking features
7. ✅ Upload documents to deal jackets
8. ✅ Monitor with Grafana

## Support

- **Documentation**: See `/root/autolytiq/docs`
- **API Docs**: http://localhost:5000/api-docs (if enabled)
- **Logs**: `docker logs autolytiq-backend-1`
- **Database**: `docker exec -it autolytiq-postgres psql -U autolytiq -d autolytiq`

---

**Status**: ✅ Ready for Development & Testing
**Version**: 1.0.0 (Custom Permissions Release)
**Last Updated**: November 1, 2025
