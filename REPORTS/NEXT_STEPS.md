# Next Steps

1. **DigitalOcean Registry & Cluster Secrets**
   - Set `DO_TOKEN`, `DO_REGISTRY` (if overriding default), `CLUSTER`, and `NS` secrets in GitHub for all workflows.
   - Ensure Kubernetes namespace `${{ secrets.NS || 'autolytiq-prod' }}` exists with `app-env` secret populated with backend/ML configuration.
2. **Backend Application Secrets**
   - Provide production values for `DATABASE_URL`, `DIRECT_URL`, `JWT_PUBLIC_KEY`, `JWT_SECRET`, Twilio, SendGrid, AWS, Redis, and ML integration secrets inside the `app-env` secret or equivalent secret manager.
   - Decide whether to enable migrations by setting `RUN_MIGRATIONS=true` in GitHub secrets.
3. **ML Service Configuration**
   - Populate ML-specific secrets (DB, Redis, JWT, Twilio, SendGrid, AWS, Pexels, `ML_SERVICE_TOKEN`) and mount them for the `ml-service` deployment.
   - Plan consolidation of `ml_service/` and `apps/ml_backend/` directories to eliminate duplication.
4. **Rust Pricing Service**
   - Define `RUST_SERVICE_NAME` secret if deploying binaries other than `price-engine`.
   - Provide Postgres/Redis credentials via `app-env` or dedicated ConfigMap/Secret for the Rust service.
5. **Repository Hygiene**
   - Consider removing legacy `package-lock.json` and unused ML directories once migration strategy is confirmed.
   - Keep `.env` files out of version control; rely on the new `.env.example` templates when onboarding engineers.
