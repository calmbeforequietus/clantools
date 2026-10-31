import { buildIndex } from "./kinship";
import type { Cat } from "./types";

export const NODE_W = 140;
export const NODE_H = 128;
export const AVATAR = 68;
export const GAP_X = 44;
export const GAP_Y = 110;
const W = NODE_W + GAP_X;

export type Positions = Map<string, { x: number; y: number }>; // x = center, y = top

export function computeLayout(cats: Cat[]): Positions {
  const idx = buildIndex(cats);
  const base = new Map<string, number>();
  let gen = new Map<string, number>();
  for (let iter = 0; iter < 40; iter++) {
    gen = new Map();
    const visiting = new Set<string>();
    const g = (id: string): number => {
      if (gen.has(id)) return gen.get(id)!;
      if (visiting.has(id)) return 0;
      visiting.add(id);
      let ps = idx.parents(id);
      if (!ps.length) ps = idx.fosterParents(id);
      let v = base.get(id) ?? 0;
      for (const p of ps) v = Math.max(v, g(p) + 1);
      visiting.delete(id);
      gen.set(id, v);
      return v;
    };
    cats.forEach((c) => g(c.id));
    let changed = false;
    for (const c of cats)
      for (const m of idx.mates(c.id)) {
        const gm = gen.get(m)!;
        if (gm > gen.get(c.id)! && (base.get(c.id) ?? 0) < gm) {
          base.set(c.id, gm);
          changed = true;
        }
      }
    if (!changed) break;
  }

  const rows = new Map<number, Cat[]>();
  cats.forEach((c) => {
    const r = gen.get(c.id)!;
    (rows.get(r) ?? rows.set(r, []).get(r)!).push(c);
  });
  const order = new Map(cats.map((c, i) => [c.id, i]));
  const pos: Positions = new Map();

  for (const r of [...rows.keys()].sort((a, b) => a - b)) {
    const row = rows.get(r)!;
    const inRow = new Set(row.map((c) => c.id));
    const famKey = new Map<string, string>();
    const key = new Map<string, number>();
    for (const c of row) {
      let ps = idx.parents(c.id).filter((p) => pos.has(p));
      if (!ps.length) ps = idx.fosterParents(c.id).filter((p) => pos.has(p));
      if (ps.length) {
        key.set(c.id, ps.reduce((s, p) => s + pos.get(p)!.x, 0) / ps.length);
        famKey.set(c.id, [...ps].sort().join("|"));
      }
    }
    for (const c of row)
      if (!key.has(c.id)) {
        const mk = idx.mates(c.id).map((m) => key.get(m)).filter((v): v is number => v !== undefined);
        key.set(c.id, mk.length ? mk[0] + 0.1 : 1e9 + order.get(c.id)!);
      }
    const sorted = [...row].sort((a, b) => key.get(a.id)! - key.get(b.id)! || order.get(a.id)! - order.get(b.id)!);

    // Build blocks: siblings share a family key; mates attach to their partner's block.
    const placed = new Set<string>();
    const blocks: { ids: string[]; desired: number | null }[] = [];
    for (const c of sorted) {
      if (placed.has(c.id)) continue;
      const fk = famKey.get(c.id);
      const last = blocks[blocks.length - 1];
      const ids: string[] = [];
      const take = (id: string) => {
        if (placed.has(id)) return;
        placed.add(id);
        ids.push(id);
        idx.mates(id).forEach((m) => inRow.has(m) && !famKey.has(m) && take(m));
      };
      take(c.id);
      if (fk && last && last.ids.some((i) => famKey.get(i) === fk)) last.ids.push(...ids);
      else blocks.push({ ids, desired: key.get(c.id)! < 1e8 ? key.get(c.id)! : null });
    }
    let cursor = -Infinity;
    for (const b of blocks) {
      const start = b.desired === null ? cursor + W : b.desired - ((b.ids.length - 1) * W) / 2;
      let x = Math.max(cursor + W, start === -Infinity ? 0 : start);
      if (!Number.isFinite(x)) x = 0;
      for (const id of b.ids) {
        pos.set(id, { x, y: r * (NODE_H + GAP_Y) });
        cursor = x;
        x += W;
      }
    }
  }
  return pos;
}

export function bounds(pos: Positions, pad = 60) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pos.forEach(({ x, y }) => {
    minX = Math.min(minX, x - NODE_W / 2);
    maxX = Math.max(maxX, x + NODE_W / 2);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + NODE_H);
  });
  if (!Number.isFinite(minX)) return { minX: -200, minY: -200, maxX: 200, maxY: 200 };
  return { minX: minX - pad, minY: minY - pad - 24, maxX: maxX + pad, maxY: maxY + pad };
}
