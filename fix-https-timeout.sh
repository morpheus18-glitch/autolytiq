#!/bin/bash
set -e

echo "===================================="
echo "HTTPS Timeout Fix for autolytiq.com"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Apply the fixed NetworkPolicy
echo -e "${YELLOW}Step 1: Applying fixed NetworkPolicy...${NC}"
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ NetworkPolicy applied successfully${NC}"
else
    echo -e "${RED}✗ Failed to apply NetworkPolicy${NC}"
    exit 1
fi
echo ""

# Step 2: Verify the policy
echo -e "${YELLOW}Step 2: Verifying NetworkPolicy includes port 80...${NC}"
POLICY_CHECK=$(kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml | grep -c "port: 80" || true)

if [ "$POLICY_CHECK" -ge 2 ]; then
    echo -e "${GREEN}✓ Port 80 found in NetworkPolicy (${POLICY_CHECK} occurrences)${NC}"
else
    echo -e "${RED}✗ Port 80 not found in NetworkPolicy${NC}"
    exit 1
fi
echo ""

# Step 3: Wait for policy to propagate
echo -e "${YELLOW}Step 3: Waiting 5 seconds for policy to propagate...${NC}"
sleep 5
echo -e "${GREEN}✓ Wait complete${NC}"
echo ""

# Step 4: Test connectivity from ingress controller
echo -e "${YELLOW}Step 4: Testing connectivity from ingress controller to frontend...${NC}"
INGRESS_POD=$(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}')

if [ -z "$INGRESS_POD" ]; then
    echo -e "${RED}✗ Could not find ingress controller pod${NC}"
    exit 1
fi

HTTP_CODE=$(kubectl exec -n ingress-nginx "$INGRESS_POD" -- \
    curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Host: autolytiq.com" \
    http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Frontend responding with HTTP $HTTP_CODE${NC}"
else
    echo -e "${RED}✗ Frontend returned HTTP $HTTP_CODE (expected 200)${NC}"
    echo "   This may take a few more seconds to propagate. Try the manual test:"
    echo "   kubectl exec -n ingress-nginx $INGRESS_POD -- curl -v http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/"
fi
echo ""

# Step 5: Test HTTPS externally
echo -e "${YELLOW}Step 5: Testing HTTPS endpoint (https://autolytiq.com)...${NC}"
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://autolytiq.com/ 2>/dev/null || echo "000")

if [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✓ HTTPS endpoint responding with HTTP $HTTPS_CODE${NC}"
else
    echo -e "${YELLOW}⚠ HTTPS endpoint returned HTTP $HTTPS_CODE${NC}"
    if [ "$HTTPS_CODE" = "000" ]; then
        echo "   Connection timed out. This may take a few minutes to propagate."
    fi
    echo "   Try manual test: curl -v https://autolytiq.com/"
fi
echo ""

# Step 6: Check certificate
echo -e "${YELLOW}Step 6: Verifying TLS certificate...${NC}"
CERT_INFO=$(echo | openssl s_client -connect autolytiq.com:443 -servername autolytiq.com 2>/dev/null | \
    openssl x509 -noout -subject -issuer 2>/dev/null || echo "")

if echo "$CERT_INFO" | grep -q "CN=autolytiq.com"; then
    echo -e "${GREEN}✓ Valid TLS certificate for autolytiq.com${NC}"
    echo "$CERT_INFO" | grep "subject"
    echo "$CERT_INFO" | grep "issuer"
else
    echo -e "${YELLOW}⚠ Could not verify certificate (may not be accessible from this location)${NC}"
fi
echo ""

# Final summary
echo "===================================="
echo -e "${GREEN}Fix Applied Successfully!${NC}"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Monitor logs: kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50 -f"
echo "2. Test in browser: https://autolytiq.com"
echo "3. Check for errors: kubectl get events -n autolytiq-prod --sort-by='.lastTimestamp' | tail -20"
echo ""
echo "If issues persist after 2-3 minutes:"
echo "- Check ingress logs for 'upstream timed out' errors"
echo "- Verify all frontend pods are healthy: kubectl get pods -n autolytiq-prod -l component=frontend"
echo "- Test direct pod access: kubectl exec -n autolytiq-prod <frontend-pod> -- wget -O- http://localhost:80/"
echo ""
