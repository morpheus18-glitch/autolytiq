#!/bin/bash
#
# Autolytiq Deployment Command Center
#
# This VM is command center only - all builds/deployments happen via GitHub Actions → Kubernetes
# Use this script to trigger deployments, check status, and monitor the cluster
#

set -e

NAMESPACE="autolytiq-prod"
CLUSTER="autolytiq-cluster"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Autolytiq Deployment Command Center                   ║${NC}"
echo -e "${BLUE}║     VM Role: Command & Control Only                       ║${NC}"
echo -e "${BLUE}║     Deployments: GitHub Actions → K8s Cluster             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if kubectl is configured
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}✗ kubectl not found. Install with: snap install kubectl --classic${NC}"
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${YELLOW}⚠ kubectl not configured for cluster. Run: doctl kubernetes cluster kubeconfig save $CLUSTER${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ kubectl configured and connected${NC}"
    return 0
}

# Function to show deployment status
show_status() {
    echo -e "\n${BLUE}=== Deployment Status ===${NC}\n"

    echo -e "${YELLOW}Backend:${NC}"
    kubectl get deployment backend -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"

    echo -e "\n${YELLOW}Frontend:${NC}"
    kubectl get deployment frontend -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"

    echo -e "\n${YELLOW}ML Service:${NC}"
    kubectl get deployment ml-service -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"

    echo -e "\n${YELLOW}Rust Pricing:${NC}"
    kubectl get deployment rust-pricing -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"

    echo -e "\n${YELLOW}Redis:${NC}"
    kubectl get deployment redis -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"

    echo -e "\n${YELLOW}PostgreSQL:${NC}"
    kubectl get deployment postgres -n $NAMESPACE -o wide 2>/dev/null || echo "  Not deployed"
}

# Function to show pods status
show_pods() {
    echo -e "\n${BLUE}=== Pod Status ===${NC}\n"
    kubectl get pods -n $NAMESPACE -o wide
}

# Function to show services
show_services() {
    echo -e "\n${BLUE}=== Services ===${NC}\n"
    kubectl get services -n $NAMESPACE
}

# Function to show ingress
show_ingress() {
    echo -e "\n${BLUE}=== Ingress ===${NC}\n"
    kubectl get ingress -n $NAMESPACE
}

# Function to tail logs
tail_logs() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${RED}Usage: $0 logs <service-name>${NC}"
        echo "Available services: backend, frontend, ml-service, rust-pricing"
        exit 1
    fi

    echo -e "${BLUE}Tailing logs for $service...${NC}"
    kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=$service --tail=100 -f
}

# Function to trigger GitHub Actions workflow
trigger_deploy() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${RED}Usage: $0 deploy <service-name>${NC}"
        echo "Available services: backend, frontend, ml, rust"
        exit 1
    fi

    echo -e "${BLUE}Triggering deployment for $service via GitHub Actions...${NC}"
    echo -e "${YELLOW}This requires GitHub CLI (gh) to be installed and authenticated${NC}"

    if ! command -v gh &> /dev/null; then
        echo -e "${RED}✗ GitHub CLI not found. Install: https://cli.github.com/${NC}"
        exit 1
    fi

    gh workflow run "${service}.yml"
    echo -e "${GREEN}✓ Workflow triggered. Check status with: gh run list${NC}"
}

# Function to check deployment health
check_health() {
    echo -e "\n${BLUE}=== Health Checks ===${NC}\n"

    echo -e "${YELLOW}Checking Backend...${NC}"
    kubectl exec -n $NAMESPACE deployment/backend -- wget -qO- http://localhost:5000/health 2>/dev/null || echo "  ✗ Backend health check failed"

    echo -e "\n${YELLOW}Checking ML Service...${NC}"
    kubectl exec -n $NAMESPACE deployment/ml-service -- wget -qO- http://localhost:8000/health 2>/dev/null || echo "  ✗ ML Service health check failed"

    echo -e "\n${YELLOW}Checking Rust Pricing (gRPC - TCP check)...${NC}"
    kubectl exec -n $NAMESPACE deployment/rust-pricing -- nc -zv localhost 50051 2>&1 | grep -q succeeded && echo "  ✓ Rust Pricing responding" || echo "  ✗ Rust Pricing not responding"
}

# Function to show recent events
show_events() {
    echo -e "\n${BLUE}=== Recent Events ===${NC}\n"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20
}

# Function to restart a deployment
restart_deployment() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${RED}Usage: $0 restart <service-name>${NC}"
        echo "Available services: backend, frontend, ml-service, rust-pricing"
        exit 1
    fi

    echo -e "${BLUE}Restarting $service...${NC}"
    kubectl rollout restart deployment/$service -n $NAMESPACE
    kubectl rollout status deployment/$service -n $NAMESPACE
}

# Function to show resource usage
show_resources() {
    echo -e "\n${BLUE}=== Resource Usage ===${NC}\n"
    kubectl top nodes 2>/dev/null || echo "Metrics server not installed"
    echo ""
    kubectl top pods -n $NAMESPACE 2>/dev/null || echo "Metrics server not installed"
}

# Main command dispatcher
case "${1:-status}" in
    status)
        check_kubectl && show_status
        ;;
    pods)
        check_kubectl && show_pods
        ;;
    services)
        check_kubectl && show_services
        ;;
    ingress)
        check_kubectl && show_ingress
        ;;
    logs)
        check_kubectl && tail_logs "$2"
        ;;
    deploy)
        trigger_deploy "$2"
        ;;
    health)
        check_kubectl && check_health
        ;;
    events)
        check_kubectl && show_events
        ;;
    restart)
        check_kubectl && restart_deployment "$2"
        ;;
    resources)
        check_kubectl && show_resources
        ;;
    all)
        check_kubectl
        show_status
        show_pods
        show_services
        show_ingress
        ;;
    *)
        echo -e "${BLUE}Usage: $0 {status|pods|services|ingress|logs|deploy|health|events|restart|resources|all}${NC}"
        echo ""
        echo "Commands:"
        echo "  status             - Show deployment status for all services"
        echo "  pods               - Show all pods"
        echo "  services           - Show all services"
        echo "  ingress            - Show ingress configuration"
        echo "  logs <service>     - Tail logs for a service"
        echo "  deploy <service>   - Trigger GitHub Actions deployment"
        echo "  health             - Run health checks on all services"
        echo "  events             - Show recent cluster events"
        echo "  restart <service>  - Restart a deployment"
        echo "  resources          - Show resource usage (CPU/Memory)"
        echo "  all                - Show everything"
        echo ""
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 logs backend"
        echo "  $0 deploy backend"
        echo "  $0 restart rust-pricing"
        exit 1
        ;;
esac
