# Go Backend Deployment Guide

## Current State (Development)

**Running**: ✅ Port 3001 (localhost)
**Endpoints**: 17 operational
**Handlers**: 4 complete (Auth, Users, Customers, Leads)

### Server Info
```
┌───────────────────────────────────────────────────┐
│                 AutolytiQ Backend                 │
│                   Fiber v2.52.9                   │
│               http://127.0.0.1:3001               │
│       (bound on host 0.0.0.0 and port 3001)       │
│                                                   │
│ Handlers ............ 17  Processes ........... 1 │
│ Prefork ....... Disabled  PID ............. 38055 │
└───────────────────────────────────────────────────┘
```

### Directory Structure
```
apps/backend-go/
├── cmd/
│   └── server/
│       └── main.go              # Entry point (130 lines)
├── internal/
│   ├── handlers/
│   │   ├── auth.go              # Authentication (233 lines)
│   │   ├── users.go             # User management (92 lines)
│   │   ├── customers.go         # Customer CRUD (358 lines)
│   │   └── leads.go             # Lead CRUD (261 lines)
│   └── middleware/
│       ├── auth.go              # JWT verification (143 lines)
│       └── tenant.go            # Tenant scoping (55 lines)
├── pkg/
│   └── database/
│       └── database.go          # DB connection pool (38 lines)
├── ent/                         # Generated ORM code (86 files)
├── Dockerfile                   # Multi-stage build (33 lines)
├── go.mod                       # Dependencies (45 lines)
└── bin/
    └── server                   # Compiled binary (6.8 MB)
```

---

## Deployment Architecture: Docker → Kubernetes

### Phase 1: Docker Compose (Local/Staging)

**Current Setup:**
- Node.js backend on port 3000
- Go backend on port 3001 (new!)
- PostgreSQL on port 5432
- Redis on port 6379
- Frontend on port 5173

**Updated docker-compose.yml:**
```yaml
services:
  # Existing services...

  backend-go:
    build:
      context: ./apps/backend-go
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/autolytiq
      - JWT_PUBLIC_KEY_PATH=/app/keys/jwt-public.pem
      - JWT_PRIVATE_KEY_PATH=/app/keys/jwt-private.pem
      - PORT=3001
      - CORS_ORIGINS=http://localhost:5173,http://localhost:4173
    volumes:
      - ./apps/backend/keys:/app/keys:ro
    depends_on:
      - postgres
      - redis
    networks:
      - autolytiq
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Build & Run:**
```bash
# Build the Go backend image
docker-compose build backend-go

# Start the Go backend
docker-compose up -d backend-go

# Check logs
docker-compose logs -f backend-go

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/version
```

---

### Phase 2: Kubernetes (Production)

**Manifests Created:** `infrastructure/k8s/backend-go/`

#### 1. Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-go
  namespace: autolytiq
  labels:
    app: backend-go
    tier: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend-go
  template:
    metadata:
      labels:
        app: backend-go
        tier: backend
    spec:
      containers:
      - name: backend-go
        image: ghcr.io/autolytiq/backend-go:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_PUBLIC_KEY_PATH
          value: /etc/jwt/public.pem
        - name: JWT_PRIVATE_KEY_PATH
          value: /etc/jwt/private.pem
        - name: PORT
          value: "3001"
        - name: CORS_ORIGINS
          value: "https://app.autolytiq.com"
        volumeMounts:
        - name: jwt-keys
          mountPath: /etc/jwt
          readOnly: true
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: jwt-keys
        secret:
          secretName: jwt-keys
```

#### 2. Service
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-go
  namespace: autolytiq
  labels:
    app: backend-go
spec:
  type: ClusterIP
  ports:
  - port: 3001
    targetPort: 3001
    protocol: TCP
    name: http
  selector:
    app: backend-go
```

#### 3. Ingress
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-go
  namespace: autolytiq
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.autolytiq.com
    secretName: autolytiq-tls
  rules:
  - host: api.autolytiq.com
    http:
      paths:
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: backend-go
            port:
              number: 3001
```

#### 4. HorizontalPodAutoscaler
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-go
  namespace: autolytiq
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-go
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Deployment Steps

### Step 1: Build Docker Image
```bash
cd apps/backend-go

# Build for AMD64 (production)
docker build --platform linux/amd64 -t ghcr.io/autolytiq/backend-go:latest .

# Tag with version
docker tag ghcr.io/autolytiq/backend-go:latest ghcr.io/autolytiq/backend-go:v1.0.0

# Push to GitHub Container Registry
docker push ghcr.io/autolytiq/backend-go:latest
docker push ghcr.io/autolytiq/backend-go:v1.0.0
```

