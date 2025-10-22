# Secrets & Environment Management

All services share a single environment contract so that Replit, Docker Compose, and Kubernetes use the same variable names. Every variable listed below must be supplied (or intentionally omitted to disable a feature via flags) across deployments.

## Contract variables

| Category | Variables |
| --- | --- |
| Runtime | `NODE_ENV`, `DEPLOY_MODE` |
| Core infrastructure | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` |
| Email | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_WEBHOOK_SIGNING_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Messaging | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` |
| Media & storage | `PEXELS_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` |
| Analytics | `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` |

Optional features are controlled by flags in `backend/src/config/flags.ts` and `ml_service/config/env.py`. When a flag is inactive (for example, `CLICKHOUSE_HOST` is empty), the validators skip the corresponding fields.

## Replit storage

Replit secrets are managed through **Tools → Secrets**. Only add key names from the contract—values stay in the hosted Replit vault and are injected into the runtime on boot. Keep `.env` files out of version control; `.gitignore` already blocks `.env` and `.env.*` (except `*.example`).

For shared development environments:

1. Create an `.env.replit.example` file (already provided) listing the keys.
2. Update `docs/replit-dev.md` when new secrets are required.
3. Use the Replit UI to add or rotate secrets. Replit propagates updates immediately to running shells.

## Self-hosted storage

For Docker Compose or Kubernetes:

- Copy `.env.selfhost.example` into a secure location (1Password vault, AWS Secrets Manager, etc.).
- Populate secrets and load them into Compose (`docker compose --env-file ...`) or Kubernetes secrets (see `infrastructure/k8s/production/secrets.yaml`).
- Never commit actual values—only example files and secret manifests with placeholders.

When promoting to production, use a dedicated secrets manager (AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault) and inject environment variables at deploy time. The `DEPLOY_MODE=self_hosted` flag will enable Docker/Kubernetes specific features automatically.

## Rotation runbook

1. **Plan** – Announce the rotation window and determine which keys are affected.
2. **Provision** – Generate a new credential in the provider console. Record the new value securely.
3. **Dual deploy** – Add the new key alongside the old one where supported (e.g., allow both SendGrid API keys temporarily).
4. **Update secrets** – Replace values in Replit Secrets, `.env` files used for Compose, or Kubernetes secret manifests.
5. **Redeploy** – Restart services (`npm run dev:replit` for Replit, `make rebuild` for Docker, or `kubectl rollout restart` for Kubernetes).
6. **Verify** – Hit `/health`, `/metrics`, and run `python ml_service/scripts/smoke_enqueue.py` to ensure the rotated credential works.
7. **Revoke old** – Delete the previous key/token from the provider.
8. **Document** – Update this file and provider-specific notes if new scopes or roles were introduced.

Keeping this workflow consistent prevents secrets from leaking into git history and ensures smooth transitions between Replit and self-hosted deployments.

