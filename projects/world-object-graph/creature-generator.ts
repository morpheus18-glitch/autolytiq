/**
 * Unmapped — deterministic specimen generator.
 *
 * A "specimen" (creature) is never stored as an asset. It is derived on
 * demand from a seed hash of (UPC + game world + genome version), then
 * rendered client-side from a fixed library of modular parts. This keeps
 * marginal generation cost at effectively zero regardless of scan volume.
 *
 * Re-running generateSpecimen() with the same inputs always yields the
 * same genome, so nothing about a specimen needs to be persisted beyond
 * { upc, gameWorld, genomeVersion, discoveredAt } — the rest is
 * reconstructed from the seed every time the client needs it.
 */

import { createHash } from "node:crypto";

export const GENOME_VERSION = "v1";
export const GAME_WORLD = "unmapped";

// Sizes of the modular art library. These are counts of pre-built,
// artist-authored parts — not generated per scan. Combinatorially:
// 100 * 100 * 50 * 80 * 50 * 100 * 40 * 60 species ≈ 9.6e13 possible
// specimens from a fixed, one-time art budget.
export const PART_LIBRARY_SIZES = {
  species: 60,
  body: 100,
  head: 100,
  tail: 50,
  eyes: 80,
  horn: 50,
  texture: 100,
  effect: 40,
} as const;

export type RarityTier =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC";

// Cumulative thresholds out of 10,000. Order matters: first match wins.
const RARITY_THRESHOLDS: Array<{ tier: RarityTier; upTo: number }> = [
  { tier: "COMMON", upTo: 7000 }, // 70.00%
  { tier: "UNCOMMON", upTo: 9000 }, // 20.00%
  { tier: "RARE", upTo: 9700 }, // 7.00%
  { tier: "EPIC", upTo: 9950 }, // 2.50%
  { tier: "LEGENDARY", upTo: 9990 }, // 0.40%
  { tier: "MYTHIC", upTo: 10000 }, // 0.10%
];

export interface Genome {
  seedHex: string;
  species: number;
  body: number;
  head: number;
  tail: number;
  eyes: number;
  horn: number;
  texture: number;
  effect: number;
  temperament: number; // 0-99, drives idle animation / AI flavor text
  element: number; // 0-7, one of a fixed elemental typing set
  rarity: RarityTier;
  rarityRoll: number; // 0-9999, kept for transparency/audit
  hiddenTrait: boolean; // ~1/512 chance, cosmetic-only easter egg
}

/**
 * Byte offsets into the 32-byte SHA-256 digest used for each gene. Two
 * bytes per gene keeps each draw's bias from a `% modulus` reduction
 * negligible for every modulus used here (all well under 2^16).
 */
const GENE_OFFSETS = {
  species: 0,
  body: 2,
  head: 4,
  tail: 6,
  eyes: 8,
  horn: 10,
  texture: 12,
  effect: 14,
  temperament: 16,
  element: 18,
  rarityRoll: 20,
  hiddenTraitRoll: 22,
} as const;

function computeSeed(upc: string, gameWorld: string, version: string): Buffer {
  return createHash("sha256")
    .update(`${upc}|${gameWorld}|${version}`)
    .digest();
}

function readGene(seed: Buffer, offset: number, modulus: number): number {
  return seed.readUInt16BE(offset) % modulus;
}

function resolveRarity(roll: number): RarityTier {
  for (const { tier, upTo } of RARITY_THRESHOLDS) {
    if (roll < upTo) return tier;
  }
  return "MYTHIC"; // unreachable given roll is always < 10000
}

/**
 * Deterministically derive a specimen's full genome from a UPC.
 * Same (upc, gameWorld, genomeVersion) in => byte-identical genome out,
 * on any device, forever — until genomeVersion bumps (a deliberate
 * "re-roll the universe" lever for balance patches).
 */
export function generateSpecimen(
  upc: string,
  gameWorld: string = GAME_WORLD,
  genomeVersion: string = GENOME_VERSION,
): Genome {
  const seed = computeSeed(upc, gameWorld, genomeVersion);
  const rarityRoll = readGene(seed, GENE_OFFSETS.rarityRoll, 10_000);

  return {
    seedHex: seed.toString("hex"),
    species: readGene(seed, GENE_OFFSETS.species, PART_LIBRARY_SIZES.species),
    body: readGene(seed, GENE_OFFSETS.body, PART_LIBRARY_SIZES.body),
    head: readGene(seed, GENE_OFFSETS.head, PART_LIBRARY_SIZES.head),
    tail: readGene(seed, GENE_OFFSETS.tail, PART_LIBRARY_SIZES.tail),
    eyes: readGene(seed, GENE_OFFSETS.eyes, PART_LIBRARY_SIZES.eyes),
    horn: readGene(seed, GENE_OFFSETS.horn, PART_LIBRARY_SIZES.horn),
    texture: readGene(seed, GENE_OFFSETS.texture, PART_LIBRARY_SIZES.texture),
    effect: readGene(seed, GENE_OFFSETS.effect, PART_LIBRARY_SIZES.effect),
    temperament: readGene(seed, GENE_OFFSETS.temperament, 100),
    element: readGene(seed, GENE_OFFSETS.element, 8),
    rarity: resolveRarity(rarityRoll),
    rarityRoll,
    hiddenTrait: readGene(seed, GENE_OFFSETS.hiddenTraitRoll, 512) === 0,
  };
}

/**
 * A sponsor's UPC (e.g. a limited-run Monster Energy design) may only
 * change cosmetics — texture/effect/lore skin — never the rarity roll
 * or any stat-bearing gene. This asserts that invariant so a sponsorship
 * deal can never accidentally ship pay-to-win.
 */
export function assertSponsorSafe(baseline: Genome, sponsored: Genome): void {
  if (
    baseline.rarity !== sponsored.rarity ||
    baseline.temperament !== sponsored.temperament ||
    baseline.element !== sponsored.element
  ) {
    throw new Error(
      "Sponsor skin altered a competitive gene — sponsorship must be cosmetic-only.",
    );
  }
}