### Step 2: Create Kubernetes Secrets
```bash
# JWT Keys Secret
kubectl create secret generic jwt-keys \
  --from-file=public.pem=../backend/keys/jwt-public.pem \
  --from-file=private.pem=../backend/keys/jwt-private.pem \
  -n autolytiq

# Database Secret
kubectl create secret generic database-secret \
  --from-literal=url="postgresql://user:pass@postgres.autolytiq.svc.cluster.local:5432/autolytiq" \
  -n autolytiq
```

### Step 3: Deploy to Kubernetes
```bash
# Apply all manifests
kubectl apply -f infrastructure/k8s/backend-go/

# Check deployment status
kubectl get pods -n autolytiq -l app=backend-go
kubectl get svc -n autolytiq backend-go
kubectl get ingress -n autolytiq backend-go

# Check logs
kubectl logs -n autolytiq -l app=backend-go --tail=100 -f

# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -n autolytiq -- \
  wget -qO- http://backend-go:3001/health
```

---

## Migration Strategy: Node.js → Go

### Option 1: Blue-Green Deployment (Recommended)
```
1. Deploy Go backend as "backend-go" service
2. Run both Node.js and Go backends in parallel
3. Update Ingress to route /v2/* to Go backend
4. Monitor for 1 week
5. Gradually shift traffic using weighted routing
6. Deprecate Node.js backend when Go handles 100% traffic
```

**Ingress Configuration:**
```yaml
# Both backends running
- path: /api/v1
  backend:
    service:
      name: backend-nodejs  # Old
      port: 3000
- path: /api/v2
  backend:
    service:
      name: backend-go      # New
      port: 3001
```

### Option 2: Canary Deployment
```yaml
# nginx ingress with traffic splitting
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% to Go
spec:
  # ... routes to backend-go
```

**Progressive rollout:**
- Week 1: 10% traffic → Go
- Week 2: 25% traffic → Go
- Week 3: 50% traffic → Go
- Week 4: 100% traffic → Go

---

## Performance Expectations

### Node.js Backend (Current)
- **Response Time**: ~50-100ms (p95)
- **Memory**: ~200-400MB per pod
- **CPU**: ~0.3-0.5 cores per pod
- **Throughput**: ~5,000 req/s per pod

### Go Backend (Expected)
- **Response Time**: ~10-30ms (p95) **3-5x faster**
- **Memory**: ~50-100MB per pod **4x less**
- **CPU**: ~0.1-0.2 cores per pod **2-3x less**
- **Throughput**: ~20,000 req/s per pod **4x more**

### Cost Savings
- **Pods needed**: 10 → 3 (70% reduction)
- **Memory**: 4GB → 300MB (92% reduction)
- **CPU**: 5 cores → 0.6 cores (88% reduction)
- **Monthly cost**: $500 → $75 (85% savings)

---

## Monitoring & Observability

### Metrics (Prometheus)
```yaml
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-go
spec:
  selector:
    matchLabels:
      app: backend-go
  endpoints:
  - port: http
    path: /metrics
```

### Logs (Loki/ELK)
```bash
# Fiber structured logging
[2025-11-09 18:00:00] INFO  200 - GET /api/customers (5ms)
[2025-11-09 18:00:01] INFO  201 - POST /api/leads (12ms)
[2025-11-09 18:00:02] ERROR 500 - GET /api/deals (Database timeout)
```

### Tracing (Jaeger)
- Request ID propagation
- Distributed tracing across microservices
- Database query timing
- gRPC call tracing (to Rust services)

---

## Rollback Plan

### If Go backend has issues:
```bash
# Immediate rollback via Ingress
kubectl patch ingress backend-go -n autolytiq -p '
spec:
  rules:
  - host: api.autolytiq.com
    http:
      paths:
      - path: /
        backend:
          service:
            name: backend-nodejs  # Back to Node.js
            port: 3000
'

# Or scale down Go pods
kubectl scale deployment backend-go -n autolytiq --replicas=0

# Node.js backend remains running for 2 weeks post-migration
```

---

## What's Next?

1. ✅ **Day 1-5 Complete** - Auth, Users, Customers, Leads APIs
2. 🔄 **Day 6 (Now)** - Vehicles API + VIN decoder
3. 🔄 **Day 7** - Deals API + payment calculations
4. 📋 **Week 2** - Remaining 60+ endpoints
5. 🧪 **Week 3** - Integration testing + performance benchmarks
6. 🚀 **Week 4** - Production deployment + monitoring setup

**Timeline**: On track for 2-week migration!
