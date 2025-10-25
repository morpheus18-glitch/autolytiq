# AutolytiQ Deployment Scripts

Automation scripts for deploying AutolytiQ to Digital Ocean.

## 📁 Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-droplet.sh` | Initial droplet setup | Run once on new droplet |
| `deploy-to-droplet.sh` | Deploy/update application | Run for each deployment |
| `cleanup-for-migration.sh` | Remove unnecessary files | Run before first deployment |

---

## 🚀 Quick Start

### First-Time Setup

```bash
# 1. Create a Digital Ocean droplet (Ubuntu 24.04, 2GB RAM)

# 2. SSH into droplet
ssh root@YOUR_DROPLET_IP

# 3. Run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh | bash

# 4. Clone repository
cd /opt/autolytiq
git clone https://github.com/YOUR_USERNAME/autolytiq.git .

# 5. Configure environment
cp .env.digitalocean.example .env
nano .env  # Fill in your values

# 6. Deploy application
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm build:prod
sudo systemctl enable autolytiq
sudo systemctl start autolytiq
```

### Subsequent Deployments

```bash
# From your local machine
./scripts/deploy-to-droplet.sh YOUR_DROPLET_IP main
```

---

## 📝 Detailed Documentation

### `setup-droplet.sh`

**Purpose**: Prepares a fresh Ubuntu droplet with all required dependencies.

**What it installs**:
- Node.js 22.x
- pnpm 10.18.3
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- Nginx
- Certbot (for SSL)
- Firewall (UFW)

**What it configures**:
- PostgreSQL database and user
- Nginx reverse proxy
- Systemd service for AutolytiQ
- Firewall rules (SSH, HTTP, HTTPS)

**Usage**:
```bash
# Option 1: Direct execution (review first!)
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh | bash

# Option 2: Download and review
wget https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh
chmod +x setup-droplet.sh
./setup-droplet.sh
```

**Prerequisites**:
- Fresh Ubuntu 24.04 LTS droplet
- Root access
- Internet connection

**Time**: ~5-10 minutes

---

### `deploy-to-droplet.sh`

**Purpose**: Automates application deployment and updates.

**What it does**:
1. Connects to droplet via SSH
2. Pulls latest code from Git
3. Installs/updates dependencies
4. Generates Prisma client
5. Runs database migrations
6. Builds application
7. Restarts service
8. Performs health check

**Usage**:
```bash
./scripts/deploy-to-droplet.sh DROPLET_IP [BRANCH]

# Examples:
./scripts/deploy-to-droplet.sh 165.227.123.45
./scripts/deploy-to-droplet.sh 165.227.123.45 main
./scripts/deploy-to-droplet.sh 165.227.123.45 develop
```

**Prerequisites**:
- Droplet already configured with `setup-droplet.sh`
- SSH key authentication configured
- Application already cloned to `/opt/autolytiq`

**Time**: ~2-5 minutes

**Exit codes**:
- `0`: Deployment successful
- `1`: Deployment failed (check logs)

---

### `cleanup-for-migration.sh`

**Purpose**: Removes Replit-specific files and consolidates documentation.

**What it removes**:
- Replit configuration files (`.replit`, `replit.nix`)
- Redundant documentation
- Old Docker files
- Temporary files (`.log`, `.tmp`, `.DS_Store`)
- Backup files (`.backup`, `.bak`, `.old`)

**What it preserves**:
- Git history
- Source code
- Configuration templates
- Design assets (excluded via .dockerignore)

**Usage**:
```bash
# Dry run (see what would be removed)
./scripts/cleanup-for-migration.sh --dry-run

# Actual cleanup
./scripts/cleanup-for-migration.sh
```

**When to use**:
- Before first deployment to Digital Ocean
- To remove development artifacts
- Before committing major changes

**Time**: < 1 minute

---

## 🔧 Configuration

### SSH Key Setup

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to droplet
ssh-copy-id root@YOUR_DROPLET_IP

