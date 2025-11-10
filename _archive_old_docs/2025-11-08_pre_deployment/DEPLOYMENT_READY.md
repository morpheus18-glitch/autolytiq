# 🚀 Autolytiq - Kubernetes Deployment Ready

## What We've Built

A complete production-ready Kubernetes deployment for your Autolytiq platform with:

✅ **Minimal Auth Flow**
- Login page with store ID + username + password
- JWT token authentication (24-hour expiration)
- Role-based dashboards (Sales, Manager, Admin)
- Protected routes with auto-redirect

✅ **Backend API**
- Express.js with TypeScript
- JWT token generation and verification
- Bcrypt password hashing
- Health check endpoint
- CORS configured for production

✅ **Frontend SPA**
- React 18 with React Router 6
- Tailwind CSS with design tokens
- Role-based dashboard pages
- Auth context management
- Clean TypeScript codebase

✅ **Docker Containers**
- Multi-stage builds for optimization
- Frontend: nginx serving static files
- Backend: Node.js with production dependencies
- Health checks configured
- Resource limits set

✅ **Kubernetes Manifests**
- Backend deployment (2 replicas)
- Frontend deployment (2 replicas)
- ClusterIP services
- Ingress with TLS/HTTPS
- Secrets management
- Health probes (liveness + readiness)

✅ **CI/CD Pipeline**
- GitHub Actions workflow
- Automatic deployment on push to main
- Docker image building and pushing
- Database migrations
- Deployment verification

✅ **Security**
- Secrets in GitHub Secrets (not Git)
- JWT authentication
- HTTPS with Let's Encrypt
- Database SSL connection
- Security headers in nginx

## File Structure

```
/root/autolytiq/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts          # Express server
│   │   │   ├── routes/
│   │   │   │   └── auth.ts       # Login, verify, logout
│   │   │   └── middleware/
│   │   │       └── auth.ts       # JWT verification, RBAC
│   │   ├── Dockerfile            # Backend container
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx            # Routes & auth
│       │   ├── main.tsx           # Entry point
│       │   ├── pages/
│       │   │   ├── Login.tsx      # Login form
│       │   │   └── dashboard/     # Role dashboards
│       │   └── contexts/
│       │       └── AuthContext.tsx # Auth state
│       ├── Dockerfile             # Frontend container
│       ├── nginx.conf             # Production server
│       └── package.json
│
├── k8s/
│   ├── backend-deployment.yaml    # Backend + service
│   ├── frontend-deployment.yaml   # Frontend + service
│   ├── ingress.yaml               # Routing + TLS
│   └── secrets.yaml               # Template (no real values)
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD pipeline
│
├── .gitignore                     # Excludes .env, secrets
│
└── Documentation/
    ├── KUBERNETES_DEPLOYMENT.md   # Complete deployment guide
    ├── GITHUB_SECRETS_SETUP.md    # Secrets configuration
    ├── DEPLOYMENT_CHECKLIST.md    # Step-by-step checklist
    └── DEPLOYMENT_READY.md        # This file
```

## What's Configured

### Environment Variables

**Backend** (from secrets):
- `JWT_SECRET` - From GitHub Secrets ✅
- `DATABASE_URL` - From GitHub Secrets ✅
- `PORT` - 3000
- `NODE_ENV` - production

**Frontend** (build-time):
- API calls go to `/api` (proxied by ingress)

### GitHub Secrets

You've already configured:
- ✅ `JWT_SECRET`
- ✅ `DATABASE_URL`

Still needed:
- `DIGITALOCEAN_ACCESS_TOKEN` (for CI/CD automation)

### DigitalOcean Resources

Existing:
- ✅ K8s Cluster: `do-nyc3-autolytiq-cluster`
- ✅ PostgreSQL Database (managed)

Needed:
- Container Registry: `autolytiq`
- Domain DNS configured (or use DigitalOcean subdomain)

## Quick Start Deployment

### Option 1: Automated (GitHub Actions)

1. **Set DIGITALOCEAN_ACCESS_TOKEN secret in GitHub**
2. **Update k8s/ingress.yaml with your domain**
3. **Create container registry**:
   ```bash
   doctl registry create autolytiq
   ```
4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: initial deployment"
   git push origin main
   ```
5. **Watch deployment**: GitHub Actions → Your repo → Actions tab

### Option 2: Manual Deployment

1. **Connect to cluster**:
   ```bash
   doctl kubernetes cluster kubeconfig save do-nyc3-autolytiq-cluster
   ```

2. **Create registry and login**:
   ```bash
   doctl registry create autolytiq
   doctl registry login
   ```

3. **Build and push images**:
   ```bash
   export REGISTRY="registry.digitalocean.com/autolytiq"
   
   docker build -f apps/backend/Dockerfile -t ${REGISTRY}/autolytiq-backend:latest .
   docker push ${REGISTRY}/autolytiq-backend:latest
   
   docker build -f apps/frontend/Dockerfile -t ${REGISTRY}/autolytiq-frontend:latest .
   docker push ${REGISTRY}/autolytiq-frontend:latest
   ```

4. **Update k8s manifests** (set image URLs)

5. **Create secrets**:
   ```bash
   kubectl create secret generic autolytiq-secrets \
     --from-literal=jwt-secret='YOUR_JWT_SECRET' \
     --from-literal=database-url='YOUR_DATABASE_URL'
   ```

6. **Deploy**:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

7. **Get load balancer IP**:
   ```bash
   kubectl get ingress
   ```

8. **Configure DNS A record** to point to load balancer IP

9. **Wait for HTTPS certificate** (5-10 minutes)

10. **Access app** at https://your-domain.com

## Testing Locally First (Recommended)

Before deploying to K8s, test Docker images locally:

### Test Backend Image
```bash
# Build
docker build -f apps/backend/Dockerfile -t autolytiq-backend:test .

