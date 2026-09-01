# Unmapped — V1 Economic Model

Working name: **Unmapped**. Players are "Field Agents"; scanned barcodes
are "Sources"; generated creatures are "Specimens"; a player's collection
is their "Codex". (Ties directly to the `UNMAPPED SOURCE` first-discovery
moment from the original pitch — the name is the product.)

This doc is the answer to "is this merely clever or venture-scale?" — it
pins down the parts that turn the concept into something buildable and
fundable: theme, scan scope, schema, algorithm, first monetizable
signals, cost at scale, and the specific proof points a brand needs to
see before writing the first check.

Companion files in this directory:
- [`schema.prisma`](./schema.prisma) — V1 data model
- [`creature-generator.ts`](./creature-generator.ts) — deterministic specimen generation

---

## 1. First game theme

**Category: beverages, snacks, candy.** Not "anything with a barcode."

Reasons this is the right first vertical, not just an easy one:
- **UPC/product-database coverage is best-in-class** for CPG — lookups
  resolve reliably on first try, minimizing the `UNVERIFIED` backlog.
- **Repeat-scan behavior is naturally high frequency** (people buy a
  beverage weekly; a car part maybe once a year), which is what actually
  builds the affinity graph fast.
- **The brands most likely to pay for a discovery report** — Coca-Cola,
  PepsiCo, Mondelez, Monster/Red Bull tier — are exactly the ones this
  category surfaces, and they already run retail-media and
  shopper-insights budgets that this product can slot into.
- **It matches the example data already validated in the pitch**
  (Monster → Red Bull → Celsius), so the first Discovery Report can be
  built from a real, coherent category instead of a thin cross-section.

Explicitly **not** in V1 scope: apparel, media/vinyl, books/ISBN,
automotive parts, electronics. Wide category breadth is a distraction
before the core loop (scan → specimen → codex → mission) and the
category-share reporting product are both proven on one vertical.

## 2. Exactly what can be scanned

**In scope:**
- UPC-A and EAN-13 barcodes only, decoded on-device (standard mobile
  barcode reader library — no server round-trip needed to read the code
  itself).
- Restricted at ingestion to products classified `BEVERAGE`, `SNACK`, or
  `CANDY` (see `SourceCategory` in `schema.prisma`). A scan outside those
  categories still resolves cosmetically (so the app doesn't feel broken
  when someone scans a cereal box) but is flagged `UNVERIFIED` /
  low-priority and does **not** count toward brand-facing insight
  reports in V1.

**Explicitly out of scope for V1** (all deferred, not rejected):
- ISBN / book barcodes — different metadata shape, different buyer,
  V2 candidate.
