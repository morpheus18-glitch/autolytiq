#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.env.ROOT_DIR ?? process.cwd();
const OUTDIR = path.join(ROOT, 'canon-audit');
fs.mkdirSync(OUTDIR, { recursive: true });

const CODE_DIRS = ['client/src','server','shared']
  .map(p => path.join(ROOT, p))
  .filter(p => fs.existsSync(p));

const CANON_HINTS = [
  'client/src/components/sidebar-manager.tsx',
  'client/src/components/collapsible-sidebar.tsx',
  'client/src/components/enterprise-header.tsx',
  'client/src/components/enhanced-work-deal.tsx',
  'client/src/pages/deal-desk.tsx',
  'server/routes.ts',
  'server/storage.ts',
  'shared/schema.ts',
].map(p => path.join(ROOT, p));

const IMPORT_RE = /(?:import\s+[^'"]*?from\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\))/g;
const LINK_RE   = /href\s*=\s*["']([^"' ]+)["']/g;
const ROUTER_RE = /router\.(push|replace)\(\s*["']([^"']+)["']\)/g;

function readFileSafe(p){ try { return fs.readFileSync(p,'utf8'); } catch { return ''; } }
function listAllFiles(dir) {
  const acc = [];
  const stack = [dir];
  const ig = new Set(['node_modules','.git','.next','dist','build','.turbo','.vercel','.venv','venv','coverage']);
  while (stack.length) {
    const cur = stack.pop();
    const ents = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of ents) {
      if (ig.has(e.name)) continue;
      const p = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else acc.push(p);
    }
  }
  return acc;
}
function isCode(p){ return /\.(tsx?|jsx|m?[jt]s)$/.test(p); }

function gitMtime(file) {
  try {
    const out = execSync(`git log -1 --pretty=format:%ct -- "${file}"`, { cwd: ROOT, stdio: ['ignore','pipe','ignore'] }).toString().trim();
    return out ? Number(out) : 0;
  } catch { return 0; }
}

function parseCanonicalFromArchitecture() {
  const archPaths = ['ARCHITECTURE.md','AutolytiQ/ARCHITECTURE.md'].map(p=>path.join(ROOT,p));
  const found = new Set();
  for (const p of archPaths) {
    if (!fs.existsSync(p)) continue;
    const txt = fs.readFileSync(p,'utf8');
    const lines = txt.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/CANONICAL:\s*(.+)$/i);
      if (m) {
        let rel = m[1].trim().replace(/^`|`$/g,'');
        if (!rel.startsWith('client') && !rel.startsWith('server') && !rel.startsWith('shared')) continue;
        found.add(path.join(ROOT, rel));
      }
    }
  }
  return Array.from(found);
}

const files = CODE_DIRS.flatMap(listAllFiles).filter(isCode);

const graph = new Map();
const indeg = new Map();
const byBase = new Map();

function resolveImport(fromFile, spec) {
  if (spec.startsWith('.') || spec.startsWith('/')) {
    const base = path.resolve(path.dirname(fromFile), spec);
    const tryExt = ['','.ts','.tsx','.js','.jsx','.mjs','.cjs'];
    for (const ext of tryExt) {
      const cand = base + ext;
      if (fs.existsSync(cand)) return cand;
    }
    for (const ext of tryExt) {
      const cand = path.join(base, 'index' + ext);
      if (fs.existsSync(cand)) return cand;
    }
  }
  if (spec.startsWith('@/')) {
    const p = spec.replace(/^@\/?/, 'client/src/');
    const base = path.join(ROOT, p);
    const tryExt = ['','.ts','.tsx','.js','.jsx'];
    for (const ext of tryExt) {
      const cand = base + ext;
      if (fs.existsSync(cand)) return cand;
    }
  }
  return null;
}

for (const f of files) {
  const txt = readFileSafe(f);
  const set = new Set();
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(txt))) {
    const spec = (m[1] || m[2] || '').trim();
    if (!spec) continue;
    const dep = resolveImport(f, spec);
    if (dep) {
      set.add(dep);
      indeg.set(dep, (indeg.get(dep) ?? 0) + 1);
    }
  }
  graph.set(f, set);
  const base = path.basename(f);
  if (!byBase.has(base)) byBase.set(base, []);
  byBase.get(base).push(f);
}

