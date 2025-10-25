# AutolytiQ Deployment Guide

Complete deployment guide for AutolytiQ CRM platform.

## Table of Contents
- [Quick Start](#quick-start)
- [Digital Ocean Deployment](#digital-ocean-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Production Checklist](#production-checklist)

---

## Quick Start

### Prerequisites
- Node.js 22+ (currently v22.20.0)
- PostgreSQL 16+
- Redis 6+ (optional, for background jobs)
- pnpm 10+

### Development Setup
```bash
# Clone repository
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate:dev

# Start development server
pnpm dev:replit  # Starts all services on port 80
```

---

## Digital Ocean Deployment

See `scripts/deploy-digital-ocean.sh` for automated deployment.

### Option A: App Platform (PaaS)

**Cost:** ~$12/mo per app + $15/mo per managed database

1. **Fork/Import Repository**
   - Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App" → "GitHub"
   - Select `autolytiq` repository
   - Choose branch: `main`

2. **Configure Build Settings**
   ```yaml
   name: autolytiq
   services:
   - name: web
     build_command: pnpm build:prod
     run_command: pnpm start:prod
     environment_slug: node-js
     instance_size_slug: basic-xxs
     http_port: 5000
   ```

3. **Add Environment Variables** (see [Environment Variables](#environment-variables))

4. **Deploy**
   - Click "Create Resources"
   - Deployment takes ~5 minutes

### Option B: Droplet (IaaS) - Recommended

**Cost:** $12/mo for 2GB RAM droplet (all-in-one)

**Automated Setup:**
```bash
# From your local machine
./scripts/setup-digital-ocean-droplet.sh YOUR_DROPLET_IP
```

**Manual Setup:**

1. **Create Droplet**
   ```bash
   # Ubuntu 24.04 LTS
   # 2GB RAM / 1 vCPU / 50GB SSD
   # $12/mo
   ```

2. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Run Setup Script**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/morpheus18-glitch/autolytiq/main/scripts/setup-droplet.sh | bash
   ```

4. **Configure Application**
   ```bash
   cd /opt/autolytiq
   nano .env  # Add your environment variables
   sudo systemctl restart autolytiq
   ```

5. **Setup SSL (Optional but Recommended)**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Variables

### Essential Variables

```bash
# Application
NODE_ENV=production
PORT=5000
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/autolytiq?schema=public
DIRECT_URL=postgresql://user:password@host:5432/autolytiq?schema=public

# Security
SESSION_SECRET=<GENERATE_MINIMUM_32_CHARACTERS>
JWT_SECRET=<GENERATE_STRONG_SECRET>
CREDIT_ENCRYPTION_KEY=<GENERATE_32_BYTE_HEX_STRING>
```

### Optional Variables

```bash
# Redis (Background Jobs)
REDIS_URL=redis://default:password@host:6379

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Storage (S3 or Compatible)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET=autolytiq-documents
S3_REGION=us-east-1

# AI (OpenAI)
OPENAI_API_KEY=sk-xxx

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Generate Secrets
```bash
# SESSION_SECRET (32+ characters)
openssl rand -base64 32

# JWT_SECRET
openssl rand -base64 64

# CREDIT_ENCRYPTION_KEY (32 bytes hex)
openssl rand -hex 32
```

---

## Database Setup

### Option 1: Self-Hosted (on Droplet)
```bash
# Included in droplet setup script
sudo systemctl status postgresql
```

### Option 2: Managed PostgreSQL
- Digital Ocean Managed Databases: $15/mo
- Neon: Free tier available
- Supabase: Free tier available

### Run Migrations
```bash
# Development
pnpm db:migrate:dev

# Production
pnpm db:migrate:deploy

# View database
pnpm db:studio
```

### Seed Database
```bash
pnpm db:seed
```

---

## Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate obtained (if using custom domain)
- [ ] Secrets rotated from development
- [ ] Build succeeds: `pnpm build:prod`
- [ ] Tests pass: `pnpm test`
- [ ] Security scan clean: `pnpm audit`

### Post-Deployment
- [ ] Health check responds: `curl https://yourdomain.com/api/health`
- [ ] Database connection verified
- [ ] Background jobs running (if Redis configured)
- [ ] SSL/TLS valid and enforced
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Error tracking configured (Sentry, etc.)

### Security
- [ ] Strong passwords/secrets (32+ characters)
- [ ] Database connections use SSL
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API keys rotated
- [ ] No secrets in git history
- [ ] Security headers configured (nginx)
- [ ] Regular dependency updates scheduled

---

## Monitoring & Maintenance

### View Logs
```bash
# Droplet (systemd)
sudo journalctl -u autolytiq -f

# App Platform
doctl apps logs YOUR_APP_ID --follow
```

### Database Backups
```bash
# Automated backups (cron)
0 2 * * * /opt/autolytiq/scripts/backup-database.sh
```

### Updates
```bash
# Pull latest code
cd /opt/autolytiq
git pull origin main

# Install dependencies
pnpm install

# Rebuild
pnpm build:prod

# Restart service
sudo systemctl restart autolytiq
```

---

## Troubleshooting

### Build Fails
```bash
# Clear caches
pnpm store prune
rm -rf node_modules
pnpm install

# Regenerate Prisma
pnpm db:generate
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check migrations
pnpm db:migrate:status
```

### Application Won't Start
```bash
# Check logs
sudo journalctl -u autolytiq -n 100

# Verify environment
env | grep DATABASE_URL

# Test manually
cd /opt/autolytiq
NODE_ENV=production pnpm start:prod
```

---

## Performance Optimization

### Node.js
```bash
# PM2 cluster mode (use all CPU cores)
pm2 start dist/index.js -i max
```

### Database
- Enable connection pooling (configured by default)
- Add indexes for frequently queried fields
- Use `EXPLAIN ANALYZE` for slow queries

### Caching
- Configure Redis for session storage
- Enable CDN for static assets
- Use HTTP caching headers

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer / CDN           │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Nginx     │  (SSL termination)
        └──────┬──────┘
               │
        ┌──────▼──────────────────────────┐
        │   Node.js App (Express)          │
        │   - API Routes                   │
        │   - Static File Serving          │
        │   - WebSocket Server             │
        └──────┬────────────┬──────────────┘
               │            │
    ┌──────────▼────┐   ┌──▼───────────────┐
    │  PostgreSQL   │   │   Redis          │
    │  (Primary DB) │   │  (Cache/Jobs)    │
    └───────────────┘   └──────────────────┘
```

---

## Support & Resources

- **Documentation**: `/docs`
- **API Reference**: `/docs/API.md` (if exists)
- **Architecture**: `ARCHITECTURE.md`
- **GitHub Issues**: https://github.com/morpheus18-glitch/autolytiq/issues

---

## Migration from Replit

See `MIGRATION_OPTIONS.md` for detailed comparison and migration guide.

**Quick Migration:**
1. Export environment variables from Replit Secrets
2. Deploy to Digital Ocean using scripts in `/scripts`
3. Update DNS to point to new IP
4. Test thoroughly
5. Decommission Replit deployment

**Data Migration:**
- Database: Use `pg_dump` and `pg_restore`
- Redis: Export keys if needed (or start fresh)
- S3/Files: Copy if using local storage

---

**Last Updated:** 2025-10-25
**Version:** 2.0.0 (Enterprise Edition)
**Deployment Target:** Digital Ocean (Primary), Replit (Legacy Support)
