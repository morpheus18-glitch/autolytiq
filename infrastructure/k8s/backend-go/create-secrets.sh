#!/bin/bash
# Create Kubernetes secrets for DigitalOcean deployment
# Run this script ONCE before deploying backend-go

set -e

NAMESPACE="autolytiq-prod"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating secrets in namespace: ${NAMESPACE}${NC}"

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Creating namespace ${NAMESPACE}...${NC}"
    kubectl create namespace $NAMESPACE
fi

# ===========================
# 1. Database Secret (VPC)
# ===========================
echo -e "${GREEN}Creating database-secret (VPC connection)...${NC}"

kubectl create secret generic database-secret \
  --from-literal=url="postgresql://db-autolytiq:AVNS_r6HQxLXjLSfiUWhkh-y@private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com:25060/db-autolytiq?sslmode=require" \
  -n $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ database-secret created${NC}"

# ===========================
# 2. JWT Keys Secret
# ===========================
echo -e "${GREEN}Creating jwt-keys secret...${NC}"

# Check if JWT keys exist
if [ ! -f "../../backend/keys/jwt-public.pem" ] || [ ! -f "../../backend/keys/jwt-private.pem" ]; then
    echo -e "${YELLOW}Warning: JWT keys not found at ../../backend/keys/${NC}"
    echo -e "${YELLOW}Please ensure jwt-public.pem and jwt-private.pem exist${NC}"
    exit 1
fi

kubectl create secret generic jwt-keys \
  --from-file=public.pem=../../backend/keys/jwt-public.pem \
  --from-file=private.pem=../../backend/keys/jwt-private.pem \
  -n $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ jwt-keys created${NC}"

# ===========================
# 3. Verify Secrets
# ===========================
echo -e "${GREEN}Verifying secrets...${NC}"

kubectl get secret database-secret -n $NAMESPACE -o jsonpath='{.data.url}' | base64 -d | head -c 50
echo "..."

echo -e "${GREEN}✓ database-secret verified${NC}"

kubectl get secret jwt-keys -n $NAMESPACE -o jsonpath='{.data.public\.pem}' | base64 -d | head -c 50
echo "..."

echo -e "${GREEN}✓ jwt-keys verified${NC}"

# ===========================
# Summary
# ===========================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All secrets created successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Secrets in namespace: $NAMESPACE"
kubectl get secrets -n $NAMESPACE | grep -E "database-secret|jwt-keys"
echo ""
echo -e "${GREEN}Next step: Deploy backend-go${NC}"
echo "kubectl apply -k infrastructure/k8s/backend-go/"
