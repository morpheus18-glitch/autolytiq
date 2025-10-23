# Infrastructure Remediation Plan

1. Implement strict environment validation shared across backend and ML services, aligned with ENV contract.
2. Add deployment flags (replit vs self_hosted) to gate Docker/K8s assets and monitoring features.
3. Wire Redis REDIS_URL into backend cache and Celery broker/result, including smoke scripts.
4. Expose /health and /metrics endpoints in backend and ML services instrumented for Prometheus.
5. Harden secrets handling with gitleaks scanning and pre-commit hook enforcement.
6. Author Replit-first dev docs plus provider onboarding guides with smoke tests and rotation policies.
7. Ship self-host orchestration (Docker & K8s) guarded behind feature flags, with CI coverage.
