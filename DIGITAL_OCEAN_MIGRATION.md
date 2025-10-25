# AutolytiQ - Digital Ocean Migration Guide

Complete step-by-step guide for migrating from Replit to Digital Ocean.

## 📋 Pre-Migration Checklist

- [ ] Digital Ocean account created
- [ ] Domain name ready (optional)
- [ ] All Replit environment variables documented
- [ ] Database backup created
- [ ] Git repository up to date
- [ ] Team notified of migration window

---

## 🚀 Migration Methods

Choose ONE of the following methods:

### Method A: Docker Deployment (Recommended for Beginners)
- **Time**: 30 minutes
- **Difficulty**: Easy
- **Cost**: $12/mo (2GB droplet)
- **Features**: Isolated, reproducible, easy rollback

### Method B: Direct Installation (Recommended for Production)
- **Time**: 45 minutes
- **Difficulty**: Medium
- **Cost**: $12/mo (2GB droplet) + $15/mo (managed DB optional)
- **Features**: Better performance, more control

### Method C: App Platform (Easiest)
- **Time**: 15 minutes
- **Difficulty**: Very Easy
- **Cost**: $12/mo (app) + $15/mo (DB)
- **Features**: Fully managed, auto-scaling

---

## Method A: Docker Deployment

### Step 1: Create Droplet

1. **Log in to Digital Ocean**
   - Go to https://cloud.digitalocean.com

2. **Create Droplet**
   ```
   Image: Ubuntu 24.04 LTS x64
   Plan: Basic
   CPU options: Regular
   Size: $12/mo (2 GB / 1 CPU, 50 GB SSD)
   Datacenter: Choose closest to your users
   VPC: Default
   Authentication: SSH Key (recommended) or Password
   Hostname: autolytiq-prod
   ```

3. **Wait for Creation** (2-3 minutes)

### Step 2: Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /opt
git clone https://github.com/YOUR_USERNAME/autolytiq.git
cd autolytiq

# Create .env file
cp .env.digitalocean.example .env
nano .env  # Fill in your values

# Generate secrets
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "CREDIT_ENCRYPTION_KEY=$(openssl rand -hex 32)"

# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f app
```

### Step 4: Setup Nginx & SSL

```bash
# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Configure domain (optional)
certbot --nginx -d yourdomain.com

# For IP-only access, Nginx is already configured via docker-compose
```

### Step 5: Verify Deployment

```bash
# Check health
curl http://localhost:5000/api/health

# Check from outside
curl http://YOUR_DROPLET_IP/api/health

# View logs
docker-compose logs -f app
```

---

## Method B: Direct Installation

### Step 1: Run Automated Setup Script

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh | bash

# Or download and review first:
wget https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh
chmod +x setup-droplet.sh
./setup-droplet.sh
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /opt/autolytiq
git clone https://github.com/YOUR_USERNAME/autolytiq.git .

# Install dependencies
pnpm install

# Create .env
cp .env.digitalocean.example .env
nano .env  # Fill in your values

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate:deploy

# Build application
pnpm build:prod

# Start service
sudo systemctl enable autolytiq
sudo systemctl start autolytiq
sudo systemctl status autolytiq

# The systemd unit executes `pnpm start:prod`, which proxies to
# `apps/server/dist/index.js` inside the workspace. Ensure
# `pnpm build:prod` has been run at least once so the dist output exists.
```

### Step 3: Setup SSL (Optional)

```bash
# If you have a domain
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is already configured
sudo certbot renew --dry-run
```

---

## Method C: App Platform

### Step 1: Create App

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Select your repository and branch
5. Review detected services (should auto-detect Node.js)

### Step 2: Configure Build Settings

```yaml
name: autolytiq
services:
  - name: web
    github:
      repo: YOUR_USERNAME/autolytiq
      branch: main
    build_command: pnpm build:prod
    run_command: pnpm start:prod
    environment_slug: node-js
    instance_size_slug: basic-xxs
    instance_count: 1
    http_port: 5000
    health_check:
      http_path: /api/health
```

### Step 3: Add Environment Variables

Go to Settings → Environment Variables and add all variables from `.env.digitalocean.example`

### Step 4: Deploy

Click "Create Resources" and wait ~5 minutes.

---

## 📊 Database Migration

### Option 1: Keep External Database (Neon/Supabase)

```bash
# No migration needed!
# Just update DATABASE_URL in your .env
```

