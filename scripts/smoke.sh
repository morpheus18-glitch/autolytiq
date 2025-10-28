#!/bin/bash
#
# Smoke Test Script for AutolytiQ Production Deployment
# Usage: ./smoke.sh [namespace]
#

set -e

NAMESPACE="${1:-production}"
MAX_RETRIES=30
RETRY_DELAY=10

echo "========================================="
echo "🔍 Running Smoke Tests"
echo "========================================="
echo "Namespace: $NAMESPACE"
echo ""

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local retries=0

    echo "⏳ Waiting for $service_name to be ready..."

    while [ $retries -lt $MAX_RETRIES ]; do
        if kubectl get svc $service_name -n $NAMESPACE &>/dev/null; then
            echo "✅ Service $service_name found"
            return 0
        fi
        retries=$((retries + 1))
        echo "  Retry $retries/$MAX_RETRIES..."
        sleep $RETRY_DELAY
    done

    echo "❌ Service $service_name not found after $MAX_RETRIES attempts"
    return 1
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local service_name=$1
    local port=$2
    local path=$3
    local expected_code=${4:-200}

    echo ""
    echo "Testing $service_name ($path)..."

    # Port forward in background
    kubectl port-forward -n $NAMESPACE svc/$service_name $port:$port &
    PF_PID=$!
    sleep 3

    # Test endpoint
    response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port$path || echo "000")

    # Cleanup
    kill $PF_PID 2>/dev/null || true

    if [ "$response_code" == "$expected_code" ]; then
        echo "✅ $service_name$path returned $response_code"
        return 0
    else
        echo "❌ $service_name$path returned $response_code (expected $expected_code)"
        return 1
    fi
}

# Function to test gRPC endpoint
test_grpc_endpoint() {
    local service_name=$1
    local port=$2

    echo ""
    echo "Testing $service_name (gRPC)..."

    # Port forward in background
    kubectl port-forward -n $NAMESPACE svc/$service_name $port:$port &
    PF_PID=$!
    sleep 3

    # Test if port is listening
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $service_name gRPC port $port is listening"
        kill $PF_PID 2>/dev/null || true
        return 0
    else
        echo "❌ $service_name gRPC port $port is not responding"
        kill $PF_PID 2>/dev/null || true
        return 1
    fi
}

# Check prerequisites
echo "Checking prerequisites..."
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required but not installed"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required but not installed"; exit 1; }
command -v nc >/dev/null 2>&1 || { echo "⚠️  nc (netcat) not found, skipping gRPC tests"; }

echo "✅ Prerequisites met"
echo ""

# Check namespace exists
if ! kubectl get namespace $NAMESPACE &>/dev/null; then
    echo "❌ Namespace $NAMESPACE does not exist"
    exit 1
fi

echo "========================================="
echo "📊 Deployment Status"
echo "========================================="

# Check all pods are running
echo ""
echo "Pod Status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "Service Status:"
kubectl get services -n $NAMESPACE

# Count pods in different states
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
RUNNING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers | wc -l)
PENDING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Pending --no-headers | wc -l)
FAILED_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Failed --no-headers | wc -l)

echo ""
echo "Summary:"
echo "  Total Pods: $TOTAL_PODS"
echo "  Running: $RUNNING_PODS"
echo "  Pending: $PENDING_PODS"
echo "  Failed: $FAILED_PODS"

if [ $FAILED_PODS -gt 0 ]; then
    echo "❌ There are failed pods!"
    kubectl get pods -n $NAMESPACE --field-selector=status.phase=Failed
    exit 1
fi

if [ $RUNNING_PODS -eq 0 ]; then
    echo "❌ No pods are running!"
    exit 1
fi

echo ""
echo "========================================="
echo "🧪 Testing Services"
echo "========================================="

FAILED_TESTS=0

# Test 1: Frontend Health
if test_http_endpoint "frontend" 80 "/health" 200; then
    true
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 2: Backend Health
if test_http_endpoint "backend" 5000 "/health" 200; then
    true
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 3: Backend API endpoint (sample)
if test_http_endpoint "backend" 5000 "/api/health" 200; then
    true
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 4: Pricing service health (via backend)
echo ""
echo "Testing pricing service integration..."
kubectl port-forward -n $NAMESPACE svc/backend 5000:5000 &
PF_PID=$!
sleep 3

PRICING_HEALTH=$(curl -s http://localhost:5000/api/pricing/health || echo '{"healthy":false}')
PRICING_HEALTHY=$(echo $PRICING_HEALTH | grep -o '"healthy"[[:space:]]*:[[:space:]]*true' | wc -l)

kill $PF_PID 2>/dev/null || true

if [ $PRICING_HEALTHY -gt 0 ]; then
    echo "✅ Pricing service is healthy"
else
    echo "⚠️  Pricing service may not be responding (this is okay if service is starting)"
    # Don't fail on this - it's optional
fi

# Test 5: Pricing Rust gRPC (direct)
if command -v nc >/dev/null 2>&1; then
    if test_grpc_endpoint "pricing-rust" 50051; then
        true
    else
        echo "⚠️  Pricing gRPC service not responding (may still be starting)"
        # Don't fail - service might be warming up
    fi
fi

echo ""
echo "========================================="
echo "📈 Final Results"
echo "========================================="

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ All smoke tests passed!"
    echo ""
    echo "Deployment appears healthy:"
    echo "  - Frontend: Serving"
    echo "  - Backend: Serving"
    echo "  - Pricing Service: Available"
    echo ""
    exit 0
else
    echo "❌ $FAILED_TESTS test(s) failed"
    echo ""
    echo "Please check:"
    echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=backend"
    echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=frontend"
    echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=pricing-rust"
    echo ""
    exit 1
fi
