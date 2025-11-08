#!/bin/bash
#
# AutolytiQ Production Deployment Script
# Interactive deployment to Kubernetes (DigitalOcean or any cluster)
#
# Usage: ./scripts/deploy-production.sh
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
      Production Deployment to Kubernetes
EOF
echo -e "${NC}"
echo ""

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Check prerequisites
echo_step "Checking prerequisites..."
echo ""

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo_fail "kubectl is not installed"
    echo "  Install from: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi
echo_success "kubectl installed: $(kubectl version --client --short 2>/dev/null | head -1)"

# Check helm
if ! command -v helm &> /dev/null; then
    echo_fail "helm is not installed"
    echo "  Install from: https://helm.sh/docs/intro/install/"
    exit 1
fi
echo_success "helm installed: $(helm version --short)"

# Check kubectl context
if ! kubectl cluster-info &> /dev/null; then
    echo_fail "kubectl cannot connect to a cluster"
    echo "  Please configure kubectl with a valid context"
    exit 1
fi
CURRENT_CONTEXT=$(kubectl config current-context)
echo_success "Connected to cluster: $CURRENT_CONTEXT"

# Confirm cluster
echo ""
echo_warn "You are about to deploy to: ${BOLD}$CURRENT_CONTEXT${NC}"
echo ""
read -p "Is this the correct cluster? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo_info "Deployment cancelled"
    echo "  Switch context with: kubectl config use-context <context-name>"
    exit 0
fi

# Get deployment parameters
echo ""
echo_step "Deployment configuration..."
echo ""

# Namespace
read -p "Enter namespace (default: production): " NAMESPACE
NAMESPACE=${NAMESPACE:-production}
echo_info "Using namespace: $NAMESPACE"

# Image tag
read -p "Enter image tag (default: latest): " TAG
TAG=${TAG:-latest}
echo_info "Using image tag: $TAG"

# Release prefix (optional)
read -p "Enter release prefix (optional, press enter to skip): " RELEASE_PREFIX
if [ -n "$RELEASE_PREFIX" ]; then
    echo_info "Using release prefix: $RELEASE_PREFIX"
fi

# Docker registry
read -p "Enter Docker registry (e.g., registry.digitalocean.com/autolytiq): " REGISTRY
if [ -z "$REGISTRY" ]; then
    echo_warn "No registry specified, using default image names"
else
    echo_info "Using registry: $REGISTRY"
fi

# Final confirmation
echo ""
echo_step "Deployment Summary"
echo ""
echo "  Cluster:    $CURRENT_CONTEXT"
echo "  Namespace:  $NAMESPACE"
echo "  Image Tag:  $TAG"
echo "  Registry:   ${REGISTRY:-<default>}"
echo ""
read -p "Proceed with deployment? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo_info "Deployment cancelled"
    exit 0
fi

# Create namespace if it doesn't exist
echo ""
echo_step "Setting up namespace..."
if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo_success "Namespace '$NAMESPACE' already exists"
else
    kubectl create namespace "$NAMESPACE"
    echo_success "Created namespace '$NAMESPACE'"
fi

# Deploy services
echo ""
echo_step "Deploying services with Helm..."
echo ""

# Function to deploy helm chart
deploy_helm() {
    local name=$1
    local chart_path=$2
    local extra_args=${3:-}
    
    echo_info "Deploying $name..."
    
    if [ -n "$REGISTRY" ]; then
        extra_args="$extra_args --set image.repository=${REGISTRY}/${name}"
    fi
    
    if helm upgrade --install "${RELEASE_PREFIX}${name}" \
        "$chart_path" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --set image.tag="$TAG" \
        $extra_args \
        --wait \
        --timeout 5m; then
        echo_success "$name deployed successfully"
    else
        echo_fail "Failed to deploy $name"
        exit 1
    fi
}

# Deploy each service
deploy_helm "backend" "${ROOT_DIR}/infrastructure/k8s/production/helm/backend"
deploy_helm "frontend" "${ROOT_DIR}/infrastructure/k8s/production/helm/frontend"
deploy_helm "worker" "${ROOT_DIR}/infrastructure/k8s/production/helm/worker"

# Optional: Deploy pricing-rust if chart exists
if [ -d "${ROOT_DIR}/infrastructure/k8s/production/helm/pricing-rust" ]; then
    deploy_helm "pricing-rust" "${ROOT_DIR}/infrastructure/k8s/production/helm/pricing-rust"
fi

# Check deployment status
echo ""
echo_step "Verifying deployment..."
echo ""

# Wait for pods to be ready
kubectl wait --for=condition=ready pod \
    --selector=app.kubernetes.io/name \
    --namespace="$NAMESPACE" \
    --timeout=300s 2>/dev/null || echo_warn "Some pods may still be starting"

# Show deployment status
kubectl get pods -n "$NAMESPACE"

# Run smoke tests if available
echo ""
if [ -f "${ROOT_DIR}/scripts/smoke.sh" ]; then
    echo_step "Running smoke tests..."
    if "${ROOT_DIR}/scripts/smoke.sh"; then
        echo_success "Smoke tests passed"
    else
        echo_warn "Smoke tests failed - please check the deployment"
    fi
fi

# Success message
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  🎉 Deployment Complete! 🎉${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}Deployment Details:${NC}"
echo ""
echo "  Cluster:    $CURRENT_CONTEXT"
echo "  Namespace:  $NAMESPACE"
echo "  Tag:        $TAG"
echo ""
echo -e "${BOLD}Useful Commands:${NC}"
echo ""
echo "  View pods:              kubectl get pods -n $NAMESPACE"
echo "  View services:          kubectl get svc -n $NAMESPACE"
echo "  View logs (backend):    kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  Describe pod:           kubectl describe pod <pod-name> -n $NAMESPACE"
echo "  Port forward backend:   kubectl port-forward svc/backend 5000:5000 -n $NAMESPACE"
echo ""
echo -e "For more information, see: ${BLUE}DEPLOYMENT_GUIDE.md${NC}"
echo ""

