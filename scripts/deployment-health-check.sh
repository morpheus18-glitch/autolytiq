#!/bin/bash
# Deployment Health Check Script
# Run this after deployment to verify all services are running correctly

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Deployment Health Check ==="
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
ML_SERVICE_URL="${ML_SERVICE_URL:-http://localhost:8000}"

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗${NC} (got $response, expected $expected_code)"
        return 1
    fi
}

# Check if services are reachable
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "ML Service URL: $ML_SERVICE_URL"
echo ""

# Backend health checks
echo "Backend Health Checks:"
check_endpoint "Backend /health" "$BACKEND_URL/health" || true
check_endpoint "Backend /ready" "$BACKEND_URL/ready" || true
check_endpoint "Backend /live" "$BACKEND_URL/live" || true
echo ""

# Frontend health check
echo "Frontend Health Check:"
check_endpoint "Frontend /health" "$FRONTEND_URL/health" || true
check_endpoint "Frontend /" "$FRONTEND_URL/" || true
echo ""

# ML Service health check
echo "ML Service Health Check:"
check_endpoint "ML Service /health" "$ML_SERVICE_URL/health" || true
echo ""

# Database connectivity (if backend is accessible)
echo "Database Connectivity:"
check_endpoint "Database health" "$BACKEND_URL/health/database" || true
echo ""

# Check Docker containers (if docker is available)
if command -v docker &> /dev/null; then
    echo "Docker Containers Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "autolytiq|NAME" || echo "No autolytiq containers running"
    echo ""
fi

echo -e "${GREEN}=== Health Check Complete ===${NC}"
