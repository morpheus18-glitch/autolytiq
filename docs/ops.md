# Operations Runbook

The Celery topology inside `ml_service/workers` owns recurring maintenance jobs (database backups, report generation, cache refresh, session cleanup). Use this runbook for manual operations and incident response.

## On-demand database backup

Celery beat schedules `workers.tasks.backup_database` daily at 05:00 UTC. To trigger an on-demand backup:

1. Ensure the worker and beat processes are running (`npm run dev:worker:hp`, `npm run dev:beat`, or the equivalent Docker/Kubernetes deployments).
2. Run the smoke enqueue script with the backup task name:
   ```bash
   python ml_service/scripts/smoke_enqueue.py workers.tasks.backup_database
   ```
   (The script defaults to `workers.tasks.smoke_check`; pass the task name as the first argument to queue a specific job.)
3. Monitor worker logs for `backup_database` completion and confirm the object exists in S3/R2 under `backups/`.

Backups use `pg_dump` with compression and upload the archive to the bucket defined by `S3_BUCKET`. Credentials come from the shared environment contract.

## Retention policy

- **Automated backups** – Retain the last 7 daily snapshots and the last 4 weekly snapshots in S3/R2. Configure lifecycle rules on the bucket to purge older archives automatically.
- **Reports** – `generate_daily_reports` writes entries to the `daily_reports` table (see migrations) and stores a PDF in object storage. Keep 90 days of reports before archival.
- **Cache** – `update_dashboard_cache` refreshes Redis keys hourly; no manual retention steps required.
- **Sessions** – `cleanup_expired_sessions` removes stale entries from Postgres and Redis each night to keep login flows healthy.

Document any deviation from these defaults in this file so on-call engineers can reference the live policy.

## Restore procedure

1. Identify the desired backup file in S3/R2.
2. Download the archive to a secure machine:
   ```bash
   aws s3 cp s3://$S3_BUCKET/backups/<timestamp>.sql.gz ./restore.sql.gz
   gunzip restore.sql.gz
   ```
3. Restore into a fresh Postgres database (never overwrite production in-place):
   ```bash
   psql "$DATABASE_URL" -f restore.sql
   ```
4. Run Prisma migrations if the backup predates schema changes:
   ```bash
   npm --prefix backend run prisma:migrate
   ```
5. Validate health:
   ```bash
   curl -s http://127.0.0.1:5000/health
   python ml_service/scripts/smoke_enqueue.py
   ```
6. Promote the restored database by updating `DATABASE_URL` and redeploying (`make rebuild` for Docker, `kubectl rollout restart` for Kubernetes, or `npm run dev:replit` for Replit).

Always rotate credentials after a restore to ensure the downloaded dump cannot be reused maliciously.

