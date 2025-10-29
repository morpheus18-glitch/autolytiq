# Secrets & Environment Management

All services share a single environment contract so that Docker Compose and Kubernetes use the same variable names. Every
variable listed below must be supplied (or intentionally omitted to disable a feature via flags) across deployments.

## Contract variables

| Category | Variables |
| --- | --- |
| Runtime | `NODE_ENV`, `DEPLOY_MODE` |
| Core infrastructure | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `SESSION_SECRET`, `CREDIT_ENCRYPTION_KEY` |
| Email | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_WEBHOOK_SIGNING_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Messaging | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` |
| Media & storage | `PEXELS_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` |
| Analytics | `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` |

Optional features are controlled by flags in `backend/src/config/flags.ts` and `ml_service/config/env.py`. When a flag is inactive
(for example, `CLICKHOUSE_HOST` is empty), the validators skip the corresponding fields.

## Kubernetes / DigitalOcean

- Store production secrets in `infrastructure/k8s/production/secrets.yaml`. Replace placeholder values before applying.
- Set non-sensitive configuration (hosts, ports) in `configmap.yaml`.
- For rotation use `kubectl create secret generic dms-secrets --from-env-file=... --dry-run=client -o yaml > secrets.yaml` to
  regenerate the manifest from an `.env` file.
- Keep manifests encrypted at rest (SOPS or 1Password Secrets Automation recommended).

## Docker Compose / Local parity

- Copy `.env.selfhost.example` into a secure location and fill in secrets.
- Launch the stack with `docker compose --env-file /path/to/.env up -d`.
- Never commit actual values—only example files and secret manifests with placeholders.

## Rotation runbook

1. **Plan** – Announce the rotation window and determine which keys are affected.
2. **Provision** – Generate a new credential in the provider console. Record the new value securely.
3. **Dual deploy** – Add the new key alongside the old one where supported (e.g., allow both SendGrid API keys temporarily).
4. **Update secrets** – Replace values in Kubernetes secrets or local `.env` files.
5. **Redeploy** – Restart services (`docker compose restart` for local, `kubectl rollout restart` for Kubernetes).
6. **Verify** – Hit `/health`, `/metrics`, and run `python ml_service/scripts/smoke_enqueue.py` to ensure the rotated credential works.
7. **Revoke old** – Delete the previous key/token from the provider.
8. **Document** – Update this file and provider-specific notes if new scopes or roles were introduced.

Keeping this workflow consistent prevents secrets from leaking into git history and ensures smooth transitions between staging and
production environments.
