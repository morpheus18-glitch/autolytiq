# Quick Start - Deploy to Kubernetes

## Prerequisites
- DigitalOcean account with K8s cluster `do-nyc3-autolytiq-cluster`
- `kubectl` and `doctl` CLI tools installed
- GitHub repository with secrets configured

## 5-Minute Deploy (GitHub Actions)

1. **Create Container Registry**:
   ```bash
   doctl auth init
   doctl registry create autolytiq
   ```

2. **Add GitHub Secret**:
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add `DIGITALOCEAN_ACCESS_TOKEN` (get from DigitalOcean dashboard)

3. **Update Domain**:
   - Edit `k8s/ingress.yaml`
   - Replace `autolytiq.yourdomain.com` with your domain

4. **Deploy**:
   ```bash
   git add .
   git commit -m "deploy: initial k8s deployment"
   git push origin main
   ```

5. **Wait** (~5 minutes):
   - Watch: GitHub → Actions tab
   - Workflow builds images and deploys

6. **Get Load Balancer IP**:
   ```bash
   doctl kubernetes cluster kubeconfig save do-nyc3-autolytiq-cluster
   kubectl get ingress
   ```

7. **Configure DNS**:
   - Create A record: `app` → `<LOAD_BALANCER_IP>`

8. **Access App**:
   - HTTP (immediate): `http://<LOAD_BALANCER_IP>`
   - HTTPS (after DNS): `https://app.yourdomain.com`

## Login Credentials

- **Store**: `store-001`
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

## Verify Deployment

```bash
# Check pods
kubectl get pods

# Check logs
kubectl logs -l app=autolytiq,component=backend --tail=50

# Test API
curl http://<LOAD_BALANCER_IP>/health
```

## Manual Deploy (If No GitHub Actions)

```bash
# 1. Connect to cluster
doctl kubernetes cluster kubeconfig save do-nyc3-autolytiq-cluster

# 2. Create registry
doctl registry create autolytiq
doctl registry login

# 3. Build images
export REGISTRY="registry.digitalocean.com/autolytiq"
docker build -f apps/backend/Dockerfile -t ${REGISTRY}/autolytiq-backend:latest .
docker build -f apps/frontend/Dockerfile -t ${REGISTRY}/autolytiq-frontend:latest .

# 4. Push images
docker push ${REGISTRY}/autolytiq-backend:latest
docker push ${REGISTRY}/autolytiq-frontend:latest

# 5. Update k8s/backend-deployment.yaml and k8s/frontend-deployment.yaml
# Change image: autolytiq-backend:latest
# To: image: registry.digitalocean.com/autolytiq/autolytiq-backend:latest

# 6. Create secrets
kubectl create secret generic autolytiq-secrets \
  --from-literal=jwt-secret='YOUR_JWT_SECRET' \
  --from-literal=database-url='YOUR_DATABASE_URL'

# 7. Deploy
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 8. Wait for pods
kubectl get pods -w
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### ImagePullBackOff
```bash
# Configure registry access
doctl registry kubernetes-manifest | kubectl apply -f -
```

### No Ingress IP
```bash
# Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/do/deploy.yaml
```

### HTTPS not working
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create issuer (update email)
cat <<EOL | kubectl apply -f -
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
EOL
```

## Full Documentation

- **Complete Guide**: `KUBERNETES_DEPLOYMENT.md`
- **Step-by-Step**: `DEPLOYMENT_CHECKLIST.md`
- **Secrets**: `GITHUB_SECRETS_SETUP.md`
- **Ready Status**: `DEPLOYMENT_READY.md`

## Need Help?

1. Check logs: `kubectl logs <pod-name>`
2. Describe pod: `kubectl describe pod <pod-name>`
3. Check GitHub Actions logs (Actions tab)
4. Review documentation files above
