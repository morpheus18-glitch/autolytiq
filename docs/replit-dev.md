# Replit Development Guide

This repository is configured for a multi-process development workflow that mirrors production service boundaries while keeping Replit-friendly defaults.

## Prerequisites

1. Install dependencies:
   ```sh
   npm install
   ```
2. Ensure the TypeScript build is up to date so the backend `dist/` folder exists:
   ```sh
   npm run build
   ```

## Required environment

All secrets must be injected through **Replit → Tools → Secrets**.

Set at minimum the following keys (values can be dummy for local-only testing):

- `DEPLOY_MODE=replit`
- `NODE_ENV=development`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_WEBHOOK_SIGNING_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID`
- `PEXELS_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`

Additional provider-specific keys (ClickHouse, SMTP, etc.) can be added as required by your workflow.

## Running the stack

Start all services with a single command:

```sh
npm run dev:replit
```

This boots the following processes in watch mode:

- `npm:dev:backend` – Express API listening on `PORT=5000`
- `npm:dev:frontend` – Vite frontend at `http://localhost:3000`
- `npm:dev:ml` – FastAPI ML service at `http://localhost:8000`
- `npm:dev:worker:hp` – High-priority Celery worker
- `npm:dev:worker:ml` – ML job Celery worker
- `npm:dev:beat` – Celery beat scheduler

If you only want to run a subset of the services, invoke the individual scripts (for example `npm run dev:backend`).

## Health checks

After the processes start, verify readiness:

```sh
curl http://localhost:5000/health
curl http://localhost:5000/metrics
curl http://localhost:8000/health
curl http://localhost:8000/metrics
```

You should see JSON `{"ok": true}` for health endpoints and Prometheus-formatted text for metrics.

## Shut down

Use `Ctrl+C` inside the Replit shell to terminate all processes. Celery workers trap signals and shut down gracefully.
