# HTTPS Timeout Fix - Complete Documentation Index

**Issue**: HTTPS requests to https://autolytiq.com timeout
**Root Cause**: NetworkPolicy missing port 80 for ingress-nginx traffic
**Status**: Fix ready to apply
**Date**: 2025-11-08

---

## Quick Start

### Apply the Fix (Fastest)
```bash
/root/autolytiq/fix-https-timeout.sh
```

### Read This First
- **QUICK_FIX_SUMMARY.md** - 2-minute read, everything you need to know

---

## Documentation Files

### 1. APPLY_FIX.txt
**What**: Quick reference card with fix commands
**Use**: Display before applying fix to understand what will happen
```bash
cat /root/autolytiq/APPLY_FIX.txt
```

### 2. QUICK_FIX_SUMMARY.md
**What**: Concise summary of problem, evidence, and fix (4 pages)
**Use**: Quick understanding of the issue without deep technical details
**Sections**:
- TL;DR
- What was wrong
- Evidence chain
- The fix
- Verification steps
- Prevention

### 3. HTTPS_TIMEOUT_DIAGNOSIS.md
**What**: Complete diagnostic report (14 pages)
**Use**: Deep technical analysis, perfect for documentation or postmortem
**Sections**:
- Executive summary
- Diagnostic timeline
- Configuration review (ingress, TLS, service, pods, network policy)
- Network connectivity testing
- Root cause confirmation
- Step-by-step fix instructions
- Complete configuration files
- Prevention strategies
- References

### 4. NETWORK_FLOW_DIAGRAM.md
**What**: Visual diagrams showing traffic flow before/after fix
**Use**: Understand network topology and where the blockage occurred
**Includes**:
- ASCII diagrams of current (broken) state
- ASCII diagrams of fixed state
- Side-by-side comparison
- Why health checks still worked
- Monitoring points
- Prevention checklist

### 5. network-policy-fixed.yaml
**What**: The actual Kubernetes NetworkPolicy with port 80 added
**Use**: Apply this to fix the issue
```bash
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml
```

### 6. fix-https-timeout.sh
**What**: Automated fix script with validation
**Use**: One-command fix with built-in testing
**Features**:
- Applies NetworkPolicy
- Verifies port 80 is included
- Tests connectivity from ingress controller
- Tests HTTPS endpoint externally
- Verifies TLS certificate
- Color-coded output (green=success, red=error, yellow=warning)

---

## File Locations

All files are in: `/root/autolytiq/`

```
/root/autolytiq/
├── APPLY_FIX.txt                    # Quick reference card
├── QUICK_FIX_SUMMARY.md             # 4-page summary
├── HTTPS_TIMEOUT_DIAGNOSIS.md       # 14-page full report
├── NETWORK_FLOW_DIAGRAM.md          # Visual diagrams
├── INDEX_HTTPS_FIX.md               # This file
├── network-policy-fixed.yaml        # Fixed NetworkPolicy
└── fix-https-timeout.sh             # Automated fix script
```

---

## Execution Path

### Option A: Automated (Recommended)
```bash
# 1. Review what will happen
cat /root/autolytiq/APPLY_FIX.txt

# 2. Run the automated fix
/root/autolytiq/fix-https-timeout.sh

# 3. Verify in browser
# Open https://autolytiq.com in your browser
```

### Option B: Manual
```bash
# 1. Read the summary
cat /root/autolytiq/QUICK_FIX_SUMMARY.md

# 2. Apply the NetworkPolicy
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml

# 3. Verify it was applied
kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml | grep "port: 80"

# 4. Test from ingress controller
INGRESS_POD=$(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ingress-nginx "$INGRESS_POD" -- \
  curl -s -w "\nHTTP: %{http_code}\n" \
  -H "Host: autolytiq.com" \
  http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/ \
  -o /dev/null

# 5. Test HTTPS externally
curl -v https://autolytiq.com/

# 6. Monitor logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=20 -f
```

---

## Verification Checklist

After applying the fix, verify:

- [ ] NetworkPolicy includes port 80
  ```bash
  kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml | grep -c "port: 80"
  # Should return at least 2
  ```

- [ ] Ingress controller can reach frontend service
  ```bash
  kubectl exec -n ingress-nginx <ingress-pod> -- \
    curl -s -o /dev/null -w "%{http_code}" \
    http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/
  # Should return: 200
  ```

