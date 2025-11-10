# HTTPS Timeout Fix - Ready to Deploy

## Problem
HTTPS requests to https://autolytiq.com timeout after 60 seconds with HTTP 504 errors.

## Root Cause
NetworkPolicy in `autolytiq-prod` namespace is blocking port 80 traffic from ingress-nginx to frontend pods.

## Solution
Add port 80 to the NetworkPolicy ingress rules.

## Apply Fix (One Command)
```bash
/root/autolytiq/fix-https-timeout.sh
```

## Documentation
- **Quick Summary**: [QUICK_FIX_SUMMARY.md](QUICK_FIX_SUMMARY.md) - Read this first
- **Full Diagnosis**: [HTTPS_TIMEOUT_DIAGNOSIS.md](HTTPS_TIMEOUT_DIAGNOSIS.md) - Complete technical report
- **Network Diagrams**: [NETWORK_FLOW_DIAGRAM.md](NETWORK_FLOW_DIAGRAM.md) - Visual explanation
- **Documentation Index**: [INDEX_HTTPS_FIX.md](INDEX_HTTPS_FIX.md) - All files and commands

## Files
- `network-policy-fixed.yaml` - Fixed NetworkPolicy configuration
- `fix-https-timeout.sh` - Automated fix script with validation
- `APPLY_FIX.txt` - Quick reference card

## Risk Assessment
- **Risk Level**: LOW
- **Reason**: Only adding port 80 permission, not removing anything
- **Downtime**: 0 seconds (no pod restarts needed)
- **Rollback**: Simple revert to previous NetworkPolicy if needed

## What Was Changed
```diff
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
+       - port: 80    # ← ADDED for frontend
        - port: 3000
        - port: 5000
        - port: 8000
        - port: 8080
```

## Verification
After applying the fix, verify:
1. NetworkPolicy includes port 80
2. Ingress controller can reach frontend (HTTP 200)
3. HTTPS works externally: `curl https://autolytiq.com/`
4. No timeout errors in logs

## Next Steps
1. Review [QUICK_FIX_SUMMARY.md](QUICK_FIX_SUMMARY.md)
2. Run `/root/autolytiq/fix-https-timeout.sh`
3. Test https://autolytiq.com in browser
4. Monitor logs for any issues

**Status**: Ready to deploy
**Date**: 2025-11-08
