# DigitalOcean Managed PostgreSQL Setup

## Your Current Setup

**DigitalOcean Managed Database:**
- Service: PostgreSQL (managed)
- Provider: DigitalOcean
- Location: Same region as autolytiq-pool (recommended)
- SSL: Required (DO enforces SSL connections)

---

## Connection Configuration

### 1. Get Database Connection String from DO

In DigitalOcean Console:
```
Databases → Your PostgreSQL Cluster → Connection Details
```

You'll see something like:
```
Host: db-postgresql-nyc3-12345.b.db.ondigitalocean.com
Port: 25060
Username: doadmin
Password: <your-password>
Database: defaultdb
SSL Mode: require
```

**Connection String Format:**
```
postgresql://doadmin:<password>@db-postgresql-nyc3-12345.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require
```

### 2. Create Database for Autolytiq

Connect via `psql` or DigitalOcean console:
```sql
-- Create database
CREATE DATABASE autolytiq;

-- Create user (optional - or use doadmin)
CREATE USER autolytiq_app WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE autolytiq TO autolytiq_app;

-- Switch to autolytiq database
\c autolytiq

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO autolytiq_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autolytiq_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autolytiq_app;
```

---

## Kubernetes Secret Configuration

### Method 1: Using doctl (Recommended)

```bash
# Set your connection string as environment variable
export DB_URL="postgresql://autolytiq_app:secure_password@db-postgresql-nyc3-12345.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require"

# Create secret in autolytiq-prod namespace
kubectl create secret generic database-secret \
  --from-literal=url="$DB_URL" \
  -n autolytiq-prod \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Method 2: Using Kubernetes Manifest

Create `database-secret.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: autolytiq-prod
type: Opaque
stringData:
  url: "postgresql://autolytiq_app:secure_password@db-postgresql-nyc3-12345.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require"
```

Apply:
```bash
kubectl apply -f database-secret.yaml
```

### Method 3: Using DigitalOcean Database Connection Pool (Recommended for Production)

**Why use Connection Pool?**
- Better performance under load
- Prevents connection exhaustion
- Automatic connection recycling

**Setup:**
1. In DO Console: Databases → Your Cluster → Connection Pools
2. Click "Create a Connection Pool"
3. Settings:
   - **Pool Name**: `autolytiq-pool`
   - **Database**: `autolytiq`
   - **User**: `autolytiq_app`
   - **Pool Mode**: `Transaction` (recommended for REST APIs)
   - **Pool Size**: `25` (adjust based on load)

4. Get Connection Pool String:
```
postgresql://autolytiq_app:password@db-postgresql-nyc3-12345-pool.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require
```

5. Create Secret with Pool URL:
```bash
kubectl create secret generic database-secret \
  --from-literal=url="postgresql://autolytiq_app:password@db-postgresql-nyc3-12345-pool.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require" \
  -n autolytiq-prod
```

---

## SSL/TLS Configuration

### DigitalOcean Enforces SSL

**Good news:** Go's pgx driver automatically handles SSL when `sslmode=require` is in the connection string.

**Connection String Options:**
```
?sslmode=require          # Require SSL (recommended)
?sslmode=verify-ca        # Verify CA certificate
?sslmode=verify-full      # Verify CA + hostname
```

**For production, use `sslmode=require`:**
```
postgresql://user:pass@host:25060/db?sslmode=require
```

### Optional: Use CA Certificate (Extra Security)

If you want to verify the CA certificate:

1. Download DO CA Certificate:
```bash
curl -o do-ca-certificate.crt https://docs.digitalocean.com/products/databases/postgresql/resources/ca-certificate/
```

2. Create Kubernetes Secret:
```bash
kubectl create secret generic postgres-ca \
  --from-file=ca.crt=do-ca-certificate.crt \
  -n autolytiq-prod
```

3. Update Deployment to Mount CA:
```yaml
# In deployment.yaml
volumeMounts:
- name: postgres-ca
  mountPath: /etc/ssl/certs/postgres
  readOnly: true

volumes:
- name: postgres-ca
  secret:
    secretName: postgres-ca
```

4. Update Connection String:
```
postgresql://user:pass@host:25060/db?sslmode=verify-ca&sslrootcert=/etc/ssl/certs/postgres/ca.crt
```

---

## Connection Pool Settings in Go

The Go backend's `pkg/database/database.go` can be configured for optimal performance:

```go
// Current implementation
func NewClient() (*Client, error) {
    databaseURL := os.Getenv("DATABASE_URL")
    client, err := ent.Open("pgx", databaseURL)
    // ...
}
```

**For production, add connection pool config:**

```go
import (
    "github.com/jackc/pgx/v5/pgxpool"
)

