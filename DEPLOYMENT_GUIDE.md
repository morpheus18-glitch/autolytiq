# 🚀 AutolytiQ Deployment Guide

**The definitive guide to deploying AutolytiQ** - from zero to production in minutes.

> **Confused about deployment?** Start here. This guide consolidates all deployment methods and provides clear, tested paths to get your app running.

---

## 📋 Quick Decision Tree

**Choose your deployment method:**

1. **I want to try it locally right now** → [Quick Start (Docker Compose)](#quick-start-docker-compose)
2. **I want to deploy to production** → [Production Deployment](#production-deployment)
3. **I'm having issues** → [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Docker Compose)

**Get AutolytiQ running locally in under 5 minutes.**

### Prerequisites
- Docker 24+ installed ([Get Docker](https://docs.docker.com/get-docker/))
- Git installed

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# 2. Run the one-command deployment
./scripts/quick-deploy.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Set up environment variables
- ✅ Build and start all services
- ✅ Run database migrations
- ✅ Verify health checks
- ✅ Show you the application URL

**Expected result:**
```
✓ All services healthy
✓ Application ready

🎉 AutolytiQ is running!

Frontend: http://localhost:3000
Backend:  http://localhost:5000
ML API:   http://localhost:8000
```

### Manual Docker Compose (if you prefer)

```bash
# 1. Clone and navigate
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# 2. Copy environment file
cp .env.selfhost.example .env

# 3. Start services
docker compose up -d

# 4. Wait for startup (about 30 seconds)
docker compose ps

# 5. Run migrations
docker compose exec backend pnpm db:migrate:deploy

# 6. Check health
curl http://localhost:5000/health
```

**View logs:** `docker compose logs -f`  
**Stop services:** `docker compose down`  
**Reset everything:** `docker compose down -v` (⚠️ destroys data)

---

## 🏭 Production Deployment

### Option 1: DigitalOcean Kubernetes (Recommended)

**Best for:** Production workloads, auto-scaling, managed infrastructure

#### Prerequisites
- DigitalOcean account
- `doctl` CLI installed ([Install guide](https://docs.digitalocean.com/reference/doctl/how-to/install/))
- `kubectl` installed ([Install guide](https://kubernetes.io/docs/tasks/tools/))

#### Automated Deployment

```bash
# 1. Authenticate with DigitalOcean
doctl auth init

# 2. Run the production deployment script
./scripts/deploy-production.sh

# Follow the interactive prompts to:
# - Create or select a Kubernetes cluster
# - Configure environment variables
# - Build and push Docker images
# - Deploy to Kubernetes
```

#### Manual Kubernetes Deployment

See [Kubernetes Deployment Guide](./docs/DEPLOYMENT.md#digitalocean-kubernetes) for detailed steps.

### Option 2: Droplet (Simple VPS)

**Best for:** Small deployments, testing, cost-conscious setups

```bash
# 1. Create a Ubuntu 22.04 droplet on DigitalOcean

# 2. Set up the droplet
./scripts/setup-droplet.sh YOUR_DROPLET_IP

# 3. Deploy the application
./scripts/deploy-to-droplet.sh YOUR_DROPLET_IP main
```

### Option 3: Custom Server / VPS

**Best for:** Self-hosted, on-premises, or custom cloud providers

See [Self-Hosting Guide](#self-hosting-guide) below.

---

## 🛠️ Development Setup

**For developers who want to work on the code.**

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 14+
- Redis 7+

### Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up database
pnpm db:generate
pnpm db:migrate:dev
pnpm db:seed

# 5. Start development servers
pnpm dev
```

This starts:
- Frontend: http://localhost:5173 (with hot reload)
- Backend: http://localhost:5000 (with hot reload)

**Run specific services:**
- Backend only: `pnpm dev:server`
- Frontend only: `pnpm dev:client`

**Run tests:**
```bash
pnpm test              # All tests
pnpm test:e2e         # End-to-end tests
pnpm typecheck        # TypeScript validation
pnpm lint             # Code linting
```

---

## 🔧 Self-Hosting Guide

**Deploy AutolytiQ on any server with Docker.**

### System Requirements

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 20 GB storage
- Ubuntu 22.04 LTS (or similar)

**Recommended:**
- 4 CPU cores
- 8 GB RAM
- 50 GB SSD storage

### Installation Steps

#### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# Set up environment
cp .env.production.example .env

# Generate secure secrets
openssl rand -base64 32  # Use for SESSION_SECRET
openssl rand -base64 64  # Use for JWT_SECRET
openssl rand -hex 32     # Use for CREDIT_ENCRYPTION_KEY

# Edit .env and add the generated secrets
nano .env
```

#### 3. Deploy

```bash
# Build and start services
docker compose -f docker-compose.yml up -d --build

# Wait for services to be healthy
docker compose ps

# Run database migrations
docker compose exec backend pnpm db:migrate:deploy

# Verify deployment
curl http://localhost:5000/health
```

#### 4. Set Up Reverse Proxy (Optional but Recommended)

Using Nginx:

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/autolytiq
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/autolytiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Optional: Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check service status
docker compose ps

# View logs for a specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# View all logs
docker compose logs -f
```

**Common issues:**
- Port conflicts: Check if ports 3000, 5000, 5432, 6379 are available
- Database not ready: Wait 30 seconds after `docker compose up`
- Environment variables: Ensure `.env` file exists and is configured

### Build Failures

```bash
# Run validation script
bash scripts/validate-deployment.sh

# Check specific issues
pnpm typecheck  # TypeScript errors
pnpm lint       # Code quality issues
pnpm build      # Build errors
```

### Database Issues

```bash
# Reset database (⚠️ destroys all data)
docker compose down postgres
docker volume rm autolytiq_postgres_data
docker compose up -d postgres
docker compose exec backend pnpm db:migrate:deploy

# Check database connection
docker compose exec backend node -e "
const { PrismaClient } = require('@prisma/client');
new PrismaClient().\$queryRaw\`SELECT 1\`
  .then(() => console.log('✓ Database connected'))
  .catch(e => console.error('✗ Database error:', e.message));
"
```

### Health Check Failures

```bash
# Test each service
curl http://localhost:5000/health    # Backend
curl http://localhost:3000/health    # Frontend
curl http://localhost:8000/health    # ML Service

# Run automated health check
bash scripts/deployment-health-check.sh
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check for memory limits
docker compose config

# View slow queries (if applicable)
docker compose logs backend | grep "slow"
```

---

## 📊 Deployment Validation

Before considering your deployment successful, verify:

```bash
# Run comprehensive validation
bash scripts/validate-deployment.sh

# Run health checks
bash scripts/deployment-health-check.sh

# Check all endpoints
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/live
curl http://localhost:3000/health
```

**Expected results:**
- ✅ All health checks return 200 OK
- ✅ No errors in logs
- ✅ Frontend loads in browser
- ✅ API responds to requests

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Changed all default passwords
- [ ] Generated strong secrets (SESSION_SECRET, JWT_SECRET, etc.)
- [ ] Configured SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Configured CORS properly
- [ ] Enabled secure headers
- [ ] Set NODE_ENV=production
- [ ] Configured rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configured backup strategy

---

## 📚 Additional Resources

- **Detailed Kubernetes Guide:** [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **Troubleshooting Guide:** [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
- **Architecture Overview:** [`README.md`](./README.md)
- **Development Guide:** [`AGENTS.md`](./AGENTS.md)

---

## 🆘 Still Having Issues?

1. **Check logs:** `docker compose logs -f`
2. **Run validation:** `bash scripts/validate-deployment.sh`
3. **Read troubleshooting guide:** [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
4. **Review recent changes:** `git log --oneline -10`
5. **Check environment:** Ensure `.env` matches `.env.example` structure

**Common solutions:**
- Restart services: `docker compose restart`
- Rebuild from scratch: `docker compose down -v && docker compose up --build`
- Check ports: `sudo lsof -i :5000` (ensure no conflicts)

---

## 📝 Quick Commands Reference

```bash
# Local Development
pnpm install                    # Install dependencies
pnpm dev                        # Start dev servers
pnpm build                      # Build for production
pnpm test                       # Run tests

# Docker Compose
docker compose up -d            # Start services
docker compose down             # Stop services
docker compose logs -f          # View logs
docker compose ps               # Check status
docker compose restart          # Restart all services

# Database
pnpm db:generate               # Generate Prisma client
pnpm db:migrate:dev            # Create migration
pnpm db:migrate:deploy         # Apply migrations
pnpm db:seed                   # Seed database

# Deployment
./scripts/quick-deploy.sh      # Local deployment
./scripts/deploy-production.sh # Production (K8s)
./scripts/deploy-to-droplet.sh # Droplet deployment

# Validation
bash scripts/validate-deployment.sh
bash scripts/deployment-health-check.sh
```

---

**Last Updated:** 2025-10-31  
**Version:** 2.1.0
