# Replit Development Workflow

This project is optimized for the Replit workspace runtime. The default `DEPLOY_MODE` is `replit`, which disables Docker/Kubernetes orchestration and uses in-process services instead. Follow the steps below to get a full multi-process stack running locally inside Replit.

## 1. Install dependencies

Open the Replit shell and install dependencies for both Node.js and Python runtimes.

```bash
npm install
pip install -r ml_service/requirements.txt -r ml_service/requirements-worker.txt
```

The Python dependencies install the FastAPI service, Celery workers, and analytics tooling. Keep the `pip` environment isolated inside Replit; do not commit virtualenv folders.

## 2. Configure secrets

Replit secrets must match the shared environment contract used across every deployment target. In the Replit workspace, open **Tools → Secrets** and add the variables below.

| Category | Variable |
| --- | --- |
| Core | `NODE_ENV`, `DEPLOY_MODE`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` |
| Email | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_WEBHOOK_SIGNING_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Messaging | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` |
| Media | `PEXELS_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` |
| Analytics (optional) | `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` |

Set `DEPLOY_MODE=replit` and `NODE_ENV=development`. The Redis and Postgres URLs should point to hosted services (Neon/Supabase for Postgres, Upstash for Redis) or to the managed Replit database equivalents if you have an existing project.

## 3. Generate the infrastructure report (optional but recommended)

Before starting the stack, you can inspect the repository topology and environment coverage:

```bash
npm run audit:infra
cat var/reports/infra-plan.md
```

The audit generates `var/reports/infra-audit.json` (machine-readable) and an ordered `infra-plan.md` that summarises remediation priorities.

## 4. Launch the Replit multi-process stack

The `npm run dev:replit` script starts six long-lived processes using `concurrently`:

- Backend API on port `5000` (`npm run dev:backend`)
- Vite frontend on port `3000` (`npm run dev:frontend`)
- FastAPI ML service on port `8000` (`npm run dev:ml`)
- Celery high-priority worker (`npm run dev:worker:hp`)
- Celery ML queue worker (`npm run dev:worker:ml`)
- Celery beat scheduler (`npm run dev:beat`)

Start the stack from the Replit shell:

```bash
npm run dev:replit
```

Replit automatically proxies the frontend on the webview. You can also open the backend and ML service health endpoints in new tabs if needed.

## 5. Smoke tests

Open a second Replit shell (or use the built-in multiplexer) and run the commands below once the stack is live.

```bash
curl -s http://127.0.0.1:5000/health
curl -s http://127.0.0.1:8000/health
curl -s http://127.0.0.1:5000/metrics | head
curl -s http://127.0.0.1:8000/metrics | head
```

To confirm Celery is wired to Redis, enqueue a smoke task:

```bash
python ml_service/scripts/smoke_enqueue.py
```

You should see a job ID and a JSON response in the console within a few seconds. If it times out, double-check the `REDIS_URL` secret and verify the workers are running in the first shell.

## 6. Common troubleshooting

| Symptom | Fix |
| --- | --- |
| `ECONNREFUSED` when fetching Postgres | Ensure `DATABASE_URL` uses an externally accessible host with SSL if required (Neon/Supabase). |
| Celery workers fail to connect to Redis | Verify `REDIS_URL` includes credentials (for Upstash: `rediss://:<token>@<host>:<port>`). |
| ClickHouse integration fails | Leave `CLICKHOUSE_HOST` unset to disable ClickHouse-dependent analytics; the feature flag will short-circuit optional calls. |
| `gitleaks` blocks commits | Run `npm run scan:secrets -- --report-format=json --report-path=var/reports/gitleaks.json` to inspect findings, then rotate secrets and amend commits. |

## 7. Shut down processes

Stop the multi-process dev runner with `Ctrl+C` in the shell that launched `npm run dev:replit`. Any secondary shells used for smoke testing can be closed independently.