- QR codes / NFC — different trust model (arbitrary payload vs. a
  UPC's fixed product identity); adds abuse surface for V1.
- Camera-based logo/object recognition ("scan" without a barcode) — this
  is the expensive path the whole architecture is designed to avoid
  (see original pitch's "machine that converts venture capital into
  dragons"). Not in V1 at any budget.
- Photos of the product, receipts, or purchase proof — a scan is a
  discovery/interest signal, not a purchase record (`ScanContext` in the
  schema makes this explicit rather than implied).
- Precise location capture. The only geographic signal collected is
  `timezoneOffsetMinutes` on the account, which is coarse by
  construction and never stored per-scan.

## 3. Database schema

See [`schema.prisma`](./schema.prisma) for the full, commented model.
Summary of the six tables and why each exists:

| Table | Purpose |
|---|---|
| `Account` | Pseudonymous identity. No name/email required to play; a `handle` and a coarse `timezoneOffsetMinutes` are the only identifying fields. |
| `Source` | One row per unique UPC, globally. The flywheel table — gets more complete as more people play, and subsequent scans of the same UPC are cache hits. |
| `Brand` | Owns `Source` rows for reporting rollups, and owns `ResearchMission`s it funds. |
| `Scan` | The discovery event. Small and scalar-only by design since it's the highest-volume table. |
| `Specimen` | The generated creature. Stores only a seed + denormalized display fields — the genome itself is recomputed client-side, never stored. |
| `ResearchMission` / `MissionResponse` | The "brands pay to ask questions" product — an in-game A/B choice a brand funds, with one vote per player enforced at the DB level. |

Two constraints worth calling out explicitly because they're easy to
regress later:
- `Scan.context` is player-asserted (`OWN`/`USE`/`WANT`/`FOUND`/
  `SEEN_ELSEWHERE`) and is never inferred or upgraded to "purchase" by
  the backend.
- `Specimen` genomes are **not** stored — only `seedHex` +
  `genomeVersion`. This is what keeps storage roughly flat as scan
  volume grows (see §6).

## 4. Creature-generation algorithm

See [`creature-generator.ts`](./creature-generator.ts) for the runnable
implementation. Mechanism:

```
seed = SHA256(upc + "|" + gameWorld + "|" + genomeVersion)
```

Each gene (species, body, head, tail, eyes, horn, texture, effect,
temperament, element, rarity roll, hidden-trait roll) reads a 2-byte
slice of that 32-byte digest and reduces it modulo the size of the
corresponding part library. Rarity is a weighted draw over the same
digest (70% Common / 20% Uncommon / 7% Rare / 2.5% Epic / 0.4%
Legendary / 0.1% Mythic — validated in-repo against 200K simulated UPCs,
landing within ~0.5pp of every target band).

Why this is the right V1 algorithm, not just a cheap one:
- **Zero marginal compute.** Generation is a single SHA-256 call plus
  integer modulo — sub-millisecond, no model inference, no per-scan
  spend. This is the difference between the "machine that converts VC
  into dragons" failure mode and a product with real unit economics.
- **Nothing to store.** A specimen is `{upc, gameWorld, genomeVersion}`
  — three short strings. The client reconstructs the full genome and
  renders it from a fixed, pre-built part library (100 bodies, 100
  heads, 50 tails, 80 eyes, 50 horns, 100 textures, 40 effects, 60
  species ≈ 9.6×10^13 combinatorial specimens from a one-time art
  budget).
- **Deterministic and auditable.** The same UPC always produces the same
  specimen for every player, forever (until a deliberate `genomeVersion`
  bump for a balance patch) — which matters for both trust ("why did I
  get a worse creature than my friend for the same product") and for
  the sponsor-safety guarantee below.
- **Sponsor-safety is enforceable in code, not just policy.**
  `assertSponsorSafe()` checks that a sponsored skin only changes
  cosmetic genes (texture/effect/lore) and never rarity, temperament, or
  element — i.e. a $500K sponsorship literally cannot compile into a
  competitive advantage. This is the "sacred law" from the pitch,
  turned into a unit-testable invariant.

## 5. First 10 monetizable signals

Ordered roughly by how soon each becomes statistically usable — early
signals need only scan volume, later ones need the mission/choice
mechanics live.

1. **Category share of scans** — % of scans within a category
   (`BEVERAGE`) attributable to each brand. The most basic Discovery
   Report line, viable from week one of real usage.
2. **Repeat-scan affinity** — scans-per-UPC-per-player over time;
   distinguishes one-off curiosity from a loyalty signal.
3. **Cross-brand adjacency** — co-occurrence of brands within a single
   player's scan history (Monster scanners are Nx more likely to also
   scan Celsius), computed as a graph correlation over `Scan` join
   `Source`.
4. **First-discovery / rarity-seeking index** — rate at which a player
   pursues low-`globalScanCount` Sources; a proxy for novelty-seeking
   consumers, valuable for limited-run product launches.
5. **Choice-based preference (research missions)** — direct A/B/C/D
   preference data from `MissionResponse`, the highest-value signal
   because it answers a brand's specific question rather than an
   inferred one.
6. **Rejection/avoidance signal** — Sources scanned then marked `FOUND`/
   `SEEN_ELSEWHERE` rather than `OWN`/`WANT`, i.e. "encountered but not
   chosen" — the inverse of affinity, valuable for competitive
   displacement analysis.
7. **Scan cadence patterns** — day-of-week / time-of-day distribution
   per category, using only `timezoneOffsetMinutes` (never precise
   location) — useful for category-level "when does this get
   consumed" questions without touching anything COPPA/location-sensitive.
8. **New-product early-adopter index** — players whose scans
   disproportionately land on Sources within N days of `createdAt`,
   i.e. who finds new SKUs first — a recruitable cohort for future
   paid-panel products.
9. **Price-tier lean** — inferred from `Source.subcategory`/package-size
   metadata already resolved during lookup (premium vs. value SKU
   preference within a category), no extra collection required.
10. **Package-design preference** — the visual-preference variant of
    signal #5, run specifically as an image-option `ResearchMission`
    ("which of these 4 can designs reads as 'strongest'?") — this is
    the one that most directly replaces a traditional market-research
    panel.

All ten are aggregate/statistical outputs. None of them is "player X's
scan history" — that distinction is the entire point (see the original
pitch's OnStar/Kochava warning) and should stay a hard line in the
product, not just the marketing copy.

## 6. Estimated infrastructure cost at scale

Infra only — no headcount, no art budget, no customer acquisition. As
the original pitch notes, people/art/marketing will dominate total
spend; the point of this table is to confirm that *scan volume itself*
does not.

Assumptions: 20 scans/active-user/month, managed Postgres (e.g. RDS/
Neon/Supabase-tier pricing), a thin stateless API layer, Redis for
Source-lookup caching, and a UPC/product-data provider billed per
**unique** lookup (cache hit on every repeat scan of an already-seen
UPC — this is the flywheel from §3 paying off directly in the cost
model).

| Users (MAU) | Scans/mo | Unique-UPC lookups/mo (est., heavy overlap) | Postgres | Cache/API layer | Third-party UPC lookups | **Total infra/mo** |
|---|---|---|---|---|---|---|
| 1,000 | 20,000 | ~2,000 | $25 (shared/small instance) | $20 | ~$40 (@ ~$0.02/lookup) | **≈ $85–150** |
| 10,000 | 200,000 | ~8,000 | $100 | $60 | ~$160 | **≈ $350–600** |
| 100,000 | 2,000,000 | ~30,000 | $600 (dedicated, read replica) | $250 | ~$600 | **≈ $2,000–3,500** |
| 1,000,000 | 20,000,000 | ~100,000 | $3,000–5,000 (multi-instance) | $1,200 | ~$2,000 | **≈ $15,000–25,000** |

Two properties worth naming because they're the whole thesis of the
cost model, not just line items:
- **Unique-UPC lookups grow far sub-linearly with scan volume** — the
  product catalog saturates as the player base grows (this is the
  "players explore the global catalog for us" flywheel from the
  original pitch, showing up directly as a cost curve rather than a
  metaphor).
- **Specimen generation contributes ~$0 at every tier** — it's a hash
  and a modulo, run client-side; it does not appear as a line item
  because there is nothing to meter.

These numbers are directional infra estimates for planning, not a
vendor quote — real numbers depend on the UPC-data provider chosen and
negotiated volume pricing, which should be confirmed before the 100K+
tier is budgeted.

## 7. What must be proven before a brand writes the first $10K–$50K check

A brand's procurement/legal team will not fund "trust us, the graph is
good" — they need to see, in order:

1. **Data density in one real category.** ≥5,000 MAU sustaining ≥15
   scans/user/month in `BEVERAGE` for a continuous 60-day window. Below
   this, a single-brand Discovery Report is statistically thin and a
   buyer's research team will say so.
2. **Retention that proves the graph keeps growing, not just launched
   once.** A D30 retention benchmark (e.g. >20%) — evidence this is an
   ongoing behavioral dataset, not a one-time novelty spike that stops
   producing data the month after a marketing push.
3. **A real Discovery Report, built and shown before any pitch.** Pull
   actual §5 signals (#1–#4 at minimum) for one real beverage category
   from real usage data, formatted the way it would ship to a buyer.
   Selling the *idea* of the report is much weaker than handing over the
   report.
4. **One completed research-mission cycle end-to-end.** Run a real
   in-game A/B choice (signal #5 or #10) to ≥500 responses and show the
   turnaround time against a traditional panel — this is the concrete
   "2 weeks vs. 6 weeks, $0 recruiting cost vs. $30K recruiting cost"
   comparison that justifies the price.
5. **A written privacy/compliance posture**, not just a policy on a
   webpage: 13+ age gate at signup (`AgeGate.ADULT_OR_TEEN_13_PLUS` is
   already the only enum value in the schema — there is no code path
   that collects under-13 data), no PII in any brand-facing export, and
   a stated data-retention/anonymization policy. Brand legal teams will
   ask for this before anyone in procurement discusses price, especially
   post-FTC-v-Kochava.
6. **A named, scoped pilot offer**, not an open-ended platform pitch:
   "Give us 4 candidate package designs; we return preference data
   across N real category-engaged players within 2 weeks." A concrete,
   time-boxed, low-commitment ask is what turns a "sounds interesting"
   conversation into a signed $10–50K pilot — the full platform pitch
   comes after that pilot delivers.

If all six are true, the honest claim to a brand is no longer "we think
this could work" — it's "here is the report, here is who ran the last
one, here is what it costs, here is how fast the next one ships." That
is the point at which this stops being a clever idea and becomes a
venture-scale, brand-fundable ecosystem.
