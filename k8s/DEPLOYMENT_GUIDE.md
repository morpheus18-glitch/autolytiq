# Kubernetes Deployment Guide

## Directory Structure

```
k8s/
├── frontend-deployment.yaml    # Frontend deployment
├── frontend-configmap.yaml     # Nginx config ⭐ NEW
├── backend-deployment.yaml     # Backend deployment  
├── ingress.yaml                # Ingress rules
├── secrets.yaml                # Secrets (encrypted)
└── DEPLOYMENT_GUIDE.md         # This file
```

## Why nginx.conf Belongs Here

### ❌ WRONG: In Application Code
```
apps/frontend/
├── nginx.conf          # ❌ Wrong location
├── Dockerfile          # ❌ References nginx.conf
└── src/
```

**Problems**:
1. Tightly couples app code with deployment
2. Can't change nginx config without rebuilding
3. Different configs per environment need different builds
4. Not following 12-factor app principles

### ✅ CORRECT: In Kubernetes ConfigMap
```
k8s/
├── frontend-configmap.yaml    # ✅ Nginx config here
└── frontend-deployment.yaml   # ✅ Mounts ConfigMap
```

**Benefits**:
1. ✅ Decouple app code from deployment config
2. ✅ Change config without rebuilding image
3. ✅ Different configs per environment (dev/staging/prod)
4. ✅ Version control deployment separately
5. ✅ Hot-reload config changes

## How It Works

### 1. ConfigMap Defines nginx.conf
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-nginx-config
data:
  nginx.conf: |
    server {
      listen 80;
      # ... nginx config ...
    }
```

### 2. Deployment Mounts ConfigMap
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: nginx-config
        configMap:
          name: frontend-nginx-config
```

### 3. Dockerfile Stays Generic
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
# No nginx.conf copy - provided by ConfigMap
EXPOSE 80
```

## Deployment Commands

### Apply ConfigMap First
```bash
kubectl apply -f k8s/frontend-configmap.yaml
```

### Deploy Frontend
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

### Update nginx.conf Without Rebuild
```bash
# Edit configmap
kubectl edit configmap frontend-nginx-config

# Or apply updated file
kubectl apply -f k8s/frontend-configmap.yaml

# Restart pods to pick up new config
kubectl rollout restart deployment/frontend
```

## Environment-Specific Configs

### Development (Minikube)
```yaml
# k8s/overlays/dev/frontend-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-nginx-config
data:
  nginx.conf: |
    server {
      listen 80;
      # Dev-specific settings
      access_log /dev/stdout;
      error_log /dev/stderr debug;
    }
```

### Production
```yaml
# k8s/overlays/prod/frontend-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-nginx-config
data:
  nginx.conf: |
    server {
      listen 80;
      # Prod-specific settings
      access_log off;
      error_log /var/log/nginx/error.log error;
    }
```

## Best Practices

### 1. Keep Dockerfiles Generic
```dockerfile
# ✅ GOOD - No environment-specific config
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80

# ❌ BAD - Environment-specific
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf  # Don't do this
COPY dist/ /usr/share/nginx/html/
```

### 2. Use Kustomize for Overlays
```
k8s/
├── base/
│   ├── frontend-deployment.yaml
│   ├── frontend-configmap.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── frontend-configmap.yaml
    │   └── kustomization.yaml
    └── prod/
        ├── frontend-configmap.yaml
        └── kustomization.yaml
```

### 3. Version Control Everything
```bash
# Commit k8s configs
git add k8s/
git commit -m "Add frontend nginx ConfigMap"

# Don't commit app-level nginx.conf
echo "apps/*/nginx.conf" >> .gitignore
```

## Migration Checklist

- [ ] Move `apps/frontend/nginx.conf` → `k8s/frontend-configmap.yaml`
- [ ] Update `apps/frontend/Dockerfile` (remove COPY nginx.conf)
- [ ] Update `k8s/frontend-deployment.yaml` (add ConfigMap mount)
- [ ] Test locally with minikube
- [ ] Apply to dev environment
- [ ] Verify health checks pass
- [ ] Apply to production

## Health Checks

Frontend should expose `/health` endpoint:

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

Used by Kubernetes:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 30
```

## Troubleshooting

### Check ConfigMap
```bash
kubectl get configmap frontend-nginx-config -o yaml
```

### View nginx Logs
```bash
kubectl logs deployment/frontend -f
```

### Test Config Syntax
```bash
kubectl exec deployment/frontend -- nginx -t
```

### Hot Reload nginx
```bash
kubectl exec deployment/frontend -- nginx -s reload
```

---

**Generated**: 2025-11-08
**Status**: ✅ Best Practices Guide
