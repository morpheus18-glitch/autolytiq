#!/bin/bash
set -e

echo "🔍 Running smoke tests..."

# Get services
BACKEND_URL=$(kubectl get svc backend -n production -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
FRONTEND_URL=$(kubectl get svc frontend -n production -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test backend health
echo "Testing backend health..."
curl -f http://${BACKEND_URL}:5000/health || exit 1
echo "✅ Backend healthy"

# Test frontend
echo "Testing frontend..."
curl -f http://${FRONTEND_URL}:8080 || exit 1
echo "✅ Frontend healthy"

# Test pricing service (via backend)
echo "Testing pricing service..."
curl -f http://${BACKEND_URL}:5000/health/pricing || exit 1
echo "✅ Pricing service healthy"

# Test sample API call
echo "Testing sample deal calculation..."
curl -X POST http://${BACKEND_URL}:5000/api/deals/calculate \
  -H "Content-Type: application/json" \
  -d '{"vehiclePrice": 30000, "vehicleCost": 25000}' || exit 1
echo "✅ API working"

echo "🎉 All smoke tests passed!"
