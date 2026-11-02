import { NODE_H, NODE_W, type Positions } from './layout';
import { buildIndex } from './kinship';
import type { Cat } from './types';

export type Point = { x: number; y: number };

export function catsInBox(positions: Positions, start: Point, end: Point): string[] {
  const left = Math.min(start.x, end.x), right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y), bottom = Math.max(start.y, end.y);
  return [...positions].filter(([, p]) => p.x + NODE_W / 2 >= left && p.x - NODE_W / 2 <= right && p.y + NODE_H >= top && p.y <= bottom).map(([id]) => id);
}

/** Include the complete mate units, matching automatic layout's indivisible units. */
export function movingCatIds(cats: Cat[], selected: Iterable<string>): Set<string> {
  const idx = buildIndex(cats), ids = new Set<string>();
  const visit = (id: string) => {
    if (ids.has(id) || !idx.byId.has(id)) return;
    ids.add(id); idx.mates(id).forEach(visit);
  };
  for (const id of selected) visit(id);
  return ids;
}

export function translateCats(positions: Positions, ids: Iterable<string>, delta: Point): Positions {
  const next = new Map(positions);
  for (const id of ids) {
    const p = positions.get(id);
    if (p) next.set(id, { x: p.x + delta.x, y: p.y + delta.y });
  }
  return next;
}