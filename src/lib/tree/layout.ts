import { buildIndex } from './kinship';
import type { Cat } from './types';

export const NODE_W = 140;
export const NODE_H = 140;
export const AVATAR = 68;
export const AVATAR_TOP = 14;
export const AVATAR_CY = AVATAR_TOP + AVATAR / 2;
export const GAP_X = 30;
export const GAP_Y = 96;
const W = NODE_W + GAP_X;
export type Positions = Map<string, { x: number; y: number }>;

export function computeLayout(cats: Cat[]): Positions {
  const idx = buildIndex(cats);
  // Mate-connected units are indivisible: joining two bloodlines never inserts
  // unrelated cats between partners. Parents determine the unit's generation.
  const seen = new Set<string>();
  const units: { ids: string[]; generation: number; x: number }[] = [];
  const unitOf = new Map<string, number>();
  for (const cat of cats) {
    if (seen.has(cat.id)) continue;
    const ids: string[] = [];
    const take = (id: string) => { if (seen.has(id)) return; seen.add(id); ids.push(id); idx.mates(id).forEach(take); };
    take(cat.id);
    ids.forEach(id => unitOf.set(id, units.length));
    units.push({ ids, generation: 0, x: units.length * W });
  }
  const parents = (id: string) => idx.parents(id).length ? idx.parents(id) : idx.fosterParents(id);
  const cache = new Map<number, number>();
  const generation = (u: number, visiting: Set<number>): number => {
    const stored = cache.get(u);
    if (stored !== undefined) return stored;
    if (visiting.has(u)) return 0;
    const unit = units[u];
    if (!unit) return 0;
    visiting.add(u);
    let g = 0;
    for (const id of unit.ids) for (const p of parents(id)) {
      const pu = unitOf.get(p);
      if (pu !== undefined && pu !== u) g = Math.max(g, generation(pu, visiting) + 1);
    }
    visiting.delete(u); cache.set(u, g); return g;
  };
  const rows = new Map<number, typeof units>();
  units.forEach((u, i) => { u.generation = generation(i, new Set()); const row = rows.get(u.generation) ?? []; row.push(u); rows.set(u.generation, row); });
  const levels = [...rows.keys()].sort((a, b) => a - b);
  const positions: Positions = new Map();
  type Unit = typeof units[number];
  /** Places a row in its current order as close as possible (least squares) to each unit's
   *  desired center while keeping spacing: isotonic regression (pool-adjacent-violators). */
  const pack = (row: Unit[], targets?: Map<Unit, number>, weights?: Map<Unit, number>) => {
    let c = 0;
    const items = row.map(unit => {
      const width = (unit.ids.length - 1) * W;
      const desired = (targets?.get(unit) ?? unit.x) - width / 2;
      const it = { unit, width, offset: c, y: desired - c, w: weights?.get(unit) ?? 1 };
      c += width + W + GAP_X;
      return it;
    });
    const blocks: { sum: number; w: number; n: number }[] = [];
    for (const it of items) {
      blocks.push({ sum: it.y * it.w, w: it.w, n: 1 });
      while (blocks.length > 1) {
        const last = blocks[blocks.length - 1]!, prev = blocks[blocks.length - 2]!;
        if (prev.sum / prev.w <= last.sum / last.w) break;
        blocks.pop(); prev.sum += last.sum; prev.w += last.w; prev.n += last.n;
      }
    }
    let k = 0;
    for (const bl of blocks) for (let j = 0; j < bl.n; j++, k++) {
      const it = items[k]!; const start = bl.sum / bl.w + it.offset;
      it.unit.ids.forEach((id, i) => positions.set(id, { x: start + i * W, y: it.unit.generation * (NODE_H + GAP_Y) }));
      it.unit.x = start + it.width / 2;
    }
  };
  levels.forEach(g => pack(rows.get(g) ?? []));
  const mean = (ids: string[]) => { const ps = ids.map(id => positions.get(id)).filter((p): p is { x: number; y: number } => !!p); return ps.length ? ps.reduce((sum, p) => sum + p.x, 0) / ps.length : undefined; };
  // Alternating sweeps pull every family unit toward both its parents and its kits,
  // so parents sit over their children instead of drifting across the canvas.
  const kidsOf = (id: string) => [...idx.children(id), ...idx.fosterKits(id)];
  for (let sweep = 0; sweep < 24; sweep++) {
    const down = sweep % 2 === 0;
    for (const g of down ? levels : [...levels].reverse()) {
      const row = rows.get(g) ?? [];
      const targets = new Map<Unit, number>(), weights = new Map<Unit, number>();
      for (const unit of row) {
        const up = unit.ids.flatMap(parents), dn = unit.ids.flatMap(kidsOf);
        const mu = mean(up), md = mean(dn);
        const primary = down ? mu : md, secondary = down ? md : mu;
        const t = primary !== undefined && secondary !== undefined ? (primary * 2 + secondary) / 3 : primary ?? secondary;
        targets.set(unit, t ?? unit.x);
        weights.set(unit, t === undefined ? 0.05 : 1 + up.length + dn.length);
        if (down) unit.ids.sort((a, b) => (mean(parents(a)) ?? t ?? unit.x) - (mean(parents(b)) ?? t ?? unit.x));
      }
      row.sort((a, b) => (targets.get(a) ?? a.x) - (targets.get(b) ?? b.x) || a.ids.flatMap(parents).sort().join('|').localeCompare(b.ids.flatMap(parents).sort().join('|')));
      pack(row, targets, weights);
    }
  }
  // Mentor-only roots sit beside the main founders, not far away at an old sweep position.
  const roots = rows.get(0) ?? [];
  const targets = new Map<typeof units[number], number>();
  for (const unit of roots) targets.set(unit, mean(unit.ids.flatMap(id => [...idx.children(id), ...idx.apprentices(id)])) ?? unit.x);
  roots.sort((a, b) => (targets.get(a) ?? a.x) - (targets.get(b) ?? b.x));
  pack(roots, targets);
  for (const root of roots) {
    const descendants = root.ids.flatMap(id => idx.children(id));
    if (!descendants.length) continue;
    const target = mean(descendants);
    if (target === undefined) continue;
    const desired = target - (root.ids.length - 1) * W / 2;
    const others = [...positions.entries()].filter(([id, p]) => p.y === 0 && !root.ids.includes(id));
    if (root.ids.every((_, i) => others.every(([, p]) => Math.abs(desired + i * W - p.x) >= W))) {
      root.ids.forEach((id, i) => positions.set(id, { x: desired + i * W, y: 0 }));
    }
  }
  return positions;
}

export function bounds(pos: Positions, pad = 60) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pos.forEach(({ x, y }) => {
    minX = Math.min(minX, x - NODE_W / 2); maxX = Math.max(maxX, x + NODE_W / 2);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y + NODE_H);
  });
  if (!Number.isFinite(minX)) return { minX: -200, minY: -200, maxX: 200, maxY: 200 };
  return { minX: minX - pad, minY: minY - pad - 24, maxX: maxX + pad, maxY: maxY + pad };
}
