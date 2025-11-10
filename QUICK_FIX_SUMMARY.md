# HTTPS Timeout - Quick Fix Summary

## TL;DR

**Problem**: HTTPS requests to https://autolytiq.com timeout
**Root Cause**: NetworkPolicy missing port 80 for ingress-nginx → frontend traffic
**Fix**: Add port 80 to NetworkPolicy
**Time to Fix**: ~30 seconds

---

## Apply the Fix (One Command)

```bash
/root/autolytiq/fix-https-timeout.sh
```

**OR manually:**

```bash
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml
```

---

## What Was Wrong?

The NetworkPolicy in `autolytiq-prod` namespace allowed ingress-nginx to access:
- ✅ Port 3000 (backend)
- ✅ Port 5000 (backend alt)
- ✅ Port 8000 (ml-service)
- ✅ Port 8080 (alternative)
- ❌ Port 80 (frontend) ← **MISSING!**

Frontend service uses port 80, so HTTPS requests were blocked by the network policy.

---

## Evidence Chain

1. **TLS Certificate**: ✅ Valid (Let's Encrypt, expires 2026-02-06)
2. **Ingress Config**: ✅ Correct (routes / → autolytiq-frontend:80)
3. **Frontend Pods**: ✅ Healthy (nginx listening on port 80, responding to health checks)
4. **Frontend Service**: ✅ Healthy (2 endpoints: 10.109.36.89:80, 10.109.37.78:80)
5. **Pod-to-Pod**: ✅ Works (internal network is fine)
6. **Ingress → Frontend**: ❌ **TIMEOUT** (network policy blocks port 80)

Test that proved it:
```bash
# This times out:
kubectl exec -n ingress-nginx <ingress-pod> -- \
  curl http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/
# Hangs for 120+ seconds, never returns
```

---

## The Fix (What Changed)

**Before** (broken):
```yaml
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            name: ingress-nginx
    ports:
      - port: 5000
      - port: 3000
      - port: 8080
      - port: 8000
      # Port 80 missing!
```

**After** (fixed):
```yaml
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            name: ingress-nginx
    ports:
      - port: 80    # ← ADDED
      - port: 3000
      - port: 5000
      - port: 8000
      - port: 8080
```

---

## Verify the Fix

### 1. Check Policy Applied
```bash
kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml | grep "port: 80"
```
Should show at least 2 lines with `port: 80`

### 2. Test Internal Connectivity
```bash
kubectl exec -n ingress-nginx \
  $(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}') -- \
  curl -s -w "\nHTTP: %{http_code}\n" http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/ -o /dev/null
```
Should return: `HTTP: 200` in < 1 second

### 3. Test HTTPS Externally
```bash
curl -v https://autolytiq.com/
```
Should return HTTP 200 with HTML

### 4. Check Logs (No More Errors)
```bash
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=20
```
Should NOT show "upstream timed out" or HTTP 499/504 for autolytiq.com

---

## Files Created

1. `/root/autolytiq/network-policy-fixed.yaml` - Fixed NetworkPolicy
2. `/root/autolytiq/HTTPS_TIMEOUT_DIAGNOSIS.md` - Complete diagnostic report
3. `/root/autolytiq/fix-https-timeout.sh` - Automated fix script
4. `/root/autolytiq/QUICK_FIX_SUMMARY.md` - This file

---

## Why Did This Happen?

The NetworkPolicy was likely created before the frontend service was changed from port 3000 to port 80, or port 80 was simply overlooked when listing allowed ports.

**Common mistake**: Assuming nginx always uses port 8080, but the frontend container uses port 80.

---

## Prevention

Add this to deployment checklist:
- [ ] List all service ports in a central doc
- [ ] Update NetworkPolicy whenever service ports change
- [ ] Test connectivity after applying any NetworkPolicy
- [ ] Monitor ingress logs for "upstream timed out" errors

---

## Support Commands

```bash
# Check all services and their ports
kubectl get svc -n autolytiq-prod -o wide

# Check network policies
kubectl get networkpolicies -n autolytiq-prod

# Check ingress configuration
kubectl describe ingress -n autolytiq-prod autolytiq-ingress

# Check certificate status
kubectl get certificate -n autolytiq-prod

# View frontend pod logs
kubectl logs -n autolytiq-prod -l component=frontend --tail=50

# View ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50
```

---

**Status**: Ready to deploy
**Risk**: Low (only adding permissions, not removing)
**Rollback**: Revert to previous NetworkPolicy if needed
**Estimated Downtime**: 0 seconds (fix is additive)
