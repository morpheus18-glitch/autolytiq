#!/bin/bash
#
# AutolytiQ - Digital Ocean Droplet Setup Script
# Automated deployment to Ubuntu 24.04 LTS droplet
#
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/autolytiq/main/scripts/setup-droplet.sh | bash
# Or: ./scripts/setup-droplet.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo_error "Please run as root (use sudo)"
   exit 1
fi

echo_info "=== AutolytiQ Digital Ocean Droplet Setup ==="
echo ""

# Update system
echo_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install essentials
echo_info "Installing essential packages..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Node.js 22.x
echo_info "Installing Node.js 22.x..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Install pnpm
echo_info "Installing pnpm..."
npm install -g pnpm@10.18.3

# Install Docker (optional, for docker deployment)
echo_info "Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
echo_info "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install PostgreSQL 16
echo_info "Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update -qq
apt-get install -y postgresql-16 postgresql-contrib-16

# Install Redis
echo_info "Installing Redis..."
apt-get install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Configure PostgreSQL
echo_info "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE autolytiq;" || echo_warn "Database already exists"
sudo -u postgres psql -c "CREATE USER autolytiq WITH PASSWORD 'CHANGE_THIS_PASSWORD';" || echo_warn "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autolytiq TO autolytiq;"
sudo -u postgres psql -d autolytiq -c "GRANT ALL ON SCHEMA public TO autolytiq;"

# Create application directory
echo_info "Creating application directory..."
mkdir -p /opt/autolytiq
chown -R $SUDO_USER:$SUDO_USER /opt/autolytiq || chown -R ubuntu:ubuntu /opt/autolytiq

# Configure firewall
echo_info "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https
ufw status

# Create systemd service
echo_info "Creating systemd service..."
cat > /etc/systemd/system/autolytiq.service <<'EOF'
[Unit]
Description=AutolytiQ CRM Application
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/autolytiq
Environment="NODE_ENV=production"
Environment="PORT=5000"
EnvironmentFile=/opt/autolytiq/.env
ExecStart=/usr/bin/pnpm start:prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/autolytiq <<'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/autolytiq /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo_info "=== Setup Complete! ==="
echo ""
echo_info "Next steps:"
echo "1. Clone your repository:"
echo "   cd /opt/autolytiq"
echo "   git clone https://github.com/YOUR_USERNAME/autolytiq.git ."
echo ""
echo "2. Install dependencies:"
echo "   pnpm install"
echo ""
echo "3. Create .env file with your configuration:"
echo "   nano .env"
echo ""
echo "4. Generate Prisma client and run migrations:"
echo "   pnpm db:generate"
echo "   pnpm db:migrate:deploy"
echo ""
echo "5. Build the application:"
echo "   pnpm build:prod"
echo ""
echo "6. Start the service:"
echo "   sudo systemctl enable autolytiq"
echo "   sudo systemctl start autolytiq"
echo ""
echo "7. Check status:"
echo "   sudo systemctl status autolytiq"
echo "   sudo journalctl -u autolytiq -f"
echo ""
echo "8. (Optional) Setup SSL with Let's Encrypt:"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo_warn "IMPORTANT: Change the PostgreSQL password!"
echo "   sudo -u postgres psql"
echo "   ALTER USER autolytiq WITH PASSWORD 'your-secure-password';"
echo ""
echo_info "Your droplet is ready for deployment!"
