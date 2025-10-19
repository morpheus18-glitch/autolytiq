# Secrets & Environment Reference

This document summarizes the environment variables enforced by the backend and ML services. All values must be injected via secure secret stores—**never** commit plaintext secrets to version control.

## Storage locations

| Environment | Location | Notes |
|-------------|----------|-------|
| Replit development | Replit → Tools → Secrets | `DEPLOY_MODE` must remain `replit` so Docker/K8s features stay disabled. |
| Self-hosted (Docker/K8s) | `.env.selfhost` loaded by orchestration or secret manager | Mount files as Docker secrets or use platform-specific secret stores. |
| CI pipelines | GitHub Actions secrets | Provide read-only secrets for automated checks and builds. |

For future hardened deployments, prefer SOPS/age, AWS Secrets Manager, or HashiCorp Vault instead of raw `.env` files. The repository ignores `.env*` files except for `*.example` templates.

## Core contract

The `backend/src/config/env.ts` and `ml_service/config/env.py` modules validate the following keys at boot:

| Variable | Purpose |
|----------|---------|
| `DEPLOY_MODE` | `replit` (default) keeps Docker/K8s features disabled, `self_hosted` enables them. |
| `NODE_ENV` | Controls logging and error handling (`development`, `test`, `production`). |
| `DATABASE_URL` | PostgreSQL connection string used by API and ML pipelines. |
| `REDIS_URL` | Redis instance for caching, Celery broker, and result backend. |
| `JWT_SECRET` | Symmetric signing secret for API-issued JWTs. |
| `SESSION_SECRET` | Express session encryption secret. |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_WEBHOOK_SIGNING_KEY` | Outbound and inbound SendGrid email configuration. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP relay for templated emails. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_PHONE_NUMBER` | Twilio messaging credentials. |
| `PEXELS_API_KEY` | Media enrichment for lead content. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_CLOUDFRONT_URL` | S3-compatible storage for documents and backups. |
| `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DB` | Optional ClickHouse analytics backend. |
| `ML_SERVICE_URL` | Internal routing target for ML proxying. |
| `SOCKET_IO_CORS_ORIGIN` | Allowed Socket.IO origins list (comma-separated). |
| `APP_URL`, `API_URL` | Public URLs used in notifications and links. |

Additional integration keys (`DOCUSIGN_*`, `EXPERIAN_*`, `TRANSUNION_*`, `EQUIFAX_*`, etc.) remain optional but should be supplied before enabling related modules.

## Rotation workflow

1. **Plan the rotation** – Identify downstream services (Celery workers, ML service, backend, cron jobs) that read the variable.
2. **Create new secret** – Generate the replacement in your provider dashboard.
3. **Stage update** – Write the secret into the relevant secret manager or `.env` file and restart the affected services.
4. **Verify** – Run smoke checks (`npm run audit:infra`, `curl /health`, `python ml_service/scripts/smoke_enqueue.py`).
5. **Deprecate old secret** – Remove or disable the previous secret once monitoring confirms healthy operation.

For secrets shared across environments (for example `JWT_SECRET`), rotate in lower environments first to validate behaviour, then promote to production with coordinated deploys.