func NewClient() (*Client, error) {
    databaseURL := os.Getenv("DATABASE_URL")

    // Parse connection string and add pool config
    config, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        return nil, err
    }

    // Configure pool
    config.MaxConns = 25          // Max connections (match DO pool size)
    config.MinConns = 5           // Keep 5 connections warm
    config.MaxConnLifetime = 1h   // Recycle connections every hour
    config.MaxConnIdleTime = 30m  // Close idle connections after 30min

    // Open with Ent
    client, err := ent.Open("pgx", databaseURL)
    // ...
}
```

---

## Firewall Rules (If Needed)

DigitalOcean allows you to restrict database access by IP or VPC.

### Option 1: Allow Kubernetes Cluster IPs

1. Get your cluster's outbound IPs:
```bash
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  sh -c "apk add curl && curl ifconfig.me"
```

2. In DO Console: Databases → Your Cluster → Settings → Trusted Sources
3. Add: "Kubernetes Cluster" or specific IPs

### Option 2: Use VPC (Recommended)

**If your database and K8s cluster are in the same VPC:**

1. DO Console: Databases → Your Cluster → Settings → VPC Network
2. Select same VPC as autolytiq-pool
3. Database will have private IP: `10.x.x.x:25060`

**Connection String with Private IP:**
```
postgresql://user:pass@10.108.0.2:25060/autolytiq?sslmode=require
```

**Benefits:**
- No public internet traffic
- Lower latency
- No bandwidth charges
- Better security

---

## Migration Strategy

### Initial Setup (Before Deployment)

```bash
# 1. Create database
psql "postgresql://doadmin:pass@host:25060/defaultdb?sslmode=require" \
  -c "CREATE DATABASE autolytiq;"

# 2. Run Ent migrations (from local machine)
cd /root/autolytiq/apps/backend-go
export DATABASE_URL="postgresql://doadmin:pass@host:25060/autolytiq?sslmode=require"
go run cmd/server/main.go  # Auto-migrates on startup

# 3. Verify tables created
psql "$DATABASE_URL" -c "\dt"
# Should show: customers, leads, users, tenants, etc.
```

### Kubernetes Deployment

```bash
# 1. Create secret with DO managed DB URL
kubectl create secret generic database-secret \
  --from-literal=url="postgresql://autolytiq_app:pass@db-postgresql-nyc3-12345-pool.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require" \
  -n autolytiq-prod

# 2. Deploy Go backend
kubectl apply -k infrastructure/k8s/backend-go/

# 3. Check if migrations ran
kubectl logs -n autolytiq-prod -l app=backend-go | grep "Database schema migrated"
# Should see: ✅ Database schema migrated successfully
```

---

## Monitoring Database Performance

### DigitalOcean Metrics

In DO Console: Databases → Your Cluster → Metrics

**Watch for:**
- CPU usage (scale up if consistently > 80%)
- Memory usage (upgrade if swapping)
- Connection count (should be < pool size)
- Disk usage (autoscaled by DO)

### Query from Go Backend

```bash
# Get active connections
kubectl exec -it -n autolytiq-prod <backend-go-pod> -- \
  psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity WHERE datname='autolytiq';"

# Check slow queries (if enabled)
kubectl exec -it -n autolytiq-prod <backend-go-pod> -- \
  psql "$DATABASE_URL" -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## Backup & Recovery

**DigitalOcean handles automatic backups:**
- Daily backups (retained 7 days on Basic plan)
- Point-in-time recovery (if enabled)
- Manual backups via DO Console

**To restore:**
1. DO Console: Databases → Your Cluster → Backups
2. Select backup date
3. Restore to new cluster or fork

**Test backup restore procedure monthly!**

---

## Cost Optimization

**DigitalOcean Managed PostgreSQL Pricing:**
- Basic: $15/month (1GB RAM, 10GB storage, 1 node)
- Professional: $60/month (4GB RAM, 115GB storage, 2 nodes + standby)

**Recommended for Autolytiq:**
- Start: Basic ($15/month)
- Production: Professional ($60/month) for high availability

**Connection Pool Benefits:**
- Reduce database load
- Handle 10x more concurrent requests
- Same database, lower resource usage

**Total Monthly Cost:**
- Database: $60 (Professional)
- Backend-Go: $27 (3 pods + LB)
- **Total: $87/month** vs $122/month (Node.js + Basic DB)

---

## Example: Complete Setup Script

```bash
#!/bin/bash
# setup-do-database.sh

# Variables
DB_HOST="db-postgresql-nyc3-12345-pool.b.db.ondigitalocean.com"
DB_PORT="25060"
DB_USER="autolytiq_app"
DB_PASS="your-secure-password"
DB_NAME="autolytiq"
NAMESPACE="autolytiq-prod"

# Construct connection URL
DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

# Create Kubernetes secret
echo "Creating database secret in ${NAMESPACE}..."
kubectl create secret generic database-secret \
  --from-literal=url="$DB_URL" \
  -n $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# Verify secret
echo "Verifying secret..."
kubectl get secret database-secret -n $NAMESPACE

echo "✅ Database secret configured!"
echo "Deploy with: kubectl apply -k infrastructure/k8s/backend-go/"
```

---

## Troubleshooting

### Connection Refused
```
Error: dial tcp: connect: connection refused
```
**Fix:** Check firewall rules, add K8s cluster to trusted sources

### SSL Error
```
Error: SSL is required but not supported by client
```
**Fix:** Add `?sslmode=require` to connection string

### Too Many Connections
```
Error: FATAL: sorry, too many clients already
```
**Fix:**
- Use connection pool
- Reduce `MaxConns` in backend config
- Upgrade database plan

### Slow Queries
```
Queries taking > 1 second
```
**Fix:**
- Add indexes in Ent schema
- Enable query logging in PostgreSQL
- Analyze with `EXPLAIN ANALYZE`

---

## Next Steps

1. ✅ **Use DO Managed PostgreSQL** (no local Postgres needed)
2. ✅ **Create connection pool** in DO Console
3. ✅ **Create Kubernetes secret** with connection string
4. ✅ **Deploy Go backend** - auto-migrates schema
5. ✅ **Monitor** via DO Console metrics
6. ✅ **Backup** automatically handled by DO

**Your database is production-ready!** Just update the secret with your actual DO connection string and deploy! 🚀