# Test connection
ssh root@YOUR_DROPLET_IP
```

### Environment Variables

Copy `.env.digitalocean.example` to `.env` and fill in:

**Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random 32+ character string
- `JWT_SECRET`: Random 64+ character string
- `CREDIT_ENCRYPTION_KEY`: 64-character hex string

**Optional but Recommended**:
- `REDIS_URL`: For background jobs
- `SENDGRID_API_KEY`: For emails
- `TWILIO_*`: For SMS
- `AWS_*` / `S3_*`: For file storage

**Generate secrets**:
```bash
# SESSION_SECRET
openssl rand -base64 32

# JWT_SECRET
openssl rand -base64 64

# CREDIT_ENCRYPTION_KEY
openssl rand -hex 32
```

### Customization

**Deploy user**: Change `DEPLOY_USER` in `deploy-to-droplet.sh`:
```bash
DEPLOY_USER="ubuntu"  # or "root"
```

**Repository URL**: Update in both scripts:
```bash
git clone https://github.com/YOUR_USERNAME/autolytiq.git
```

---

## 🐛 Troubleshooting

### SSH Connection Failed

```bash
# Check if SSH is running
ssh -v root@YOUR_DROPLET_IP

# Check firewall
ssh root@YOUR_DROPLET_IP 'sudo ufw status'

# Allow SSH if blocked
ssh root@YOUR_DROPLET_IP 'sudo ufw allow ssh'
```

### Deployment Failed

```bash
# Check application logs
ssh root@YOUR_DROPLET_IP 'sudo journalctl -u autolytiq -n 100'

# Check service status
ssh root@YOUR_DROPLET_IP 'sudo systemctl status autolytiq'

# Test manually
ssh root@YOUR_DROPLET_IP 'cd /opt/autolytiq && pnpm start:prod'
```

### Health Check Failed

```bash
# Check if app is running
ssh root@YOUR_DROPLET_IP 'curl http://localhost:5000/api/health'

# Check database connection
ssh root@YOUR_DROPLET_IP 'sudo -u postgres psql autolytiq -c "SELECT 1"'

# Check environment
ssh root@YOUR_DROPLET_IP 'cat /opt/autolytiq/.env | grep DATABASE_URL'
```

### Permission Errors

```bash
# Fix ownership
ssh root@YOUR_DROPLET_IP 'sudo chown -R ubuntu:ubuntu /opt/autolytiq'

# Fix permissions
ssh root@YOUR_DROPLET_IP 'chmod -R 755 /opt/autolytiq'
```

---

## 🔄 CI/CD Integration

### GitHub Actions

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
      - name: Checkout
        uses: actions/checkout@v3

      - name: Deploy to Droplet
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          DROPLET_IP: ${{ secrets.DROPLET_IP }}
        run: |
          echo "$SSH_PRIVATE_KEY" > private_key
          chmod 600 private_key
          ssh -i private_key -o StrictHostKeyChecking=no ubuntu@$DROPLET_IP '
            cd /opt/autolytiq &&
            git pull origin main &&
            pnpm install &&
            pnpm db:generate &&
            pnpm db:migrate:deploy &&
            pnpm build:prod &&
            sudo systemctl restart autolytiq
          '
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan $DROPLET_IP >> ~/.ssh/known_hosts
    - ./scripts/deploy-to-droplet.sh $DROPLET_IP main
```

---

## 📚 Additional Resources

- **Main Migration Guide**: `../DIGITAL_OCEAN_MIGRATION.md`
- **Deployment Docs**: `../docs/DEPLOYMENT.md`
- **Docker Setup**: `../Dockerfile`, `../docker-compose.yml`
- **Environment Template**: `../.env.digitalocean.example`

---

## ✅ Pre-Flight Checklist

Before running any script:

- [ ] Droplet created and accessible
- [ ] SSH access configured
- [ ] Domain name configured (optional)
- [ ] Environment variables prepared
- [ ] Database backup created (if migrating data)
- [ ] Scripts downloaded and reviewed
- [ ] Repository URL updated in scripts
- [ ] Team notified of deployment

---

## 📞 Support

**Issues**: https://github.com/YOUR_USERNAME/autolytiq/issues

**Questions**: Check the migration guide or deployment documentation first.

---

**Last Updated**: 2025-10-25