- [ ] HTTPS endpoint works externally
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://autolytiq.com/
  # Should return: 200
  ```

- [ ] TLS certificate is valid
  ```bash
  echo | openssl s_client -connect autolytiq.com:443 -servername autolytiq.com 2>/dev/null | \
    grep -E "subject|issuer"
  # Should show: CN=autolytiq.com and Let's Encrypt issuer
  ```

- [ ] No timeout errors in logs
  ```bash
  kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50 | \
    grep -E "autolytiq.com" | grep -E "timeout|499|504"
  # Should return: empty (no errors)
  ```

- [ ] Browser test
  - Open https://autolytiq.com in browser
  - Page should load in < 2 seconds
  - Certificate should show as valid (green padlock)

---

## Root Cause Summary

**Problem**: NetworkPolicy in `autolytiq-prod` namespace allowed ingress-nginx to access ports 3000, 5000, 8000, and 8080, but NOT port 80.

**Why it matters**: The frontend service (`autolytiq-frontend`) uses port 80, so all HTTPS requests from the ingress controller were blocked by the network policy.

**Evidence**:
1. TLS certificate: ✅ Valid
2. Ingress config: ✅ Correct
3. Frontend pods: ✅ Healthy
4. Frontend service: ✅ Healthy with 2 endpoints
5. Pod-to-pod networking: ✅ Works
6. **Ingress → Frontend**: ❌ **BLOCKED** (port 80 not in NetworkPolicy)

**Fix**: Add port 80 to the NetworkPolicy ingress rules for traffic from the ingress-nginx namespace.

---

## Technical Details

### What Changed

**Before** (NetworkPolicy ingress from ingress-nginx):
```yaml
ports:
  - port: 5000
  - port: 3000
  - port: 8080
  - port: 8000
```

**After** (NetworkPolicy ingress from ingress-nginx):
```yaml
ports:
  - port: 80    # ← ADDED
  - port: 3000
  - port: 5000
  - port: 8000
  - port: 8080
```

### Services and Their Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| autolytiq-frontend | 80 | HTTP | React SPA (nginx) |
| autolytiq-backend | 3000 | HTTP | Express.js API |
| ml-service | 8000 | HTTP | Python FastAPI |
| rust-pricing | 50051 | gRPC | Rust pricing engine |
| rust-comm-service | 50052 | gRPC | Rust communications |
| redis | 6379 | Redis | Cache |

### Network Policy Rules (After Fix)

1. **From ingress-nginx namespace**: Ports 80, 3000, 5000, 8000, 8080
2. **From same namespace (pod-to-pod)**: Ports 80, 3000, 5000, 8000, 8080, 50051, 50052, 6379
3. **Egress**: Allow all (can be restricted later)

---

## Rollback Plan

If the fix causes issues (unlikely), rollback:

```bash
# Save current policy
kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml > /tmp/current-policy.yaml

# Revert to previous version
# (Remove port 80 from ingress rules)
kubectl apply -f /path/to/previous-policy.yaml
```

**Note**: Rollback is not recommended unless there are unexpected issues. The fix is additive (only adds permissions) and has been validated.

---

## Support Commands

```bash
# View all network policies
kubectl get networkpolicies -n autolytiq-prod

# Describe network policy
kubectl describe networkpolicy -n autolytiq-prod autolytiq-network-policy

# View all services and ports
kubectl get svc -n autolytiq-prod

# View all endpoints
kubectl get endpoints -n autolytiq-prod

# Test service connectivity
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- \
  curl http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/

# View ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=100

# View frontend pod logs
kubectl logs -n autolytiq-prod -l component=frontend --tail=100

# View ingress configuration
kubectl describe ingress -n autolytiq-prod autolytiq-ingress

# View certificate status
kubectl get certificate -n autolytiq-prod
kubectl describe certificate -n autolytiq-prod autolytiq-tls
```

---

## Contact/Escalation

If the fix doesn't resolve the issue:

1. Check ingress controller logs for new error patterns
2. Verify DNS is resolving correctly: `nslookup autolytiq.com`
3. Check load balancer health in DigitalOcean dashboard
4. Verify certificate-manager logs: `kubectl logs -n cert-manager -l app=cert-manager`
5. Check if cert-manager renewed the certificate correctly
6. Verify the load balancer is routing to the correct ingress controller

---

## Lessons Learned / Prevention

1. **Document all service ports** in a central location (README or wiki)
2. **Test NetworkPolicy changes** with connectivity tests before deploying
3. **Monitor ingress logs** for timeout patterns (set up alerts for HTTP 499/504)
4. **Use consistent port numbers** across similar services (avoid mixing 80/8080/3000)
5. **Automate NetworkPolicy generation** based on service definitions
6. **Include NetworkPolicy in CI/CD** validation (test connectivity as part of deployment)

---

## References

- Kubernetes NetworkPolicy: https://kubernetes.io/docs/concepts/services-networking/network-policies/
- NGINX Ingress Controller: https://kubernetes.github.io/ingress-nginx/
- cert-manager: https://cert-manager.io/
- Let's Encrypt: https://letsencrypt.org/
- DigitalOcean Kubernetes: https://docs.digitalocean.com/products/kubernetes/

---

**Generated**: 2025-11-08
**Issue ID**: HTTPS timeout on autolytiq.com
**Root Cause**: NetworkPolicy missing port 80
**Status**: Fix ready to apply
**Risk**: Low (additive change only)
**Estimated Fix Time**: 30 seconds
**Estimated Validation Time**: 2 minutes
