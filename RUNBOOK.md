# AutolytiQ Platform Runbook

## Adding a New Service

1. **Scaffold code & Dockerfile**
   - Place application code under `apps/<service>` (Node), `ml_service/<name>` (Python), or `services/<domain>` (Rust).
   - Add a multi-stage Dockerfile mirroring the existing ones (install/build in builder stage, lean runtime stage with non-root user and health probes).
   - Example template:
     ```Dockerfile
     FROM node:20-alpine AS builder
     WORKDIR /workspace
     COPY apps/my-service/package*.json apps/my-service/
     WORKDIR /workspace/apps/my-service
     RUN npm ci
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runner
     WORKDIR /app
     COPY --from=builder /workspace/apps/my-service/dist ./dist
     USER node
     EXPOSE 5000
     CMD ["node", "dist/index.js"]
     ```
2. **Create Kubernetes manifests**
   - Copy one of the deployment/service pairs in `infrastructure/k8s/production`.
   - Update labels, container image (`registry.digitalocean.com/autolytiq/<service>:__TAG__`), ports, probes, and resources.
   - Reference shared secrets with `envFrom: [{ secretRef: { name: app-env } }]` and set any additional service-specific env values explicitly.
   - Add ingress rules if the service needs public exposure.
3. **Register in CI**
   - Extend `.github/workflows/deploy.yml` matrix with a new entry (`name`, `context`, `file`, optional `build-args`).
   - Update rollout loop in the deploy job to include the deployment name if it should be rolled automatically.

## Managing Secrets

1. **GitHub Secrets**
   - Store credentials in the repository secrets (Settings → Secrets and variables → Actions).
   - Required keys today: `REGISTRY`, `DO_TOKEN`, `CLUSTER`, `NS`, `DATABASE_URL`, `JWT_SECRET`. Add Twilio/SendGrid/OpenAI/etc. as they come online.
2. **Kubernetes Secret Sync**
   - CI runs `kubectl create secret generic app-env ... | kubectl apply -f -` to project secrets into the `prod` namespace.
   - To add a new value, append another `--from-literal=KEY='${{ secrets.KEY }}'` line to the workflow. The deployment will pick it up automatically via `envFrom`.
3. **Manual Updates**
   - To patch outside CI:
     ```bash
     kubectl -n prod create secret generic app-env \
       --from-literal=NEW_KEY=value \
       --dry-run=client -o yaml | kubectl apply -f -
     ```

## Database Migrations

- **Local**: run `pnpm db:migrate:dev` (or `pnpm prisma:migrate` equivalents) against your local database. Use `pnpm db:generate` after schema edits.
- **Production**: the GitHub workflow launches a disposable pod:
  ```bash
  kubectl -n prod run migrate \
    --image=registry.digitalocean.com/autolytiq/backend:${GIT_SHA} \
    --restart=Never \
    --overrides='{"spec":{"imagePullSecrets":[{"name":"do-regcred"}]}}' \
    --env-from=secret/app-env \
    --command -- npx prisma migrate deploy
  ```
  Watch the logs with `kubectl -n prod logs migrate -f` if you need to debug. The pod is cleaned up after completion.

## Toggling HTTP Smoke Tests

1. Temporarily disable HTTPS redirect:
   ```bash
   kubectl -n prod annotate ingress/autolytiq-ingress \
     nginx.ingress.kubernetes.io/ssl-redirect="false" --overwrite
   ```
2. Run smoke checks against the load balancer using the provided `curl` commands in the workflow (or reuse the script from the deploy job).
3. Re-enable TLS enforcement once verification passes:
   ```bash
   kubectl -n prod annotate ingress/autolytiq-ingress \
     nginx.ingress.kubernetes.io/ssl-redirect="true" --overwrite
   ```

## Release Process

1. Merge to `main`.
2. GitHub Actions workflow `Deploy to Production` triggers automatically.
3. Matrix build pushes images to `registry.digitalocean.com/autolytiq` tagged with the commit SHA.
4. CI applies Kubernetes manifests, refreshes secrets, runs Prisma migrations, and rolls each deployment (`backend`, `frontend`, `ml-service`, `rust-pricing`, Celery workers).
5. The workflow runs ingress smoke checks. Review the logs for any failed rollout and inspect with:
   ```bash
   kubectl -n prod get deploy,svc,ingress
   kubectl -n prod logs deploy/backend --tail=100
   kubectl -n prod get certificate,certificaterequest,challenge -A
   ```

Keep this runbook alongside `infrastructure/k8s/production` updates so that platform changes remain discoverable.