### Option 2: Migrate to Self-Hosted PostgreSQL

```bash
# On Replit (or wherever your current DB is):
pg_dump $DATABASE_URL > autolytiq_backup.sql

# Transfer to droplet:
scp autolytiq_backup.sql root@YOUR_DROPLET_IP:/tmp/

# On droplet:
sudo -u postgres psql autolytiq < /tmp/autolytiq_backup.sql
rm /tmp/autolytiq_backup.sql
```

### Option 3: Migrate to DO Managed Database

1. Create managed PostgreSQL cluster in DO console
2. Create database `autolytiq`
3. Get connection string from DO console
4. Import data:
   ```bash
   pg_dump $OLD_DATABASE_URL | psql $NEW_DATABASE_URL
   ```

---

## 🔐 Security Checklist

After deployment, verify:

- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH password authentication disabled (key-only)
- [ ] Strong passwords set for all services
- [ ] SSL/TLS certificate installed and auto-renewing
- [ ] Environment variables contain production secrets
- [ ] Database not exposed to internet
- [ ] Regular backups configured
- [ ] Monitoring/alerting configured

---

## ⚡ Performance Optimization

### Enable PM2 for Multiple Processes

```bash
npm install -g pm2

# Start with cluster mode (uses all CPU cores)
pm2 start /opt/autolytiq/apps/server/dist/index.js -i max

# Save configuration
pm2 startup
pm2 save
```

### Configure PostgreSQL

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf

# Recommended settings for 2GB RAM droplet:
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Enable Redis Caching

```bash
# Redis is already installed via setup script
# Just configure in .env:
REDIS_URL=redis://localhost:6379
```

---

## 📈 Monitoring

### View Logs

```bash
# Docker method:
docker-compose logs -f app

# Direct installation:
sudo journalctl -u autolytiq -f

# Nginx logs:
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitor Resources

```bash
# Install htop
apt-get install htop
htop

# Check disk space
df -h

# Check memory
free -h

# Check active connections
ss -tunlp
```

### Setup Uptime Monitoring

- Use DO Monitoring (free with droplet)
- Or external: UptimeRobot, Pingdom, StatusCake

---

## 🔄 Continuous Deployment

### Option 1: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/autolytiq
            git pull origin main
            pnpm install
            pnpm build:prod
            sudo systemctl restart autolytiq
```

### Option 2: Manual Script

```bash
# From your local machine:
./scripts/deploy-to-droplet.sh YOUR_DROPLET_IP main
```

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check logs
sudo journalctl -u autolytiq -n 100

# Check environment
cat /opt/autolytiq/.env | grep DATABASE_URL

# Test manually
cd /opt/autolytiq
NODE_ENV=production pnpm start:prod
```

### Database Connection Fails

```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Prisma Issues

```bash
# Regenerate client
cd /opt/autolytiq
pnpm db:generate

# Check migrations
pnpm db:migrate:status

# Reset if needed (WARNING: destroys data!)
pnpm db:migrate:reset
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
sudo systemctl status autolytiq
curl http://localhost:5000/api/health

# Check Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📞 Support

- **Documentation**: `docs/DEPLOYMENT.md`
- **GitHub Issues**: https://github.com/YOUR_USERNAME/autolytiq/issues
- **Digital Ocean Docs**: https://docs.digitalocean.com

---

## ✅ Post-Migration Checklist

- [ ] Application accessible via IP/domain
- [ ] Health check returns 200 OK
- [ ] Database migrations applied
- [ ] Static files loading correctly
- [ ] WebSocket connections working
- [ ] Email sending works
- [ ] SMS sending works (if configured)
- [ ] File uploads work
- [ ] User authentication works
- [ ] API endpoints tested
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] DNS updated (if using domain)
- [ ] Old Replit deployment decommissioned

---

## 💰 Cost Comparison

| Component | Replit | Digital Ocean |
|-----------|--------|---------------|
| App Hosting | $7/mo | $12/mo (droplet) |
| Database | $0-19/mo (external) | $0 (self-hosted) or $15/mo (managed) |
| Redis | $0-10/mo (external) | $0 (included) |
| SSL | Free | Free (Let's Encrypt) |
| **Total** | **$7-36/mo** | **$12-27/mo** |

**Savings**: $0-9/mo + better performance + no Prisma issues!

---

**Migration Date**: ___________
**Completed By**: ___________
**Verified By**: ___________
