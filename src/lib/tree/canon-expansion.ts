import { canonCats } from './canon';
import type { Cat, Tree } from './types';

export const CANON_REVISION = 1;
const relationships = ['parents', 'fosterParents', 'mates', 'mentors'] as const;

/** Apply only the new branch delta, once; never restore removed old cats or links. */
export function expandCanonTree(tree: Tree, previousIds: ReadonlySet<string>, shared: Cat[] = []): Tree {
  if ((tree.canonRevision ?? 0) >= CANON_REVISION) return tree;
  const canon = canonCats();
  const saved = new Map(shared.map(cat => [cat.id, cat]));
  const localIds = new Set(tree.cats.map(cat => cat.id));
  const additions = canon.filter(cat => !previousIds.has(cat.id) && !localIds.has(cat.id));
  const addedIds = new Set(additions.map(cat => cat.id));
  const present = new Set([...localIds, ...addedIds]);
  const defaults = new Map(canon.map(cat => [cat.id, cat]));
  const cats = [...tree.cats, ...additions.map(cat => ({ ...cat, ...saved.get(cat.id) }))].map(cat => {
    const original = defaults.get(cat.id);
    const patch: Partial<Cat> = {};
    for (const kind of relationships) {
      const extra = (original?.[kind] ?? []).filter(id => present.has(id) && (addedIds.has(cat.id) || addedIds.has(id)));
      patch[kind] = [...new Set([...cat[kind], ...extra])].filter(id => present.has(id));
    }
    return { ...cat, ...patch };
  });
  return { ...tree, cats, canonRevision: CANON_REVISION, updatedAt: Date.now() };
}