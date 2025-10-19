"""Celery task implementations for Autolytiq DMS platform."""
from __future__ import annotations

import json
import logging
import os
import subprocess
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Iterable, Optional

import boto3
import joblib
import numpy as np
import pandas as pd
import psycopg2
from celery import Task
from clickhouse_driver import Client as ClickHouseClient
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from twilio.rest import Client as TwilioClient

from workers.celery_app import celery_app

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_db_connection() -> psycopg2.extensions.connection:
    """Create a new PostgreSQL connection using environment variables."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'dms'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
    )


def get_clickhouse_client() -> ClickHouseClient:
    """Return a ClickHouse client configured for analytics queries."""
    return ClickHouseClient(
        host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
        port=int(os.getenv('CLICKHOUSE_PORT', '9000')),
        database=os.getenv('CLICKHOUSE_DB', 'analytics'),
        user=os.getenv('CLICKHOUSE_USER', 'default'),
        password=os.getenv('CLICKHOUSE_PASSWORD', ''),
    )


class DatabaseTask(Task):
    """Celery task base class that retries on transient database errors."""

    autoretry_for = (psycopg2.OperationalError,)
    retry_kwargs = {'max_retries': 3}
    retry_backoff = True


# ---------------------------------------------------------------------------
# Machine Learning & Analytics tasks
# ---------------------------------------------------------------------------

@celery_app.task(base=DatabaseTask, bind=True)
def retrain_price_model(self: Task):
    """Retrain the vehicle price prediction model using recent sales data."""
    logger.info("Starting price model retraining...")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = (
            """
            SELECT 
                d.id,
                v.year,
                v.make,
                v.model,
                v.trim,
                v.mileage,
                v.condition,
                d.selling_price as price,
                d.cost as vehicle_cost,
                d.closed_date
            FROM deals d
            JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.status = 'CLOSED'
            AND d.closed_date >= NOW() - INTERVAL '6 months'
            ORDER BY d.closed_date DESC
            """
        )

        df = pd.read_sql(query, conn)
        logger.info("Fetched %s records for training", len(df))

        if len(df) < 100:
            logger.warning("Insufficient data for training (minimum 100 records)")
            return {'status': 'skipped', 'reason': 'insufficient_data'}

        df['age'] = datetime.now().year - df['year']
        df['profit'] = df['price'] - df['vehicle_cost']
        df['margin'] = (df['profit'] / df['price']) * 100

        features = ['year', 'mileage', 'age']
        X = df[features]
        y = df['price']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        logger.info("Model trained - MAE: $%.2f, R²: %.4f", mae, r2)

        model_dir = os.getenv('MODEL_PATH', '/models')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(
            model_dir, f"price_model_{datetime.now().strftime('%Y%m%d')}.pkl"
        )
        joblib.dump(model, model_path)

        s3_bucket = os.getenv('S3_BUCKET')
        if not s3_bucket:
            raise RuntimeError('S3_BUCKET environment variable is required for model upload')

        s3 = boto3.client('s3')
        s3.upload_file(model_path, s3_bucket, 'models/price_model_latest.pkl')

        cursor.execute(
            """
            INSERT INTO model_metadata (model_type, version, mae, r2, trained_at, records_count)
            VALUES ('price_prediction', %s, %s, %s, NOW(), %s)
            """,
            (datetime.now().strftime('%Y%m%d'), mae, r2, len(df)),
        )

        conn.commit()
        return {
            'status': 'success',
            'mae': float(mae),
            'r2': float(r2),
            'records': len(df),
            'model_path': model_path,
        }
    except Exception as exc:  # pragma: no cover - Celery handles logging
        logger.exception("Error retraining price model")
        raise self.retry(exc=exc, countdown=300)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@celery_app.task(base=DatabaseTask)
def update_lead_scores():
    """Update lead scores hourly using CRM activity and analytics."""
    logger.info("Starting lead score update...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, customer_id, source, created_at, last_contact_date
            FROM leads
            WHERE status IN ('NEW', 'CONTACTED', 'QUALIFIED')
            """
        )
        leads = cursor.fetchall()
        logger.info("Processing %s active leads", len(leads))

        updated_count = 0
        for lead_id, customer_id, source, created_at, last_contact in leads:
            score = 50
            days_old = (datetime.now() - created_at).days
            if days_old <= 1:
                score += 20
            elif days_old <= 3:
                score += 15
            elif days_old <= 7:
                score += 10
            elif days_old <= 14:
                score += 5

            source_scores = {
                'WEBSITE': 15,
                'REFERRAL': 20,
                'PHONE': 10,
                'WALK_IN': 12,
                'FACEBOOK': 8,
                'GOOGLE': 10,
            }
            score += source_scores.get(source, 5)

            if last_contact:
                days_since_contact = (datetime.now() - last_contact).days
                if days_since_contact <= 1:
                    score += 15
                elif days_since_contact <= 3:
                    score += 10
                elif days_since_contact <= 7:
                    score += 5

            try:
                ch_client = get_clickhouse_client()
                events = ch_client.execute(
                    """
                    SELECT COUNT(*) FROM events 
                    WHERE customer_id = %s AND event_time >= NOW() - INTERVAL 7 DAY
                    """,
                    [str(customer_id)],
                )
                event_count = events[0][0] if events else 0
                score += min(event_count * 2, 20)
            except Exception as err:
                logger.warning("Could not fetch ClickHouse data for customer %s: %s", customer_id, err)

            score = min(score, 100)
            cursor.execute(
                """
                UPDATE leads
                SET score = %s, score_updated_at = NOW()
                WHERE id = %s
                """,
                (score, lead_id),
            )
            updated_count += 1

        conn.commit()
        logger.info("Updated %s lead scores", updated_count)
        return {'status': 'success', 'updated': updated_count}
    finally:
        cursor.close()
        conn.close()


