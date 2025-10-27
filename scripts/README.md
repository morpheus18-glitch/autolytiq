# AutolytiQ Deployment Scripts

Automation scripts that support infrastructure tasks for AutolytiQ.

## 📁 Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-droplet.sh` | Provision a legacy all-in-one droplet (Ubuntu 24.04) | Run once when creating a VM |
| `deploy-to-droplet.sh` | Deploy or update the droplet stack | Run on demand from your workstation |

> **Note**
> DigitalOcean Kubernetes is the primary production target. The droplet scripts remain available for
> disaster recovery or lightweight demo environments but are no longer maintained as the main path.

---

## 🚀 Quick Start (Droplet Legacy Path)

```bash
# 1. Create a DigitalOcean droplet (Ubuntu 24.04, 2GB RAM)

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

For the Kubernetes workflow, follow `docs/DEPLOYMENT.md` and `DIGITAL_OCEAN_MIGRATION.md`.

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

**Purpose**: Automates application deployment and updates on the droplet stack.

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
