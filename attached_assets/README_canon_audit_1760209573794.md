# Canonical Audit — Quickstart

Run this in your repo root to rank existing "canonical" files vs lookalikes and stale copies.

## Use
```bash
node canon_audit.mjs
```
Outputs:
- `canon-audit/canon_report.md`
- `canon-audit/details.json`

Tune the canonical hints at the top of the script, and/or add `CANONICAL:` lines in `ARCHITECTURE.md`.
