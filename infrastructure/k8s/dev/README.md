# AutolytiQ Kubernetes Dev Sandbox

This overlay provisions a minimal AutolytiQ stack (frontend, backend, and PostgreSQL) inside a
local Kubernetes cluster. It is designed to work with [`skaffold dev`](https://skaffold.dev)
so that engineers can iterate against pods running inside the cluster without
hand-maintaining deployments.

## Prerequisites

- Kubernetes cluster (kind, k3d, minikube, etc.)
- Docker engine with BuildKit enabled
- Skaffold v2.13+ (`brew install skaffold`)

## Quick start

```bash
# 1. Configure your kube-context (for kind this is automatic)
kubectl config current-context

# 2. Run the dev loop (builds images, deploys manifests, and port-forwards)
skaffold dev
```

When Skaffold is running it will:

- Build the backend and frontend images with Docker using the updated multi-stage Dockerfiles
- Deploy supporting resources defined in `infrastructure/k8s/dev`
- Port-forward services so you can access them locally:
  - Backend API → http://localhost:5000
  - Frontend UI → http://localhost:4173
  - PostgreSQL → localhost:5432 (useful for connecting with `psql`)

## Applying database migrations

Once the pods are running, apply Prisma migrations against the in-cluster PostgreSQL instance:

```bash
kubectl exec deploy/backend -n autolytiq-dev -- npx prisma migrate deploy --schema prisma/schema.prisma
```

You can re-run the command whenever the schema changes. The backend image already ships with the
Prisma schema and engines required to execute the migration.

## Customising secrets

The `backend-secrets.yaml` manifest contains **development-only placeholder values** for third-party
integrations. Before deploying to a shared cluster replace them with tenant-specific credentials or
use `kubectl create secret generic backend-secrets --from-literal=...` to override the manifest.

## Cleaning up

```bash
skaffold delete
```

This removes the namespace, workloads, and the PersistentVolumeClaim that backs PostgreSQL.
