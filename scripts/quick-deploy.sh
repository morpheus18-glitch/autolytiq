#!/bin/bash
#
# AutolytiQ Quick Deploy Script
# One-command local deployment using Docker Compose
#
# Usage: ./scripts/quick-deploy.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
echo_success() { echo -e "${GREEN}${BOLD}✓${NC} $1"; }
echo_fail() { echo -e "${RED}${BOLD}✗${NC} $1"; }

# Banner
clear
echo -e "${BOLD}${BLUE}"
cat << "EOF"
   _         _        _       _   _        
  /_\  _   _| |_ ___ | |_   _| |_(_) __ _ 
 //_\\| | | | __/ _ \| | | | | __| |/ _` |
/  _  \ |_| | || (_) | | |_| | |_| | (_| |
\_/ \_/\__,_|\__\___/|_|\__, |\__|_|\__, |
                        |___/          |_| 
    Quick Deploy - Get Running in Minutes
EOF
echo -e "${NC}"
echo ""

# Check if running from repo root
if [ ! -f "docker-compose.yml" ]; then
    echo_error "This script must be run from the repository root"
    echo "Please run: cd /path/to/autolytiq && ./scripts/quick-deploy.sh"
    exit 1
fi

# Step 1: Check prerequisites
echo_step "Checking prerequisites..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo_fail "Docker is not installed"
    echo "  Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo_success "Docker installed: $(docker --version | cut -d' ' -f3 | tr -d ',')"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo_fail "Docker Compose is not installed"
    echo "  Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo_success "Docker Compose installed: $(docker compose version --short)"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo_fail "Docker daemon is not running"
    echo "  Please start Docker and try again"
    exit 1
fi
echo_success "Docker daemon is running"

# Check for port conflicts
echo ""
echo_step "Checking for port conflicts..."
PORTS=(3000 5000 5432 6379 8000 9000)
PORT_CONFLICTS=()

# Function to check if port is in use (with fallbacks)
check_port_in_use() {
    local port=$1
    
    # Try lsof first (most reliable)
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
        return $?
    fi
    
    # Fallback to ss (common on modern Linux)
    if command -v ss &> /dev/null; then
        ss -lnt | grep -q ":$port " 
        return $?
    fi
    
    # Fallback to netstat (older systems)
    if command -v netstat &> /dev/null; then
        netstat -lnt | grep -q ":$port "
        return $?
    fi
    
    # If no tools available, assume port is available
    return 1
}

for port in "${PORTS[@]}"; do
    if check_port_in_use "$port"; then
        PORT_CONFLICTS+=($port)
        echo_warn "Port $port is already in use"
    fi
done

if [ ${#PORT_CONFLICTS[@]} -gt 0 ]; then
    echo ""
    echo_warn "The following ports are in use: ${PORT_CONFLICTS[*]}"
    echo "  You can either:"
    echo "  1. Stop the services using these ports"
    echo "  2. Continue anyway (may cause conflicts)"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo_info "Deployment cancelled"
        exit 0
    fi
else
    echo_success "All required ports are available"
fi

# Step 2: Set up environment
echo ""
echo_step "Setting up environment..."

if [ ! -f ".env" ]; then
    echo_info "Creating .env file from template..."
    if [ -f ".env.selfhost.example" ]; then
        cp .env.selfhost.example .env
        echo_success "Created .env from .env.selfhost.example"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        echo_success "Created .env from .env.example"
    else
        echo_error "No .env template found!"
        exit 1
    fi
else
    echo_success ".env file already exists"
fi

# Step 3: Stop any existing containers
echo ""
echo_step "Cleaning up any existing deployment..."
if docker compose ps --quiet 2>/dev/null | grep -q .; then
    echo_info "Stopping existing containers..."
    docker compose down --remove-orphans 2>/dev/null || true
    echo_success "Cleaned up existing containers"
else
    echo_success "No existing containers to clean up"
fi

# Step 4: Build and start services
echo ""
echo_step "Building and starting services (this may take a few minutes)..."
echo ""

# Pull and build with progress
if docker compose up -d --build 2>&1 | tee /tmp/docker-deploy.log; then
    echo ""
    echo_success "Services started successfully"
else
    echo ""
    echo_fail "Failed to start services"
    echo "Check the logs above for errors"
    exit 1
fi

# Step 5: Wait for services to be healthy
echo ""
echo_step "Waiting for services to be healthy..."
echo_info "This usually takes 30-60 seconds..."
echo ""

# Function to check if a service is healthy
check_health() {
    local service=$1
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker compose ps --format json "$service" 2>/dev/null | grep -q '"Health":"healthy"'; then
            return 0
        fi
        
        # Also check if service is running (for services without health checks)
        if docker compose ps --format json "$service" 2>/dev/null | grep -q '"State":"running"'; then
            if ! docker compose ps --format json "$service" 2>/dev/null | grep -q '"Health"'; then
                # No health check defined, consider it healthy if running
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        sleep 2
        printf "."
    done
    
    return 1
}

# Wait for critical services
SERVICES=("postgres" "redis" "backend")
for service in "${SERVICES[@]}"; do
    printf "  Waiting for $service"
    if check_health "$service"; then
        echo ""
        echo_success "$service is healthy"
    else
        echo ""
        echo_fail "$service failed to become healthy"
        echo ""
        echo "Logs for $service:"
        docker compose logs --tail=50 "$service"
        echo ""
        echo_error "Deployment failed - service $service is not healthy"
        exit 1
    fi
done

# Step 6: Run database migrations
echo ""
echo_step "Running database migrations..."

# Wait a bit more for backend to fully initialize
sleep 5

if docker compose exec -T backend pnpm db:migrate:deploy 2>&1 | tee /tmp/migrate.log; then
    echo_success "Database migrations completed"
else
    echo_warn "Database migrations had warnings (this might be ok if database is already set up)"
fi

# Step 7: Health checks
echo ""
echo_step "Performing health checks..."
sleep 3

# Check backend health
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo_success "Backend health check passed (http://localhost:5000)"
else
    echo_warn "Backend health check failed (may still be starting)"
fi

# Check frontend
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo_success "Frontend health check passed (http://localhost:3000)"
else
    echo_warn "Frontend health check failed (may still be starting)"
fi

# Step 8: Success!
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  🎉 AutolytiQ is running successfully! 🎉${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}Access your application:${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:5000"
echo -e "  ${BLUE}ML API:${NC}    http://localhost:8000"
echo -e "  ${BLUE}MinIO:${NC}     http://localhost:9001 (admin: minio / minio123)"
echo ""
echo -e "${BOLD}Useful commands:${NC}"
echo ""
echo -e "  ${YELLOW}View logs:${NC}         docker compose logs -f"
echo -e "  ${YELLOW}Stop services:${NC}     docker compose down"
echo -e "  ${YELLOW}Restart:${NC}           docker compose restart"
echo -e "  ${YELLOW}Check status:${NC}      docker compose ps"
echo -e "  ${YELLOW}View specific logs:${NC} docker compose logs -f backend"
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo ""
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Create your first account"
echo "  3. Explore the application!"
echo ""
echo -e "For troubleshooting, see: ${BLUE}DEPLOYMENT_GUIDE.md${NC}"
echo ""

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    read -p "Open http://localhost:3000 in browser? (Y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        xdg-open http://localhost:3000 &> /dev/null || true
    fi
elif command -v open &> /dev/null; then
    read -p "Open http://localhost:3000 in browser? (Y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        open http://localhost:3000 &> /dev/null || true
    fi
fi

exit 0
