# Provider Setup Walkthrough

This guide documents how to bootstrap the third-party integrations referenced by the Autolytiq stack.

## Object storage (AWS S3, Cloudflare R2, or MinIO)

1. **Create bucket** – Use your provider console to create a bucket (for example `autolytiq-uploads`). Enable versioning if you require rollback support.
2. **Configure CORS** – Allow `GET`, `PUT`, and `POST` from your frontend origin. Example JSON:
   ```json
   [
     {
       "AllowedOrigins": ["https://your-app.com", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
3. **Create IAM/R2 API user** – Grant least-privilege access (read/write to the bucket only).
4. **Capture credentials** – Save `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `S3_BUCKET`. For S3-compatible providers include `S3_ENDPOINT` (e.g. `https://<account>.r2.cloudflarestorage.com`).
5. **Smoke test** – From the repo root run:
   ```sh
   aws s3 ls s3://$S3_BUCKET --endpoint-url "$S3_ENDPOINT"
   ```

## Twilio messaging

1. In the [Twilio Console](https://console.twilio.com/), create a Messaging Service and verify a phone number.
2. Generate API credentials and copy `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, and a default `TWILIO_PHONE_NUMBER`.
3. Update the secrets store and run:
   ```sh
   python - <<'PY'
   from twilio.rest import Client
   import os

   client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
   service = client.messaging.services(os.environ['TWILIO_MESSAGING_SERVICE_SID']).fetch()
   print('Messaging service ready:', service.friendly_name)
   PY
   ```

## SendGrid

1. Verify your sending domain and create a restricted API key with `Mail Send` and `Inbound Parse` scopes.
2. Set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and `SENDGRID_WEBHOOK_SIGNING_KEY`.
3. Optionally configure SMTP relay (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) if you plan to use transactional email.
4. Run the Celery smoke test to ensure outbound email tasks queue correctly:
   ```sh
   python ml_service/scripts/smoke_enqueue.py
   ```

## Pexels

1. Request an API key from [Pexels](https://www.pexels.com/api/new/).
2. Store `PEXELS_API_KEY` in your secrets manager.
3. Validate by calling the enrichment endpoint:
   ```sh
   curl -H "Authorization: Bearer $PEXELS_API_KEY" https://api.pexels.com/v1/search?query=cars&per_page=1
   ```

## Database providers (Neon, Supabase, RDS)

1. Provision a PostgreSQL database and note the connection string (e.g. `postgresql://user:pass@host:5432/db`).
2. Assign the URL to `DATABASE_URL` and optionally a read-replica URL to `DIRECT_URL`.
3. Run migrations and smoke tests:
   ```sh
   npm run prisma:migrate
   npm run audit:infra
   ```

## Redis (Upstash, ElastiCache, Redis Cloud)

1. Create a Redis database with TLS disabled or supply the rediss URL.
2. Store the connection URI in `REDIS_URL`.
3. Validate connectivity:
   ```sh
   node -e "require('./backend/src/lib/cache').quickSmoke().then(()=>console.log('Redis OK')).catch((err)=>{console.error(err);process.exit(1);})"
   ```

## ClickHouse (optional analytics)

1. Deploy ClickHouse Cloud or a self-hosted instance.
2. Set `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, and `CLICKHOUSE_DB`.
3. Confirm metrics ingestion:
   ```sh
   curl http://$CLICKHOUSE_HOST:$CLICKHOUSE_PORT/ping
   ```

## Final checklist

- All secrets validated using the smoke tests above.
- `/health` and `/metrics` endpoints return expected responses.
- Celery workers and beat process connect to Redis successfully.
- Docker/K8s assets remain gated behind `DEPLOY_MODE=self_hosted` so Replit sessions are unaffected.
