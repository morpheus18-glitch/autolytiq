#!/bin/bash
#
# AutolytiQ Pre-Flight Deployment Checks
# Validates your environment before deployment
#
# Usage: ./scripts/preflight-check.sh [local|production]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Helper functions
echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_step() { echo -e "${BLUE}[CHECK]${NC} $1"; }
echo_success() { echo -e "${GREEN}${BOLD}✓${NC} $1"; }
echo_fail() { echo -e "${RED}${BOLD}✗${NC} $1"; }

# Deployment type
DEPLOYMENT_TYPE=${1:-local}
ERRORS=0
WARNINGS=0

# Banner
echo -e "${BOLD}${BLUE}"
cat << "EOF"
   _         _        _       _   _        
  /_\  _   _| |_ ___ | |_   _| |_(_) __ _ 
 //_\\| | | | __/ _ \| | | | | __| |/ _` |
/  _  \ |_| | || (_) | | |_| | |_| | (_| |
\_/ \_/\__,_|\__\___/|_|\__, |\__|_|\__, |
                        |___/          |_| 
         Pre-Flight Deployment Checks
EOF
echo -e "${NC}"
echo ""
echo_info "Checking environment for ${BOLD}${DEPLOYMENT_TYPE}${NC} deployment..."
echo ""

# Check: Git repository
echo_step "Git repository..."
if [ -d ".git" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    echo_success "Repository: branch=$BRANCH commit=$COMMIT"
else
    echo_warn "Not a git repository"
    WARNINGS=$((WARNINGS + 1))
fi

# Check: Uncommitted changes
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo_success "No uncommitted changes"
else
    echo_warn "You have uncommitted changes - consider committing before deployment"
    WARNINGS=$((WARNINGS + 1))
fi

# Check: Docker (for local deployment)
if [ "$DEPLOYMENT_TYPE" = "local" ]; then
    echo ""
    echo_step "Docker environment..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
        echo_success "Docker installed: $DOCKER_VERSION"
        
        if docker info &> /dev/null; then
            echo_success "Docker daemon is running"
        else
            echo_fail "Docker daemon is not running"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo_fail "Docker is not installed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short)
        echo_success "Docker Compose installed: $COMPOSE_VERSION"
    else
        echo_fail "Docker Compose is not installed"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check: Kubernetes (for production deployment)
if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    echo ""
    echo_step "Kubernetes environment..."
    
    if command -v kubectl &> /dev/null; then
        KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null | head -1)
        echo_success "kubectl installed: $KUBECTL_VERSION"
        
        if kubectl cluster-info &> /dev/null; then
            CONTEXT=$(kubectl config current-context)
            echo_success "Connected to cluster: $CONTEXT"
        else
            echo_fail "Cannot connect to Kubernetes cluster"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo_fail "kubectl is not installed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if command -v helm &> /dev/null; then
        HELM_VERSION=$(helm version --short)
        echo_success "helm installed: $HELM_VERSION"
    else
        echo_fail "helm is not installed"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check: Node.js and pnpm
echo ""
echo_step "Node.js environment..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ $NODE_VERSION == v20* ]]; then
        echo_success "Node.js installed: $NODE_VERSION"
    else
        echo_warn "Node.js version $NODE_VERSION (expected v20.x)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo_warn "Node.js not installed (required for development)"
    WARNINGS=$((WARNINGS + 1))
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo_success "pnpm installed: $PNPM_VERSION"
else
    echo_warn "pnpm not installed (required for development)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check: Environment files
echo ""
echo_step "Environment configuration..."

if [ -f ".env" ]; then
    echo_success ".env file exists"
    
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env; then
            MISSING_VARS+=($var)
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo_warn "Missing required variables: ${MISSING_VARS[*]}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo_success "Required environment variables present"
    fi
    
    # Check for weak passwords
    if grep -q "PASSWORD.*=.*password" .env 2>/dev/null || \
       grep -q "SECRET.*=.*secret" .env 2>/dev/null; then
        echo_warn "Found weak passwords/secrets in .env"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo_fail ".env file not found"
    echo "      Create from template: cp .env.example .env"
    ERRORS=$((ERRORS + 1))
fi

# Check: Dependencies
echo ""
echo_step "Dependencies..."

if [ -f "pnpm-lock.yaml" ]; then
    echo_success "pnpm-lock.yaml exists"
else
    echo_fail "pnpm-lock.yaml not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "package.json" ]; then
    echo_success "package.json exists"
else
    echo_fail "package.json not found"
    ERRORS=$((ERRORS + 1))
fi

# Check: Build artifacts (if expecting deployment)
if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    echo ""
    echo_step "Build artifacts..."
    
    REQUIRED_BUILDS=(
        "apps/backend/dist/index.js"
        "apps/frontend/dist/index.html"
    )
    
    MISSING_BUILDS=()
    for file in "${REQUIRED_BUILDS[@]}"; do
        if [ ! -f "$file" ]; then
            MISSING_BUILDS+=($file)
        fi
    done
    
    if [ ${#MISSING_BUILDS[@]} -gt 0 ]; then
        echo_warn "Missing build artifacts: ${MISSING_BUILDS[*]}"
        echo "      Run: pnpm build"
        WARNINGS=$((WARNINGS + 1))
    else
        echo_success "Build artifacts present"
    fi
fi

# Check: Dockerfiles
echo ""
echo_step "Docker configuration..."

DOCKERFILES=(
    "infrastructure/docker/Dockerfile.backend"
    "infrastructure/docker/Dockerfile.frontend"
)

MISSING_DOCKERFILES=()
for dockerfile in "${DOCKERFILES[@]}"; do
    if [ ! -f "$dockerfile" ]; then
        MISSING_DOCKERFILES+=($dockerfile)
    fi
done

if [ ${#MISSING_DOCKERFILES[@]} -gt 0 ]; then
    echo_fail "Missing Dockerfiles: ${MISSING_DOCKERFILES[*]}"
    ERRORS=$((ERRORS + 1))
else
    echo_success "Dockerfiles present"
fi

if [ -f "docker-compose.yml" ]; then
    echo_success "docker-compose.yml exists"
    
    if command -v docker &> /dev/null && docker compose config > /dev/null 2>&1; then
        echo_success "docker-compose.yml is valid"
    fi
else
    echo_fail "docker-compose.yml not found"
    ERRORS=$((ERRORS + 1))
fi

# Check: Prisma schema
echo ""
echo_step "Database configuration..."

if [ -f "packages/db/schema.prisma" ]; then
    echo_success "Prisma schema exists"
    
    if command -v pnpm &> /dev/null; then
        if pnpm --filter @repo/db exec prisma validate --schema schema.prisma > /dev/null 2>&1; then
            echo_success "Prisma schema is valid"
        else
            echo_fail "Prisma schema validation failed"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo_fail "Prisma schema not found"
    ERRORS=$((ERRORS + 1))
fi

# Check: Ports availability (for local deployment)
if [ "$DEPLOYMENT_TYPE" = "local" ]; then
    echo ""
    echo_step "Port availability..."
    
    PORTS=(3000 5000 5432 6379 8000)
    PORT_CONFLICTS=()
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            PORT_CONFLICTS+=($port)
        fi
    done
    
    if [ ${#PORT_CONFLICTS[@]} -gt 0 ]; then
        echo_warn "Ports in use: ${PORT_CONFLICTS[*]}"
        echo "      These ports may conflict with deployment"
        WARNINGS=$((WARNINGS + 1))
    else
        echo_success "All required ports are available"
    fi
fi

# Summary
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Pre-Flight Check Summary${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready for deployment."
    echo ""
    if [ "$DEPLOYMENT_TYPE" = "local" ]; then
        echo "Next steps:"
        echo "  ./scripts/quick-deploy.sh"
    else
        echo "Next steps:"
        echo "  ./scripts/deploy-production.sh"
    fi
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠ ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "You can proceed with deployment, but review the warnings above."
    exit 0
else
    echo -e "${RED}${BOLD}✗ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    echo ""
    echo "For help, see:"
    echo "  - DEPLOYMENT_GUIDE.md"
    echo "  - docs/TROUBLESHOOTING.md"
    exit 1
fi