# Run
docker run -p 3000:3000 \
  -e JWT_SECRET=test-secret \
  -e DATABASE_URL=your-db-url \
  autolytiq-backend:test

# Test
curl http://localhost:3000/health
```

### Test Frontend Image
```bash
# Build
docker build -f apps/frontend/Dockerfile -t autolytiq-frontend:test .

# Run
docker run -p 8080:80 autolytiq-frontend:test

# Test
curl http://localhost:8080
# Open http://localhost:8080 in browser
```

## After Deployment

### Access Your App
- **HTTP** (immediate): http://<LOAD_BALANCER_IP>
- **HTTPS** (after DNS + cert): https://your-domain.com

### Default Login Credentials
The backend currently has mock users. You'll need to either:
1. Use mock credentials from `apps/backend/src/routes/auth.ts`
2. Connect to real database and seed users
3. Create user registration endpoint

Example mock users:
- Store: `store-001`, Username: `admin`, Password: `admin123` (Admin role)
- Store: `store-001`, Username: `john.doe`, Password: `password123` (Sales Manager)
- Store: `store-001`, Username: `jane.smith`, Password: `password123` (Salesperson)

### Monitor Deployment
```bash
# Watch pods
kubectl get pods -w

# View logs
kubectl logs -f -l app=autolytiq,component=backend
kubectl logs -f -l app=autolytiq,component=frontend

# Check status
kubectl get all
kubectl get ingress
```

### Run Database Migrations
```bash
BACKEND_POD=$(kubectl get pod -l app=autolytiq,component=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $BACKEND_POD -- npx prisma migrate deploy
```

## Documentation

- **Complete Guide**: `KUBERNETES_DEPLOYMENT.md`
- **Secrets Setup**: `GITHUB_SECRETS_SETUP.md`
- **Step-by-Step**: `DEPLOYMENT_CHECKLIST.md`
- **JWT Auth Details**: `README_JWT_AUTH.md`
- **External Access**: `ACCESS_YOUR_APP.md`

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Code | ✅ Ready | Clean TypeScript, builds successfully |
| Docker Images | ✅ Ready | Dockerfiles created and tested |
| K8s Manifests | ✅ Ready | Deployments, services, ingress |
| Secrets | ✅ Configured | In GitHub Secrets |
| CI/CD | ✅ Ready | GitHub Actions workflow |
| Database | ⚠️ Pending | Need to run migrations |
| Domain | ⚠️ Pending | Need to configure DNS |
| Registry | ⚠️ Pending | Need to create in DigitalOcean |

## Next Actions

1. **Create DigitalOcean Container Registry**:
   ```bash
   doctl registry create autolytiq
   ```

2. **Update ingress.yaml with your domain**

3. **Choose deployment method**:
   - GitHub Actions (automated)
   - Manual deployment

4. **Deploy to Kubernetes**

5. **Configure DNS**

6. **Test application**

7. **Run database migrations**

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Traffic                      │
│                    (your-domain.com)                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              DigitalOcean Load Balancer                  │
│                   (HTTPS/TLS)                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Kubernetes Ingress                       │
│          (cert-manager + nginx-ingress)                  │
│                                                          │
│  Rules:                                                  │
│  ├─ /api/* → Backend Service                            │
│  └─ /*     → Frontend Service                           │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Backend Service     │    │  Frontend Service    │
│  (ClusterIP)         │    │  (ClusterIP)         │
│  Port: 3000          │    │  Port: 80            │
└──────┬───────────────┘    └──────┬───────────────┘
       │                            │
       ▼                            ▼
┌─────────────────┐          ┌─────────────────┐
│ Backend Pods    │          │ Frontend Pods   │
│ (2 replicas)    │          │ (2 replicas)    │
│                 │          │                 │
│ Express.js      │          │ nginx           │
│ JWT Auth        │          │ React SPA       │
│ Prisma ORM      │          │                 │
└────┬────────────┘          └─────────────────┘
     │
     │ DATABASE_URL
     │ (SSL connection)
     ▼
┌─────────────────────────────────────────────────────────┐
│         DigitalOcean Managed PostgreSQL                  │
│              (private network)                           │
└─────────────────────────────────────────────────────────┘
```

## Support

If you encounter issues:

1. **Check Documentation**: Read the detailed guides
2. **View Logs**: `kubectl logs <pod-name>`
3. **Describe Resources**: `kubectl describe pod <pod-name>`
4. **Check GitHub Actions**: Actions tab in repository
5. **DigitalOcean Console**: Check cluster health

## Security Notes

- ✅ Secrets stored in GitHub Secrets (not Git)
- ✅ .gitignore excludes .env files
- ✅ JWT tokens with 24-hour expiration
- ✅ Bcrypt password hashing
- ✅ HTTPS with Let's Encrypt
- ✅ Database SSL connection required
- ✅ CORS configured for production domain
- ⚠️ TODO: Rotate JWT_SECRET every 90 days
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add security headers middleware

---

**Status**: Ready for deployment 🚀

**Last Updated**: 2025-11-08

**Next Step**: Choose deployment method and execute
