# Environment Variable Matrix

**Generated**: 2025-11-06  
**Purpose**: Map env vars to K8s secrets/configmaps

---

## Frontend (.env)

```env
VITE_API_BASE_URL=https://api.autolytiq.com
VITE_WS_URL=wss://api.autolytiq.com/ws
VITE_SENTRY_DSN=https://...
VITE_ENVIRONMENT=production
```

**K8s**: ConfigMap `frontend-config`

---

## Backend (.env)

```env
# Database
DATABASE_URL=postgresql://...          # Secret: database-secret
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://...                  # Secret: redis-secret

# JWT
JWT_SECRET=...                         # Secret: jwt-secret
JWT_ALGORITHM=RS256

# Services
PRICE_ENGINE_URL=price-engine:50051
COMM_SERVICE_URL=comm-service:50052

# Feature Flags
ENABLE_ML_SUGGESTIONS=true

# Monitoring
SENTRY_DSN=...                         # Secret: sentry-secret
```

**K8s**: Mix of secrets + configmap

---

## Rust Services (.env)

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
RUST_LOG=info
SERVICE_PORT=50051
```

---

## K8s Secret Structure

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: autolytiq-prod
type: Opaque
stringData:
  database-url: "postgresql://..."
  redis-url: "redis://..."
  jwt-secret: "..."
  sentry-dsn: "..."
```

---

## ConfigMap Structure

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: autolytiq-prod
data:
  API_BASE_URL: "https://api.autolytiq.com"
  ENVIRONMENT: "production"
  ENABLE_ML_SUGGESTIONS: "true"
```

