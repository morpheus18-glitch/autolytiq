import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chokidar, { type FSWatcher } from 'chokidar';

export interface ScoringConfig {
  objectives: {
    gross_weight: number;
    close_weight: number;
    approval_weight: number;
    payment_weight: number;
  };
  normalization: {
    gross: {
      baseline_avg: number;
      baseline_std: number;
      clip_min: number;
      clip_max: number;
    };
    close_probability: {
      clip_min: number;
      clip_max: number;
    };
    approval_probability: {
      clip_min: number;
      clip_max: number;
    };
    payment: {
      target_payment: number;
      soft_cap: number;
      hard_cap: number;
    };
  };
  constraints: {
    global: {
      max_ltv: number;
      max_pti: number;
      min_gross: number;
      terms_allowed: number[];
      apr_bounds: { min: number; max: number };
    };
    search: {
      price_delta_abs: number;
      price_step: number;
      down_step: number;
      term_candidates: number[];
      consider_rebates: boolean;
      consider_trade_adjustments: boolean;
    };
  };
  policy: {
    tie_breakers: string[];
    warnings: {
      low_gross_threshold: number;
      high_payment_threshold: number;
      risky_profile_threshold: number;
    };
  };
  counter_strategy?: Record<string, unknown>;
}

const CONFIG_PATH = process.env.SCORING_CONFIG_PATH ?? path.resolve(process.cwd(), 'ml_backend/config/scoring.yaml');

let currentConfig: ScoringConfig | undefined;
let watcher: FSWatcher | undefined;

function normalizeWeights(config: ScoringConfig): ScoringConfig {
  const cloned = structuredClone(config);
  const weights = cloned.objectives;
  const sum = weights.gross_weight + weights.close_weight + weights.approval_weight + weights.payment_weight;
  if (Math.abs(sum - 1) < 1e-6) {
    return cloned;
  }
  if (Math.abs(sum - 100) < 1e-6) {
    weights.gross_weight /= 100;
    weights.close_weight /= 100;
    weights.approval_weight /= 100;
    weights.payment_weight /= 100;
    return cloned;
  }
  throw new Error(`Invalid scoring weights; sum=${sum}`);
}

function loadFromDisk(): ScoringConfig {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const parsed = yaml.load(raw) as ScoringConfig;
  return normalizeWeights(parsed);
}

export function getScoringConfig(): ScoringConfig {
  if (!currentConfig) {
    currentConfig = loadFromDisk();
  }
  return currentConfig;
}

export function watchScoringConfig(onReload?: (config: ScoringConfig) => void): FSWatcher {
  if (watcher) {
    return watcher;
  }

  watcher = chokidar.watch(CONFIG_PATH, { ignoreInitial: true });
  watcher.on('change', () => {
    try {
      currentConfig = loadFromDisk();
      onReload?.(currentConfig);
      // eslint-disable-next-line no-console
      console.log(`[scoring] reloaded ${CONFIG_PATH}`);
    } catch (error) {
      console.error('[scoring] reload failed:', error);
    }
  });
  return watcher;
}
