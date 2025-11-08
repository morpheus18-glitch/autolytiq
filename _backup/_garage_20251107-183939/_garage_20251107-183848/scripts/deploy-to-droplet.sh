#!/bin/bash
#
# AutolytiQ - Deploy to Digital Ocean Droplet
# Deploys the application to an already configured droplet
#
# Usage: ./scripts/deploy-to-droplet.sh <droplet-ip> [branch]
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check arguments
if [ $# -lt 1 ]; then
    echo_error "Usage: $0 <droplet-ip> [branch]"
    echo "Example: $0 165.227.123.45 main"
    exit 1
fi

DROPLET_IP="$1"
BRANCH="${2:-main}"
DEPLOY_USER="ubuntu"  # or 'root' depending on your setup

echo_info "=== AutolytiQ Deployment ==="
echo_info "Droplet: $DROPLET_IP"
echo_info "Branch: $BRANCH"
echo ""

# Test SSH connection
echo_step "Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${DEPLOY_USER}@${DROPLET_IP} exit 2>/dev/null; then
    echo_error "Cannot connect to droplet via SSH"
    echo "Make sure:"
    echo "  1. SSH keys are configured"
    echo "  2. Droplet IP is correct"
    echo "  3. User '${DEPLOY_USER}' exists"
    exit 1
fi
echo_info "SSH connection successful"

# Deploy function
deploy() {
    ssh ${DEPLOY_USER}@${DROPLET_IP} bash <<EOF
set -euo pipefail

echo "Deploying to droplet..."
cd /opt/autolytiq

# Stash any local changes
if [ -d .git ]; then
    git stash || true
fi

# Pull latest code
echo "Pulling latest code from $BRANCH..."
if [ -d .git ]; then
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "Git repository not found. Cloning..."
    git clone -b $BRANCH https://github.com/YOUR_USERNAME/autolytiq.git .
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "Generating Prisma client..."
pnpm db:generate

# Run database migrations
echo "Running database migrations..."
pnpm db:migrate:deploy

# Build application
echo "Building application..."
pnpm build:prod

# Restart service
echo "Restarting service..."
sudo systemctl restart autolytiq

# Wait for service to start
echo "Waiting for service to start..."
sleep 5

# Check service status
if sudo systemctl is-active --quiet autolytiq; then
    echo "✓ Service started successfully"
else
    echo "✗ Service failed to start"
    sudo journalctl -u autolytiq -n 50
    exit 1
fi

# Health check
echo "Performing health check..."
for i in {1..30}; do
    if curl -s -f http://localhost:5000/api/health > /dev/null; then
        echo "✓ Health check passed"
        exit 0
    fi
    echo "Waiting for application... (\$i/30)"
    sleep 2
done

echo "✗ Health check failed"
sudo journalctl -u autolytiq -n 50
exit 1
EOF
}

# Run deployment
echo_step "Starting deployment..."
if deploy; then
    echo ""
    echo_info "=== Deployment Complete! ==="
    echo ""
    echo_info "Application is running at:"
    echo "  http://$DROPLET_IP"
    echo ""
    echo_info "To view logs:"
    echo "  ssh ${DEPLOY_USER}@${DROPLET_IP} 'sudo journalctl -u autolytiq -f'"
    echo ""
    echo_info "To check status:"
    echo "  ssh ${DEPLOY_USER}@${DROPLET_IP} 'sudo systemctl status autolytiq'"
    echo ""
else
    echo ""
    echo_error "Deployment failed!"
    echo ""
    echo "To troubleshoot:"
    echo "  1. Check logs: ssh ${DEPLOY_USER}@${DROPLET_IP} 'sudo journalctl -u autolytiq -n 100'"
    echo "  2. Check service: ssh ${DEPLOY_USER}@${DROPLET_IP} 'sudo systemctl status autolytiq'"
    echo "  3. Test manually: ssh ${DEPLOY_USER}@${DROPLET_IP} 'cd /opt/autolytiq && pnpm start:prod'"
    exit 1
fi