@celery_app.task(base=DatabaseTask)
def optimize_inventory():
    """Generate pricing recommendations for aging inventory."""
    logger.info("Starting inventory optimization...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT 
                v.id,
                v.vin,
                v.year,
                v.make,
                v.model,
                v.cost,
                v.list_price,
                v.status,
                v.stock_number,
                v.created_at,
                CURRENT_DATE - v.created_at::date as days_in_stock
            FROM vehicles v
            WHERE v.status = 'AVAILABLE'
            ORDER BY v.created_at ASC
            """
        )
        inventory = cursor.fetchall()
        logger.info("Analyzing %s vehicles in inventory", len(inventory))

        recommendations = []
        for vehicle in inventory:
            (
                v_id,
                _vin,
                _year,
                make,
                model,
                _cost,
                list_price,
                _status,
                stock_num,
                _created_at,
                days_in_stock,
            ) = vehicle

            recommendation = {
                'vehicle_id': v_id,
                'stock_number': stock_num,
                'make': make,
                'model': model,
                'days_in_stock': int(days_in_stock),
                'current_price': float(list_price),
                'actions': [],
            }

            discount = None
            reason = None
            if days_in_stock >= 90:
                discount = 0.12
                reason = 'Vehicle aging (90+ days)'
            elif days_in_stock >= 60:
                discount = 0.08
                reason = 'Vehicle aging (60+ days)'
            elif days_in_stock >= 30:
                discount = 0.05
                reason = 'Vehicle aging (30+ days)'

            if discount and reason:
                recommendation['actions'].append(
                    {
                        'type': 'PRICE_REDUCTION',
                        'reason': reason,
                        'recommended_price': float(list_price * (1 - discount)),
                        'discount_percent': discount * 100,
                    }
                )
                recommendations.append(recommendation)

        cursor.execute(
            """
            INSERT INTO inventory_optimizations (optimization_date, recommendations, created_at)
            VALUES (CURRENT_DATE, %s, NOW())
            """,
            (json.dumps(recommendations),),
        )

        cursor.execute(
            """
            SELECT email FROM users 
            WHERE role IN ('ADMIN', 'MANAGER') AND status = 'ACTIVE'
            """
        )
        manager_emails = [row[0] for row in cursor.fetchall() if row[0]]

        if manager_emails and recommendations:
            send_email.delay(
                to_emails=manager_emails,
                subject='Daily Inventory Optimization Report',
                body=(
                    "<h2>Inventory Optimization Report</h2>"
                    f"<p>Found {len(recommendations)} vehicles that need attention:</p>"
                    "<ul>"
                    + "".join(
                        f"<li>{r['make']} {r['model']} - {r['days_in_stock']} days in stock</li>"
                        for r in recommendations[:10]
                    )
                    + "</ul><p>Log in to view full report and take action.</p>"
                ),
            )

        conn.commit()
        logger.info("Inventory optimization complete - %s recommendations", len(recommendations))
        return {'status': 'success', 'recommendations': len(recommendations)}
    finally:
        cursor.close()
        conn.close()


@celery_app.task
def analyze_customer_behavior():
    """Analyse ClickHouse events to surface highly engaged customers."""
    logger.info("Analyzing customer behavior...")

    try:
        ch_client = get_clickhouse_client()
        query = (
            """
            SELECT 
                customer_id,
                event_type,
                COUNT(*) as event_count
            FROM events
            WHERE event_time >= NOW() - INTERVAL 15 MINUTE
            GROUP BY customer_id, event_type
            HAVING event_count >= 3
            """
        )
        results = ch_client.execute(query)
    except Exception as exc:
        logger.error("Error querying ClickHouse: %s", exc)
        raise

    high_engagement_customers: set[str] = set()
    for customer_id, event_type, count in results:
        if event_type == 'page_view' and count >= 5:
            high_engagement_customers.add(customer_id)
        elif event_type == 'vehicle_view' and count >= 3:
            high_engagement_customers.add(customer_id)

    if not high_engagement_customers:
        logger.info("No high-engagement customers detected")
        return {'status': 'success', 'high_engagement_count': 0}

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for customer_id in high_engagement_customers:
            cursor.execute(
                """
                UPDATE customers
                SET high_engagement = TRUE, last_engagement_at = NOW()
                WHERE id = %s
                """,
                (customer_id,),
            )

            cursor.execute(
                """
                INSERT INTO notifications (user_id, type, title, message, created_at)
                SELECT 
                    l.assigned_to,
                    'HIGH_ENGAGEMENT',
                    'Hot Lead Alert',
                    'Customer ' || c.first_name || ' ' || c.last_name || ' is highly engaged right now!',
                    NOW()
                FROM customers c
                LEFT JOIN leads l ON l.customer_id = c.id
                WHERE c.id = %s AND l.assigned_to IS NOT NULL
                """,
                (customer_id,),
            )

        conn.commit()
        logger.info("Flagged %s customers as highly engaged", len(high_engagement_customers))
        return {'status': 'success', 'high_engagement_count': len(high_engagement_customers)}
    finally:
        cursor.close()
        conn.close()


@celery_app.task
def generate_daily_reports():
    """Compile daily financial reports for each active tenant."""
    logger.info("Generating daily reports...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, name FROM tenants WHERE status = 'ACTIVE'")
        tenants = cursor.fetchall()

        reports_generated = 0
        for tenant_id, _tenant_name in tenants:
            yesterday = (datetime.now() - timedelta(days=1)).date()
            cursor.execute(
                """
                SELECT 
                    SUM(CASE WHEN gl.type = 'REVENUE' THEN jel.credit - jel.debit ELSE 0 END) as revenue,
                    SUM(CASE WHEN gl.type = 'EXPENSE' THEN jel.debit - jel.credit ELSE 0 END) as expenses
                FROM journal_entry_lines jel
                JOIN journal_entries je ON jel.entry_id = je.id
                JOIN gl_accounts gl ON jel.account_id = gl.id
                WHERE je.tenant_id = %s
                AND je.date = %s
                AND je.status = 'POSTED'
                """,
                (tenant_id, yesterday),
            )
            result = cursor.fetchone() or (0, 0)
            revenue, expenses = result
            profit = (revenue or 0) - (expenses or 0)

            cursor.execute(
                """
                INSERT INTO daily_reports (tenant_id, report_date, revenue, expenses, profit, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                """,
                (tenant_id, yesterday, revenue or 0, expenses or 0, profit),
            )
            reports_generated += 1

        conn.commit()
        logger.info("Generated %s daily reports", reports_generated)
        return {'status': 'success', 'reports': reports_generated}
    finally:
        cursor.close()
        conn.close()


@celery_app.task
def backup_database():
    """Create a compressed PostgreSQL backup and upload to S3."""
    logger.info("Starting database backup...")

    backup_file = f"/tmp/backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'dms')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'password')

    os.environ['PGPASSWORD'] = db_password
    dump_command = [
        'pg_dump',
        '-h',
        db_host,
        '-U',
        db_user,
        '-d',
        db_name,
        '-F',
        'c',
        '-f',
        backup_file,
    ]

    result = subprocess.run(dump_command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        logger.error("pg_dump failed: %s", result.stderr)
        raise RuntimeError(f"pg_dump failed: {result.stderr}")

    backup_size = os.path.getsize(backup_file)
    logger.info("Backup file created: %s (%.2f MB)", backup_file, backup_size / 1024 / 1024)

    s3_bucket = os.getenv('S3_BUCKET')
    if not s3_bucket:
        raise RuntimeError('S3_BUCKET environment variable is required for backups')

    s3 = boto3.client('s3')
    s3_key = f"backups/database/{os.path.basename(backup_file)}"
    s3.upload_file(backup_file, s3_bucket, s3_key)
    logger.info("Backup uploaded to S3: %s", s3_key)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO backups (backup_type, file_path, file_size, status, created_at)
            VALUES ('DATABASE', %s, %s, 'COMPLETED', NOW())
            """,
            (s3_key, backup_size),
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    os.remove(backup_file)

    retention_date = datetime.now() - timedelta(days=30)
    response = s3.list_objects_v2(Bucket=s3_bucket, Prefix='backups/database/')
    for obj in response.get('Contents', []):
        if obj['LastModified'].replace(tzinfo=None) < retention_date:
            s3.delete_object(Bucket=s3_bucket, Key=obj['Key'])
            logger.info("Deleted old backup: %s", obj['Key'])

    return {
        'status': 'success',
        'backup_file': s3_key,
        'size_mb': backup_size / 1024 / 1024,
    }


@celery_app.task
def send_email(to_emails: Iterable[str] | str, subject: str, body: str, attachments: Optional[list] = None):
    """Send email messages using SMTP credentials stored in the environment."""
    recipients = list(to_emails) if isinstance(to_emails, (list, tuple, set)) else [to_emails]
    logger.info("Sending email to %s", recipients)

    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    from_email = os.getenv('SMTP_FROM_EMAIL') or smtp_user

    if not smtp_user or not smtp_password:
        raise RuntimeError('SMTP credentials must be configured for send_email task')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = ', '.join(recipients)
    msg.attach(MIMEText(body, 'html'))

    if attachments:
        logger.warning("Attachments are not yet implemented; ignoring provided attachments")

    import smtplib

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

    logger.info("Email sent successfully to %s", recipients)
    return {'status': 'success', 'recipients': recipients}


@celery_app.task
def send_sms(to_phone: str, message: str):
    """Send transactional SMS messages using Twilio."""
    logger.info("Sending SMS to %s", to_phone)

    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_phone = os.getenv('TWILIO_PHONE_NUMBER')

    if not all([account_sid, auth_token, from_phone]):
        raise RuntimeError('Twilio credentials are not configured')

    client = TwilioClient(account_sid, auth_token)
    response = client.messages.create(body=message[:160], from_=from_phone, to=to_phone)
    logger.info("SMS sent successfully: %s", response.sid)
    return {'status': 'success', 'message_sid': response.sid}


@celery_app.task
def send_morning_digest():
    """Send a morning digest email to opted-in users across all tenants."""
    logger.info("Sending morning digest emails...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT u.email, u.first_name, u.tenant_id
            FROM users u
            WHERE u.status = 'ACTIVE'
            AND COALESCE(u.email_preferences->>'morning_digest', 'false') = 'true'
            """
        )
        users = cursor.fetchall()

        for email, first_name, tenant_id in users:
            yesterday = (datetime.now() - timedelta(days=1)).date()

            cursor.execute(
                "SELECT COUNT(*) FROM leads WHERE tenant_id = %s AND created_at::date = %s",
                (tenant_id, yesterday),
            )
            new_leads = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT COUNT(*) FROM deals 
                WHERE tenant_id = %s AND closed_date::date = %s AND status = 'CLOSED'
                """,
                (tenant_id, yesterday),
            )
            deals_closed = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT COALESCE(SUM(selling_price - cost), 0)
                FROM deals
                WHERE tenant_id = %s AND closed_date::date = %s AND status = 'CLOSED'
                """,
                (tenant_id, yesterday),
            )
            gross_profit = cursor.fetchone()[0]

            send_email.delay(
                to_emails=[email],
                subject=f'Good morning {first_name}! Your daily digest',
                body=(
                    "<h2>Yesterday's Performance</h2>"
                    f"<ul><li><strong>New Leads:</strong> {new_leads}</li>"
                    f"<li><strong>Deals Closed:</strong> {deals_closed}</li>"
                    f"<li><strong>Gross Profit:</strong> ${gross_profit:,.2f}</li></ul>"
                    "<p>Log in to see detailed reports and take action on hot leads.</p>"
                ),
            )

        logger.info("Sent morning digest to %s users", len(users))
        return {'status': 'success', 'emails_sent': len(users)}
    finally:
        cursor.close()
        conn.close()


@celery_app.task(base=DatabaseTask)
def process_notification_queue():
    """Process queued notifications and send via email/SMS as needed."""
    logger.info("Processing notification queue...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, user_id, type, title, message, email, sms, created_at
            FROM notifications
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT 100
            """
        )
        notifications = cursor.fetchall()
        processed = 0

        for notif in notifications:
            notif_id, user_id, _type, title, message, send_email_flag, send_sms_flag, _created_at = notif
            cursor.execute("SELECT email, phone FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                cursor.execute(
                    "UPDATE notifications SET status = 'FAILED', processed_at = NOW() WHERE id = %s",
                    (notif_id,),
                )
                continue

            user_email, user_phone = user
            if send_email_flag and user_email:
                send_email.delay(to_emails=[user_email], subject=title, body=message)
            if send_sms_flag and user_phone:
                send_sms.delay(to_phone=user_phone, message=message[:160])

            cursor.execute(
                "UPDATE notifications SET status = 'SENT', processed_at = NOW() WHERE id = %s",
                (notif_id,),
            )
            processed += 1

        conn.commit()
        logger.info("Processed %s notifications", processed)
        return {'status': 'success', 'processed': processed}
    finally:
        cursor.close()
        conn.close()


@celery_app.task(base=DatabaseTask)
def sync_integrations():
    """Synchronise external integrations for tenants based on configuration."""
    logger.info("Syncing integrations...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT tenant_id, key, value
            FROM system_settings
            WHERE key LIKE 'integration_%'
            """
        )
        integrations = cursor.fetchall()
        synced = 0

        for tenant_id, key, raw_value in integrations:
            try:
                config = raw_value if isinstance(raw_value, dict) else json.loads(raw_value)
            except (TypeError, json.JSONDecodeError):
                logger.warning("Invalid integration config for tenant %s (%s)", tenant_id, key)
                continue

            if not config.get('active'):
                continue

            integration_name = key.replace('integration_', '')
            logger.info("Syncing %s for tenant %s", integration_name, tenant_id)

            # Placeholder for actual sync implementations.
            # Integrations can be implemented with dedicated helper modules.
            synced += 1

        logger.info("Synced %s integrations", synced)
        return {'status': 'success', 'synced': synced}
    finally:
        cursor.close()
        conn.close()


@celery_app.task(base=DatabaseTask)
def cleanup_expired_sessions():
    """Remove sessions that have not been updated for seven days."""
    logger.info("Cleaning up expired sessions...")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM sessions WHERE updated_at < NOW() - INTERVAL '7 days'"
        )
        deleted = cursor.rowcount
        conn.commit()
        logger.info("Deleted %s expired sessions", deleted)
        return {'status': 'success', 'deleted': deleted}
    finally:
        cursor.close()
        conn.close()


@celery_app.task(base=DatabaseTask)
def update_dashboard_cache():
    """Refresh cached dashboard KPIs for active tenants."""
    logger.info("Updating dashboard cache...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id FROM tenants WHERE status = 'ACTIVE'")
        tenants = cursor.fetchall()

        for (tenant_id,) in tenants:
            cursor.execute(
                """
                SELECT 
                    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as leads_today,
                    COUNT(*) FILTER (WHERE closed_date >= CURRENT_DATE AND status = 'CLOSED') as deals_today,
                    COALESCE(SUM(selling_price - cost) FILTER (WHERE closed_date >= CURRENT_DATE AND status = 'CLOSED'), 0) as profit_today
                FROM deals
                WHERE tenant_id = %s
                """,
                (tenant_id,),
            )
            stats = cursor.fetchone()

            cursor.execute(
                """
                INSERT INTO dashboard_cache (tenant_id, cache_key, cache_value, expires_at)
                VALUES (%s, 'daily_stats', %s, NOW() + INTERVAL '24 hours')
                ON CONFLICT (tenant_id, cache_key) 
                DO UPDATE SET cache_value = EXCLUDED.cache_value, expires_at = EXCLUDED.expires_at
                """,
                (
                    tenant_id,
                    json.dumps(
                        {
                            'leads_today': stats[0],
                            'deals_today': stats[1],
                            'profit_today': float(stats[2]),
                        }
                    ),
                ),
            )

        conn.commit()
        logger.info("Updated dashboard cache for %s tenants", len(tenants))
        return {'status': 'success', 'tenants': len(tenants)}
    finally:
        cursor.close()
        conn.close()


__all__ = [
    'retrain_price_model',
    'update_lead_scores',
    'optimize_inventory',
    'analyze_customer_behavior',
    'generate_daily_reports',
    'backup_database',
    'send_email',
    'send_sms',
    'send_morning_digest',
    'process_notification_queue',
    'sync_integrations',
    'cleanup_expired_sessions',
    'update_dashboard_cache',
]
