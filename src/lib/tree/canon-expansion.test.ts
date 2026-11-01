import { expect, it } from 'vitest';
import { canonCats, canonTree, LEGACY_CANON_IDS } from './canon';
import { expandCanonTree } from './canon-expansion';
import { factoryStore, refineStore } from './ops';

const legacy = () => ({ ...canonTree('legacy'), canonRevision: 0, cats: canonCats().filter(cat => LEGACY_CANON_IDS.has(cat.id)) });

it('adds new branches once without replacing edited profiles, removed old cats or relationships', () => {
  const tree = legacy();
  tree.cats = tree.cats.filter(cat => cat.id !== 'princess').map(cat => cat.id === 'firestar' ? { ...cat, summary: 'My Firestar', mates: [] } : cat);
  const next = expandCanonTree(tree, LEGACY_CANON_IDS);
  expect(next.cats.length).toBeGreaterThan(tree.cats.length);
  expect(next.cats.find(cat => cat.id === 'firestar')?.summary).toBe('My Firestar');
  expect(next.cats.find(cat => cat.id === 'firestar')?.mates).not.toContain('sandstorm');
  expect(next.cats.some(cat => cat.id === 'princess')).toBe(false);
  const deleted = { ...next, cats: next.cats.filter(cat => cat.id !== 'bristlefrost') };
  expect(expandCanonTree(deleted, LEGACY_CANON_IDS)).toBe(deleted);
  const ids = new Set(next.cats.map(cat => cat.id));
  for (const cat of next.cats) for (const id of [...cat.parents, ...cat.mates, ...cat.mentors, ...cat.fosterParents]) expect(ids.has(id)).toBe(true);
});

it('reuses a saved shared profile when introducing a new canon character', () => {
  const saved = canonCats().find(cat => cat.id === 'bristlefrost');
  if (!saved) throw new Error('Missing expanded character');
  const next = expandCanonTree(legacy(), LEGACY_CANON_IDS, [{ ...saved, summary: 'Custom biography' }]);
  expect(next.cats.find(cat => cat.id === saved.id)?.summary).toBe('Custom biography');
});

it('upgrades the original preset but leaves reused Firestar lineages and empty forests alone', () => {
  const store = factoryStore();
  const tree = legacy();
  const next = refineStore({ ...store, trees: [tree] });
  expect(next.trees[0]?.cats.length).toBe(canonCats().length);
  expect(refineStore(next)).toBe(next);
  const custom = { ...store, trees: [{ ...tree, name: 'My story' }] };
  expect(refineStore(custom)).toBe(custom);
  const empty = { ...store, trees: [], clans: [], activeId: '' };
  expect(refineStore(empty)).toBe(empty);
});