# Deployment Checklist

## Pre-Deployment Checklist

### 1. GitHub Repository Setup
- [ ] Code pushed to GitHub repository
- [ ] GitHub Secrets configured:
  - [x] `JWT_SECRET` ✅ (you confirmed this)
  - [x] `DATABASE_URL` ✅ (you confirmed this)
  - [ ] `DIGITALOCEAN_ACCESS_TOKEN` (needed for CI/CD)

### 2. DigitalOcean Setup
- [x] Kubernetes cluster created: `do-nyc3-autolytiq-cluster` ✅
- [x] PostgreSQL database created ✅
- [ ] Container Registry created: `autolytiq`
- [ ] Database firewall allows K8s cluster connections
- [ ] Domain name purchased (or using DigitalOcean subdomain)

### 3. Local Development
- [x] Frontend builds successfully ✅
- [x] Backend has JWT auth working ✅
- [x] Login page functional ✅
- [x] Role-based dashboards working ✅
- [ ] Backend connected to PostgreSQL database
- [ ] Database migrations run
- [ ] Test data seeded

### 4. Docker Images
- [ ] Frontend Dockerfile tested locally
- [ ] Backend Dockerfile tested locally
- [ ] Images build without errors
- [ ] Images pushed to registry

### 5. Kubernetes Configuration
- [x] Deployment manifests created ✅
- [x] Service manifests created ✅
- [x] Ingress manifest created ✅
- [x] Secrets template created ✅
- [ ] cert-manager installed in cluster
- [ ] Ingress controller installed (nginx)

## Deployment Steps

### Step 1: Connect to Kubernetes Cluster
```bash
# Install doctl if not already installed
brew install doctl  # macOS
# OR
snap install doctl  # Linux

# Authenticate
doctl auth init

# Save kubeconfig
doctl kubernetes cluster kubeconfig save do-nyc3-autolytiq-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```
- [ ] Successfully connected to cluster
- [ ] Can see cluster nodes

### Step 2: Set Up Container Registry
```bash
# Create registry
doctl registry create autolytiq

# Login to registry
doctl registry login

# Get registry URL
doctl registry get
```
- [ ] Registry created
- [ ] Logged in to registry
- [ ] Registry URL noted: `registry.digitalocean.com/autolytiq`

### Step 3: Update Image References
Edit these files to use your registry URL:

**k8s/backend-deployment.yaml** (line 22):
```yaml
image: registry.digitalocean.com/autolytiq/autolytiq-backend:latest
```

**k8s/frontend-deployment.yaml** (line 22):
```yaml
image: registry.digitalocean.com/autolytiq/autolytiq-frontend:latest
```

- [ ] Updated backend-deployment.yaml
- [ ] Updated frontend-deployment.yaml

### Step 4: Update Domain Name
Edit **k8s/ingress.yaml** with your actual domain:
```yaml
spec:
  tls:
  - hosts:
    - app.autolytiq.com  # Your domain
  rules:
  - host: app.autolytiq.com  # Your domain
```

- [ ] Updated ingress.yaml with domain
- [ ] DNS A record ready to point to load balancer

### Step 5: Build and Push Images

**Option A: Manual Build**
```bash
export REGISTRY="registry.digitalocean.com/autolytiq"

# Build backend
docker build -f apps/backend/Dockerfile -t ${REGISTRY}/autolytiq-backend:latest .
docker push ${REGISTRY}/autolytiq-backend:latest

# Build frontend
docker build -f apps/frontend/Dockerfile -t ${REGISTRY}/autolytiq-frontend:latest .
docker push ${REGISTRY}/autolytiq-frontend:latest
```

**Option B: GitHub Actions (Automated)**
```bash
# Just push to main branch
git add .
git commit -m "feat: initial Kubernetes deployment"
git push origin main

# Workflow runs automatically
```

- [ ] Backend image built successfully
- [ ] Frontend image built successfully
- [ ] Images pushed to registry

### Step 6: Install Prerequisites in Cluster

**Install cert-manager (for HTTPS):**
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for it to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=120s
```

**Create Let's Encrypt issuer:**
```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
