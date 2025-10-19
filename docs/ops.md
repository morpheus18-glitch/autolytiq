# Operational Runbooks

## On-demand database backup

The Celery task `workers.tasks.backup_database` performs automated backups. To trigger a manual backup:

1. Ensure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `S3_BUCKET` are set.
2. Enqueue the task:
   ```sh
   python - <<'PY'
   from workers.celery_app import celery_app
   job = celery_app.send_task('workers.tasks.backup_database')
   print('Backup job queued:', job.id)
   print('Result:', job.get(timeout=120))
   PY
   ```
3. Verify the new object exists in `s3://$S3_BUCKET/backups/database/`.

Backups are retained for 30 days; older archives are purged automatically.

## Daily reports regeneration

`workers.tasks.generate_daily_reports` writes summaries into the `daily_reports` table. To rerun for a missed day, execute:

```sh
python - <<'PY'
from workers.celery_app import celery_app
celery_app.send_task('workers.tasks.generate_daily_reports', kwargs={'force': True})
PY
```

## Dashboard cache refresh

The `update_dashboard_cache` task rebuilds metrics for active tenants. Run it after large data imports to avoid stale dashboards:

```sh
python ml_service/scripts/smoke_enqueue.py
```

## Restoring from backup

1. Download the desired archive from S3:
   ```sh
   aws s3 cp s3://$S3_BUCKET/backups/database/backup_YYYYMMDD_HHMMSS.sql ./restore.sql
   ```
2. Restore into Postgres:
   ```sh
   pg_restore --clean --if-exists --dbname "$DATABASE_URL" restore.sql
   ```
3. Restart backend and worker processes and monitor `/health/ready`.

## Monitoring & alerts

- Prometheus scrapes `/metrics` on both backend (`:5000`) and ML service (`:8000`).
- Grafana dashboards in `infrastructure/docker/monitoring` visualise request latency and task throughput.
- Configure alert rules for:
  - Failing `/health/ready` probes.
  - High Redis latency (>200ms).
  - Celery queue depth > 100 jobs for more than 5 minutes.

## Incident checklist

1. **Stabilise** – Use `/health/detailed` to confirm which dependencies are impacted (Postgres, Redis, ClickHouse, ML service).
2. **Mitigate** – Scale workers or restart pods depending on deploy mode (`DEPLOY_MODE`).
3. **Verify** – Run:
   ```sh
   npm run audit:infra
   curl http://localhost:5000/health
   curl http://localhost:8000/health
   python ml_service/scripts/smoke_enqueue.py
   ```
4. **Document** – Capture timestamps, root cause, and remediation in your incident tracker.