function hrefRefs() {
  const refs = new Map();
  for (const f of files) {
    const txt = readFileSafe(f);
    let c = 0;
    LINK_RE.lastIndex = 0;
    while (LINK_RE.exec(txt)) c++;
    ROUTER_RE.lastIndex = 0;
    while (ROUTER_RE.exec(txt)) c++;
    if (c) refs.set(f, c);
  }
  return refs;
}
const hrefMap = hrefRefs();

function scoreFor(file) {
  const indegree = indeg.get(file) ?? 0;
  const hrefs = hrefMap.get(file) ?? 0;
  const mtime = gitMtime(file);
  const ageDays = mtime ? (Date.now()/1000 - mtime) / 86400 : 9999;
  const ageScore = Math.max(0, 1 - (ageDays / 180));
  const base = path.basename(file);
  const siblings = (byBase.get(base) ?? []).length;
  const dupePenalty = Math.max(0, siblings - 1);
  const s = (indegree * 1.5) + (hrefs * 1.0) + (ageScore * 10) - (dupePenalty * 2);
  return { score: s, indegree, hrefs, ageDays, dupePenalty };
}

function classify(file) {
  const { score, dupePenalty } = scoreFor(file);
  if (score >= 12 && dupePenalty === 0) return 'KEEP';
  if (score >= 8 && dupePenalty <= 2) return 'FIX';
  if (dupePenalty >= 3 && score < 8) return 'MERGE';
  if (score < 4) return 'RETIRE';
  return 'REVIEW';
}

function rowsFor(file) {
  const base = path.basename(file);
  const peers = (byBase.get(base) ?? []).sort();
  const all = Array.from(new Set([file, ...peers]));
  return all.map(f => ({
    file: path.relative(ROOT, f),
    ...(scoreFor(f)),
    status: classify(f)
  }));
}

const archCanon = parseCanonicalFromArchitecture();
const canonSet = new Set([...CANON_HINTS, ...archCanon].filter(fs.existsSync));

const groups = [];
const seen = new Set();
for (const c of canonSet) {
  if (!fs.existsSync(c)) continue;
  const base = path.basename(c);
  const peers = (byBase.get(base) ?? []).sort();
  const key = base + '::' + peers.length;
  if (seen.has(key)) continue;
  seen.add(key);
  const rows = rowsFor(c).sort((a,b)=>b.score-a.score);
  groups.push({ base, rows });
}

for (const [base, arr] of byBase.entries()) {
  if (arr.length < 2) continue;
  const key = base + '::' + arr.length;
  if (seen.has(key)) continue;
  seen.add(key);
  const rows = arr.map(f => ({
    file: path.relative(ROOT, f),
    ...(scoreFor(f)),
    status: classify(f)
  })).sort((a,b)=>b.score-a.score);
  groups.push({ base, rows });
}

fs.writeFileSync(path.join(OUTDIR, 'details.json'), JSON.stringify({ groups }, null, 2));

let md = [];
md.push('# Canonical Audit Report\n');
md.push('_Higher score = stronger canonical candidate. Imports (1.5x), href/router (1x), recency (≤6mo), minus duplicate penalty._\n');

for (const g of groups.sort((a,b)=>a.base.localeCompare(b.base))) {
  md.push(`\n## ${g.base}\n`);
  md.push('| file | score | imports | hrefs | age_days | dupes | status |');
  md.push('|---|---:|---:|---:|---:|---:|---|');
  for (const r of g.rows) {
    md.push(`| ${r.file} | ${r.score.toFixed(1)} | ${r.indegree} | ${r.hrefs} | ${r.ageDays.toFixed(0)} | ${r.dupePenalty} | ${r.status} |`);
  }
  const top = g.rows[0];
  md.push(`\n**Recommendation:** \`${top.file}\` → likely canonical.`);
}

fs.writeFileSync(path.join(OUTDIR, 'canon_report.md'), md.join('\n'));
console.log('Wrote:', path.join(OUTDIR, 'canon_report.md'));
console.log('Wrote:', path.join(OUTDIR, 'details.json'));
