# Deployment Troubleshooting Guide

This guide helps diagnose and fix common deployment issues for the Autolytiq platform.

## Quick Start

1. **Pre-deployment validation**: `bash scripts/validate-deployment.sh`
2. **Post-deployment health check**: `bash scripts/deployment-health-check.sh`
3. **View logs**: `docker compose logs -f [service-name]`

## Common Issues

### 1. Build Failures

#### TypeScript Compilation Errors
```bash
# Check for type errors
pnpm typecheck

# Rebuild with verbose output
pnpm build 2>&1 | tee build.log
```

**Common causes:**
- Outdated dependencies: `pnpm install`
- Missing Prisma client: `pnpm db:generate`
- Conflicting types: Check `node_modules/@types/*`

#### Frontend Build Failures
```bash
# Clear cache and rebuild
rm -rf apps/frontend/dist
pnpm --filter @repo/frontend build
```

**Common causes:**
- Missing tokens build: `pnpm --filter @repo/tokens build`
- Vite config issues: Check `apps/frontend/vite.config.ts`

### 2. Docker Build Failures

#### Backend Docker Build
```bash
# Build with detailed output
docker build -f infrastructure/docker/Dockerfile.backend -t autolytiq-backend:debug . --progress=plain

# Check for common issues
docker build -f infrastructure/docker/Dockerfile.backend . --target dependencies 2>&1 | grep -i error
```

**Common causes:**
- PNPM lock file issues: Ensure `pnpm-lock.yaml` is committed
- Missing dependencies: Check `package.json` matches lock file
- Prisma schema errors: Validate with `pnpm --filter @repo/db exec prisma validate`

#### Frontend Docker Build
```bash
# Build with detailed output
docker build -f infrastructure/docker/Dockerfile.frontend -t autolytiq-frontend:debug . --progress=plain
```

**Common causes:**
- Missing nginx config: Check `infrastructure/docker/nginx/nginx.conf` exists
- Build artifacts missing: Ensure build completes successfully

### 3. Runtime Errors

#### Backend Won't Start
```bash
# Check backend logs
docker compose logs backend

# Run locally for debugging
cd apps/backend
pnpm dev
```

**Common issues:**
- Database connection: Check `DATABASE_URL` in `.env`
- Missing environment variables: Compare with `.env.example`
- Port conflicts: Check if port 5000 is already in use
- Prisma client not generated: Run `pnpm db:generate`

**Health check failures:**
- Verify `/health`, `/ready`, `/live` endpoints work
- Check database connectivity with `/health/database`
- Review structured logs for trace IDs and errors

#### Frontend Won't Load
```bash
# Check frontend logs
docker compose logs frontend

# Verify nginx is running
docker exec autolytiq-frontend nginx -t
```

**Common issues:**
- Nginx config errors: Test with `nginx -t`
- Missing build artifacts: Check `/usr/share/nginx/html` in container
- Wrong port mapping: Ensure `docker-compose.yml` maps to port 8080 (nginx-unprivileged default)
- Healthcheck failures: Verify healthcheck uses port 8080 internally

### 4. Database Issues

#### Connection Failures
```bash
# Test database connectivity
docker compose exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('OK')).catch(e => console.error(e));
"
```

**Common causes:**
- Wrong `DATABASE_URL` format
- Database not running: `docker compose ps postgres`
- Network issues: Check docker network with `docker network ls`

#### Migration Failures
```bash
# Check migration status
pnpm --filter @repo/db exec prisma migrate status

# Apply pending migrations
pnpm db:migrate:deploy
```

### 5. Health Check Failures

#### Backend Health Checks
```bash
# Test each health endpoint
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/live
curl http://localhost:5000/health/database
```

**Expected responses:**
- `/health`: `{"status":"healthy",...}`
- `/ready`: `{"status":"ready",...}` (requires DB)
- `/live`: `{"status":"alive",...}` (always works)

#### Frontend Health Check
```bash
# Test frontend health
curl http://localhost:3000/health
# Should return: ok
```

### 6. Performance Issues

#### Slow Startup
```bash
# Check startup logs with timestamps
docker compose logs --timestamps backend | grep -E "Starting|started"

# Identify slow operations
docker compose logs backend | grep "durationMs"
```

**Common causes:**
- Database connection pool warming up
- Slow dependency initialization
- Large number of files being watched in dev mode

### 7. Debugging Tools

#### View Structured Logs
```bash
# Backend logs with trace IDs
docker compose logs backend | jq -r 'select(.traceId != null)'

# Filter by log level
docker compose logs backend | jq -r 'select(.level == "error")'

# Find errors for a specific trace
docker compose logs backend | jq -r 'select(.traceId == "YOUR-TRACE-ID")'
```

#### Container Inspection
```bash
# Check container resources
docker stats autolytiq-backend

# Inspect container
docker inspect autolytiq-backend

# Execute commands in container
docker compose exec backend sh
```

## Environment Variables Checklist

Required variables for production:

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection (for migrations)
- `REDIS_URL` - Redis connection string
- `ML_SERVICE_URL` - ML service endpoint
- `SESSION_SECRET` - Session encryption key
- `JWT_SECRET` - JWT signing key

### Frontend
- `VITE_API_URL` - Backend API URL

### ML Service
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Service port (default 8000)

## Monitoring

### Key Metrics to Watch
1. Response times (check `/health` endpoint latency)
2. Error rates (check logs for `level: "error"`)
3. Database connection pool usage
4. Memory usage (check `docker stats`)

### Log Aggregation
All logs are structured JSON and include:
- `traceId` - Request trace ID
- `timestamp` - ISO 8601 timestamp
- `level` - Log level (debug, info, warn, error)
- `message` - Log message
- `tenantId` - Tenant context (if applicable)
- `userId` - User context (if applicable)

## Getting Help

1. Run validation script: `bash scripts/validate-deployment.sh`
2. Check health endpoints
3. Review structured logs with trace IDs
4. Compare working vs failing deployments
5. Check recent code changes with `git log`

## Quick Fixes

### Reset Everything
```bash
# Stop all containers
docker compose down

# Remove volumes (WARNING: destroys data)
docker compose down -v

# Rebuild everything
pnpm install
pnpm build
docker compose up --build
```

### Reset Database
```bash
# Reset database (WARNING: destroys data)
docker compose down postgres
docker volume rm autolytiq_postgres_data
docker compose up -d postgres
pnpm db:migrate:deploy
```

### Clear Build Cache
```bash
# Clear Node build cache
rm -rf apps/**/dist packages/**/dist node_modules/.cache

# Clear Docker build cache
docker builder prune -af
```

## Security Notes

- Never commit `.env` files
- Rotate secrets regularly
- Use strong passwords for production databases
- Enable SSL/TLS for production deployments
- Review CodeQL scan results: `pnpm scan:secrets`
- Keep dependencies updated

## Support

For additional help:
1. Check GitHub Issues
2. Review recent commits for breaking changes
3. Consult team documentation in `docs/`
