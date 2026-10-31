import { buildIndex, computeKinship } from './kinship';
import { catName, type Cat } from './types';
import type { RelKind } from './ops';

export interface RelationWarning { blocked: boolean; title: string; message: string; }
export function checkRelation(cats: Cat[], id: string, kind: RelKind, other: string): RelationWarning | null {
  const idx = buildIndex(cats);
  const a = idx.byId.get(id), b = idx.byId.get(other);
  if (!a || !b) return { blocked: true, title: 'Missing cat', message: 'Choose two cats in this tree.' };
  if (id === other) return { blocked: true, title: 'Self connection', message: 'A cat cannot be connected to itself.' };
  const existing = { parents: idx.parents, kits: idx.children, fosterParents: idx.fosterParents, fosterKits: idx.fosterKits, mates: idx.mates, mentors: idx.mentors, apprentices: idx.apprentices }[kind];
  if (existing(id).includes(other)) return { blocked: true, title: 'Already connected', message: `${catName(a)} and ${catName(b)} already have this relationship. No duplicate was added.` };
  const ancestors = (start: string, foster = false) => {
    const found = new Set<string>();
    const walk = (v: string) => {
      for (const p of [...idx.parents(v), ...(foster ? idx.fosterParents(v) : [])]) {
        if (found.has(p)) continue;
        found.add(p); walk(p);
      }
    };
    walk(start); return found;
  };
  if (['parents', 'kits', 'fosterParents', 'fosterKits'].includes(kind)) {
    const child = kind === 'parents' || kind === 'fosterParents' ? id : other;
    const parent = child === id ? other : id;
    if (ancestors(parent, true).has(child)) return { blocked: true, title: 'Generational loop prevented', message: 'That cat is already a descendant. This connection would make a cat its own ancestor. Check the parent and kit direction.' };
    if ((kind === 'parents' || kind === 'kits') && idx.parents(child).length >= 2) return { blocked: false, title: 'More than two biological parents', message: 'This cat already has two parents. Consider using a foster-parent connection instead.' };
  }
  if (kind === 'mates') {
    const aa = ancestors(id), bb = ancestors(other);
    const shared = [...aa].filter(p => bb.has(p));
    if (aa.has(other) || bb.has(id) || shared.length) {
      const relation = computeKinship(cats, id).labels.get(other)?.join(', ') ?? 'Shared ancestry';
      const names = shared.map(p => idx.byId.get(p)).filter((c): c is Cat => !!c).map(catName);
      return { blocked: false, title: 'Related mates', message: `${relation}. ${names.length ? `Common ancestors: ${names.join(', ')}.` : 'These cats are in a direct ancestor–descendant line.'} Confirm the genealogy before continuing.` };
    }
    if (idx.mates(id).length || idx.mates(other).length) return { blocked: false, title: 'Multiple mate branches', message: 'One cat already has a mate. The tree will automatically separate family branches; hiding mentorship and foster lines can make descent clearer.' };
    if (idx.parents(id).length && idx.parents(other).length) return { blocked: false, title: 'Joining two family branches', message: 'Both cats have ancestry. Their families will be placed on outward flanks automatically to keep the central lineage clear.' };
  }
  if ((kind === 'mentors' || kind === 'apprentices') && (kind === 'mentors' ? idx.mentors(other).includes(id) : idx.mentors(id).includes(other))) return { blocked: false, title: 'Reciprocal mentorship', message: 'This creates mentorship in both directions. Check the life stages or reverse the connection if needed.' };
  return null;
}