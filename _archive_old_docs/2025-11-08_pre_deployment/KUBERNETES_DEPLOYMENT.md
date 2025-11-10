# Kubernetes Deployment Guide

## Prerequisites

1. **DigitalOcean Kubernetes Cluster**: `do-nyc3-autolytiq-cluster`
2. **PostgreSQL Database**: DigitalOcean Managed Database (configured)
3. **kubectl**: Installed and configured with cluster access
4. **doctl**: DigitalOcean CLI tool (for container registry)
5. **Docker**: For building images

## Step 1: Connect to Your Kubernetes Cluster

```bash
# Authenticate with DigitalOcean
doctl auth init

# Get cluster credentials
doctl kubernetes cluster kubeconfig save do-nyc3-autolytiq-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

## Step 2: Set Up Container Registry

You have two options:

### Option A: DigitalOcean Container Registry (Recommended)

```bash
# Create registry if not exists
doctl registry create autolytiq

# Login to registry
doctl registry login

# Note your registry URL
doctl registry get
# Example: registry.digitalocean.com/autolytiq
```

### Option B: Docker Hub

```bash
# Login to Docker Hub
docker login

# Use your Docker Hub username
# Example: yourusername/autolytiq-backend:latest
```

## Step 3: Build and Push Docker Images

### Update Image Tags

First, decide on your registry URL and update the deployment files:

**For DigitalOcean Registry:**
```bash
export REGISTRY="registry.digitalocean.com/autolytiq"
```

**For Docker Hub:**
```bash
export REGISTRY="yourusername"  # Replace with your Docker Hub username
```

### Build Frontend

```bash
cd /root/autolytiq

# Build frontend image
docker build -f apps/frontend/Dockerfile -t ${REGISTRY}/autolytiq-frontend:latest .

# Push to registry
docker push ${REGISTRY}/autolytiq-frontend:latest
```

### Build Backend

```bash
# Build backend image
docker build -f apps/backend/Dockerfile -t ${REGISTRY}/autolytiq-backend:latest .

# Push to registry
docker push ${REGISTRY}/autolytiq-backend:latest
```

## Step 4: Update Kubernetes Manifests

Update the image references in deployment files:

**k8s/backend-deployment.yaml** - Line 22:
```yaml
image: registry.digitalocean.com/autolytiq/autolytiq-backend:latest
# OR
image: yourusername/autolytiq-backend:latest
```

**k8s/frontend-deployment.yaml** - Line 22:
```yaml
image: registry.digitalocean.com/autolytiq/autolytiq-frontend:latest
# OR
image: yourusername/autolytiq-frontend:latest
```

## Step 5: Configure Domain Name

Update **k8s/ingress.yaml** with your actual domain:

```yaml
spec:
  tls:
  - hosts:
    - app.autolytiq.com  # Replace with your domain
    secretName: autolytiq-tls
  rules:
  - host: app.autolytiq.com  # Replace with your domain
```

## Step 6: Update Secrets (IMPORTANT!)

**BEFORE DEPLOYING**, update the JWT secret in `k8s/secrets.yaml`:

```yaml
stringData:
  jwt-secret: "YOUR-RANDOM-SECRET-HERE"  # Generate a secure random string!
  database-url: "postgresql://db-autolytiq:AVNS_r6HQxLXjLSfiUWhkh-y@private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com:25060/db-autolytiq?sslmode=require"
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Step 7: Install cert-manager (for HTTPS)

```bash
# Install cert-manager for Let's Encrypt SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=120s

# Create Let's Encrypt cluster issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com  # Replace with your email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
