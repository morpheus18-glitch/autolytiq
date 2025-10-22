# Provider Account Setup Walkthrough

This walkthrough aligns with the environment contract enforced by `backend/src/config/env.ts` and `ml_service/config/env.py`. Complete each provider integration before running production workloads. Smoke commands should be executed from a secure workstation or CI environment that already has the relevant SDK/CLI installed.

## A) S3 (AWS) OR R2 (Cloudflare)
- S3: create bucket (private), IAM programmatic user with least-privilege policy (ListBucket, RW objects), CORS for presigned uploads. Save AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION. Smoke: aws s3 ls s3://$S3_BUCKET --region "$S3_REGION"
- R2: create bucket + API token; S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com; smoke: aws s3 ls ... --endpoint-url "$S3_ENDPOINT"

**Implementation tips**

- For AWS, apply a bucket policy denying public access and enable versioning. Store the generated access key in your secret manager immediately.
- For Cloudflare R2, use the `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` fields provided with the token; set `S3_REGION=auto`.

## B) Twilio (SMS)
- Get TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN; create Messaging Service; save TWILIO_MESSAGING_SERVICE_SID.
- Smoke (send yourself a msg via curl POST to /Messages.json with MessagingServiceSid).

**Implementation tips**

Use the [Twilio Console](https://console.twilio.com/) to enable message logging and webhooks. Populate the webhook URLs once the backend `/webhooks` routes are reachable over HTTPS.

## C) SendGrid (Email)
- Authenticate Domain or Single Sender; create restricted API key (Mail Send; Event Webhook optional).
- Save SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_WEBHOOK_SIGNING_KEY (if using Signed Event Webhook).
- Smoke: sandbox send via /v3/mail/send (mail_settings.sandbox_mode.enable=true).

**Implementation tips**

- Activate click and open tracking only if your compliance review allows it.
- The webhook signing key is required when `DEPLOY_MODE=self_hosted` so the backend can verify event payloads.

## D) Pexels
- Generate PEXELS_API_KEY; smoke: GET /v1/search?query=car with Authorization header.

Store the key under the environment variable name exactly—frontend requests proxy through the backend and rely on this secret.

## E) Postgres (Neon or Supabase)
- Create DB + least-priv user; get DATABASE_URL (SSL if required). Smoke: psql -c "select 1".

Neon requires the `?sslmode=require` query string; Supabase provides a ready-to-use connection string. The Celery tasks assume the database includes the schema deployed by Prisma migrations.

## F) Redis (Upstash)
- Create DB; copy rediss:// URL to REDIS_URL. Smoke: ioredis set/get.

For Upstash, select the **TLS** option so the URL begins with `rediss://`. The backend cache and Celery share the same connection string.

## G) ClickHouse Cloud (optional)
- Create service + user/pass; save CLICKHOUSE_*; smoke: curl https://HOST:PORT/?query=SELECT%201 with basic auth.

If you skip ClickHouse, leave the variables unset—the feature flag will disable analytics integrations.

## H) Replit Secrets wiring
- In Replit → Tools → Secrets: add all envs; set DEPLOY_MODE=replit and NODE_ENV=development. Start with: npm run dev:replit. Health: curl localhost:5000/health and :8000/health.

After confirming health checks, run `python ml_service/scripts/smoke_enqueue.py` to verify the Celery topology.

## I) Safety & Rotation
- .gitignore excludes .env* (except *.example); install & run gitleaks.
- Rotation plan: add NEW key, deploy with dual-read, cut over, revoke OLD, update docs.

Follow the rotation runbook in `docs/secrets.md` for detailed steps. Always purge and recreate Replit secrets rather than editing inline to avoid stale values.

