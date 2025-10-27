# AutolytiQ - DigitalOcean Kubernetes Runbook

This runbook documents the operational steps for running AutolytiQ on DigitalOcean Kubernetes (DOKS), from registry
configuration to production readiness checks.

## 📋 Pre-flight Checklist

- [ ] DigitalOcean project with billing enabled
- [ ] DOKS cluster provisioned (Kubernetes 1.30+) and reachable via `kubectl`
- [ ] DigitalOcean Container Registry (DOCR) created (e.g. `registry.digitalocean.com/autolytiq`)
- [ ] DNS records prepared for frontend (`dms.autolytiq.com`) and API (`api.dms.autolytiq.com`)
- [ ] TLS issuer available (cert-manager + Let’s Encrypt)
- [ ] PostgreSQL, Redis, and object storage endpoints decided

---

## 🚀 Container Images

```bash
REGISTRY=registry.digitalocean.com/autolytiq
TAG=$(git rev-parse --short HEAD)

doctl registry login

docker build -f infrastructure/docker/Dockerfile.backend -t $REGISTRY/backend:$TAG .
docker build -f infrastructure/docker/Dockerfile.frontend -t $REGISTRY/frontend:$TAG .
docker build -f infrastructure/docker/Dockerfile.ml -t $REGISTRY/ml-service:$TAG .

docker push $REGISTRY/backend:$TAG
docker push $REGISTRY/frontend:$TAG
docker push $REGISTRY/ml-service:$TAG
```

Update the deployments under `infrastructure/k8s/production/` with the new tag before rollout.

---

## 🛠 Cluster Bootstrap

1. **Namespace + Config**
   ```bash
   kubectl apply -f infrastructure/k8s/production/namespace.yaml
   kubectl apply -f infrastructure/k8s/production/configmap.yaml
   kubectl apply -f infrastructure/k8s/production/secrets.yaml
   kubectl apply -f infrastructure/k8s/production/pvc.yaml
   ```

2. **Data Stores**
   - PostgreSQL: managed database or helm chart; update `DATABASE_URL` in secrets.
   - Redis: managed Redis or Bitnami chart; update `REDIS_URL`.
   - Object storage: S3-compatible bucket (Spaces, AWS S3, MinIO). Update `S3_*` variables.

3. **Core Services**
   ```bash
   kubectl apply -f infrastructure/k8s/production/backend-deployment.yaml
   kubectl apply -f infrastructure/k8s/production/frontend-deployment.yaml
   kubectl apply -f infrastructure/k8s/production/ml-service-deployment.yaml
   kubectl apply -f infrastructure/k8s/production/celery-worker-deployment.yaml
   kubectl apply -f infrastructure/k8s/production/hpa.yaml
   kubectl apply -f infrastructure/k8s/production/ingress.yaml
   ```

4. **Verification**
   ```bash
   kubectl -n dms-production get pods
   kubectl -n dms-production get svc
   kubectl -n dms-production get ingress
   ```
   Confirm the ingress controller provisions a public load balancer and certificates are issued.

---

## 🧪 Smoke Tests

- `curl https://api.dms.autolytiq.com/api/health/ready`
- `curl https://dms.autolytiq.com/healthz`
- Verify websockets via the dashboard (Socket.IO should connect without CORS errors)
- Create a tenant and ensure Prisma migrations ran (check `/api/health/readiness` logs)

---

## 📈 Observability & Scaling

- Enable DigitalOcean Managed Metrics + Logs for the cluster
- Connect application logs to Logtail/Datadog (fluent-bit DaemonSet recommended)
- Tune HPA thresholds in `infrastructure/k8s/production/hpa.yaml`
- Configure uptime checks (Pingdom, DO uptime, etc.)

---

## 🔒 Security Hardening

- Rotate secrets quarterly (update `secrets.yaml` and reapply)
- Enforce TLS 1.2+ via ingress annotations
- Restrict ingress IPs for the API if required (`nginx.ingress.kubernetes.io/whitelist-source-range`)
- Enable [DOKS maintenance windows](https://docs.digitalocean.com/products/kubernetes/) for predictable upgrades
- Schedule database backups (managed cluster automatic backups or custom cron jobs)

---

## 🆘 Incident Response

1. Check pod status: `kubectl -n dms-production get pods`
2. Inspect failing pod: `kubectl -n dms-production describe pod <name>`
3. Stream logs: `kubectl -n dms-production logs -f deployment/backend`
4. Roll back: `kubectl -n dms-production rollout undo deployment/backend`
5. Restore from backups for data incidents (PostgreSQL/Redis snapshots)

Escalate to platform engineering if ingress, networking, or cluster-level incidents persist.

---

## ✅ Cutover Checklist

- [ ] Latest container tag deployed to all workloads
- [ ] Health endpoints returning `200`
- [ ] DNS updated and propagated (frontend + API)
- [ ] TLS certificates valid
- [ ] Background jobs processing (Celery workers consuming queues)
- [ ] Monitoring dashboards populated
- [ ] Pager/on-call rotation notified of deployment

For deep architectural context review [`ARCHITECTURE.md`](./ARCHITECTURE.md) and operational guardrails in
[`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md).
