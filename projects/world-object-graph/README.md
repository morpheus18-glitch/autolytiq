# Unmapped / World Object Graph

Standalone concept: a UPC-scanning creature-discovery game whose real
asset is the aggregate affinity graph it builds between players, real-
world products, and in-game choices — monetized as brand-facing insight
reports and in-game research missions, never as raw player data.

This is **not part of AutolytiQ** (the automotive CRM/DMS this
repository otherwise contains). It's staged here, on its own branch, as
a separate concept getting worked out from first principles to first
economic model. If it moves forward, it should get its own repository,
database, and deploy pipeline rather than growing inside this codebase.

**Start here:** [`V1_ECONOMIC_MODEL.md`](./V1_ECONOMIC_MODEL.md) — game
theme, scan scope, first 10 monetizable signals, cost at 1K/10K/100K/1M
users, and the concrete proof points needed before a brand pays for the
first pilot.

**Supporting artifacts:**
- [`schema.prisma`](./schema.prisma) — V1 data model (Account, Source,
  Brand, Scan, Specimen, ResearchMission, MissionResponse)
- [`creature-generator.ts`](./creature-generator.ts) — deterministic,
  zero-marginal-cost specimen generation from a UPC (SHA-256 seed →
  genome → client-rendered from a fixed part library), plus a
  runtime-enforced guarantee that sponsorships can never be pay-to-win

## Core principle

> We do not sell people's data. We sell answers derived from the network.

The product is the aggregate graph, not the individual. See
`V1_ECONOMIC_MODEL.md` §5 and §7 for how that principle is enforced in
the schema (no PII required to play, `ScanContext` is player-asserted
and never upgraded to "purchase", no precise location) and in the go-
to-market plan (what a brand can buy vs. what it can never buy).
