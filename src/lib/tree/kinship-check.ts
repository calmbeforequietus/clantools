import type { Cat } from './types';

/** Biological ancestors with their generation distance (1 = parent). */
export function ancestorDepths(cats: Cat[], id: string) {
  const byId = new Map(cats.map(c => [c.id, c]));
  const out = new Map<string, number>();
  let frontier = [id], depth = 0;
  while (frontier.length && depth < 30) {
    depth++;
    const next: string[] = [];
    for (const f of frontier) for (const p of byId.get(f)?.parents ?? []) {
      if (!byId.has(p) || out.has(p) || p === id) continue;
      out.set(p, depth); next.push(p);
    }
    frontier = next;
  }
  return out;
}

const ordinal = (n: number) => ['first', 'second', 'third', 'fourth', 'fifth'][n - 1] ?? `${n}th`;
const greats = (n: number) => (n > 0 ? 'great-'.repeat(n) : '');
const removed = (n: number) => (n === 0 ? '' : n === 1 ? ' once removed' : n === 2 ? ' twice removed' : ` ${n} times removed`);

export interface KinshipCheck {
  label: string;
  closeness: 'none' | 'distant' | 'close';
  shared: { id: string; fromA: number; fromB: number }[];
  highlight: Set<string>;
  mates: boolean;
}

/** Describe how cat B relates to cat A by blood. */
export function checkKinship(cats: Cat[], a: string, b: string): KinshipCheck {
  const ca = ancestorDepths(cats, a), cb = ancestorDepths(cats, b);
  const byId = new Map(cats.map(c => [c.id, c]));
  const mates = !!(byId.get(a)?.mates.includes(b) || byId.get(b)?.mates.includes(a));
  const highlight = new Set([a, b]);
  if (a === b) return { label: 'Same cat', closeness: 'none', shared: [], highlight, mates };
  const direct = (anc: Map<string, number>, other: string, up: boolean) => {
    const d = anc.get(other);
    if (!d) return null;
    const word = up ? (d === 1 ? 'Parent' : d === 2 ? 'Grandparent' : `${greats(d - 2)}grandparent`) : (d === 1 ? 'Kit' : d === 2 ? 'Grandkit' : `${greats(d - 2)}grandkit`);
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  const up = direct(ca, b, true);
  if (up) return { label: `${up} of the first cat`, closeness: 'close', shared: [{ id: b, fromA: ca.get(b)!, fromB: 0 }], highlight, mates };
  const down = direct(cb, a, false);
  if (down) return { label: `${down} of the first cat`, closeness: 'close', shared: [{ id: a, fromA: 0, fromB: cb.get(a)! }], highlight, mates };

  const all = [...ca].filter(([id]) => cb.has(id)).map(([id, fromA]) => ({ id, fromA, fromB: cb.get(id)! }));
  // Keep only the nearest shared ancestors, not their own ancestors.
  const shared = all.filter(s => !all.some(o => o !== s && (ancestorDepths(cats, o.id).has(s.id))));
  shared.forEach(s => highlight.add(s.id));
  if (!shared.length) return { label: 'Not related by blood', closeness: 'none', shared, highlight, mates };
  const best = shared.reduce((m, s) => (s.fromA + s.fromB < m.fromA + m.fromB ? s : m));
  const lo = Math.min(best.fromA, best.fromB), hi = Math.max(best.fromA, best.fromB);
  let label: string;
  if (lo === 1 && hi === 1) {
    const pa = byId.get(a)?.parents ?? [], pb = byId.get(b)?.parents ?? [];
    label = pa.length >= 2 && pa.every(p => pb.includes(p)) ? 'Full siblings' : 'Half-siblings';
  } else if (lo === 1) {
    const g = hi - 2;
    label = best.fromA === 1 ? `${greats(g)}${g ? '' : ''}niece/nephew of the first cat` : `${greats(g)}aunt/uncle of the first cat`;
    label = label.charAt(0).toUpperCase() + label.slice(1);
  } else {
    label = `${ordinal(lo - 1).replace(/^./, c => c.toUpperCase())} cousins${removed(hi - lo)}`;
  }
  return { label, closeness: lo <= 2 ? 'close' : 'distant', shared, highlight, mates };
}
