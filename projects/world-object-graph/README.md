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

**Live, working prototype:** https://claude.ai/code/artifact/7192668c-293d-4f53-904b-9d3dcbf0fb66
— [`artifact/unmapped.html`](./artifact/unmapped.html). Scan a barcode
(or pick one of the demo codes), get a real deterministically-generated
creature, and watch the shared World Registry, Codex, Field Agents
leaderboard, and a live sponsor-style Research Mission build from real
persisted data (Claude Artifact `db` capability — one Firestore-style
document store per artifact, shared across every viewer in real time).
It only persists when opened from claude.ai (signed-in org members); a
static/offline open still runs the full generation + rendering pipeline
locally so the core mechanic is always demonstrable. See the top of
that file, or the note at the bottom of this README, for exactly what's
real here versus what's still a V2 concept.

**Supporting artifacts:**
- [`schema.prisma`](./schema.prisma) — the "real backend" V1 data model
  (Account, Source, Brand, Scan, Specimen, ResearchMission,
  MissionResponse) that a production build would migrate to
- [`creature-generator.ts`](./creature-generator.ts) — the Node/TS
  reference implementation of the deterministic generator (the live
  prototype above ports the same algorithm to browser `SubtleCrypto`)
  — zero-marginal-cost specimen generation from a UPC (SHA-256 seed →
  genome → client-rendered from a fixed part library), plus a
  runtime-enforced guarantee that sponsorships can never be pay-to-win
- [`artifact/unmapped.html`](./artifact/unmapped.html) — the live demo
  itself: single-file app (vanilla JS + Canvas, no build step) backed
  by the Artifact `db` capability instead of the Postgres schema above

## Core principle

> We do not sell people's data. We sell answers derived from the network.

The product is the aggregate graph, not the individual. See
`V1_ECONOMIC_MODEL.md` §5 and §7 for how that principle is enforced in
the schema (no PII required to play, `ScanContext` is player-asserted
and never upgraded to "purchase", no precise location) and in the go-
to-market plan (what a brand can buy vs. what it can never buy).
