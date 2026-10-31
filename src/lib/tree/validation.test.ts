import { describe, expect, it } from 'vitest';
import { canonCats } from './canon';
import { checkRelation } from './validation';
import { computeLayout, GAP_X, NODE_W } from './layout';
import { deleteClan, loadStore, moveLineage, refineStore, saveStore } from './ops';
import { clanRoster } from './clans';

describe('connection safeguards', () => {
 const cats = canonCats();
 it('blocks duplicate mates even when stored on only one partner', () => { expect(checkRelation(cats, 'sandstorm', 'mates', 'firestar')?.blocked).toBe(true); });
 it('blocks a cat becoming its own ancestor', () => { expect(checkRelation(cats, 'firestar', 'parents', 'flamepaw')?.blocked).toBe(true); });
 it('blocks self connections', () => { expect(checkRelation(cats, 'firestar', 'mentors', 'firestar')?.blocked).toBe(true); });
 it('warns when siblings become mates and identifies common ancestors', () => { const issue = checkRelation(cats, 'squirrelflight', 'mates', 'leafpool'); expect(issue?.blocked).toBe(false); expect(issue?.message).toContain('Firestar'); expect(issue?.message).toContain('Sandstorm'); });
 it('warns when joining two ancestral branches', () => { expect(checkRelation(cats, 'cloudtail', 'mates', 'leafpool')).toMatchObject({ blocked: false }); });
 it('keeps Squirrelflight and Bramblestar adjacent', () => { const p = computeLayout(cats); const a = p.get('brambleclaw'), b = p.get('squirrelflight'); expect(a?.y).toBe(b?.y); expect(Math.abs((a?.x ?? 0) - (b?.x ?? 0))).toBe(NODE_W+GAP_X); });
 it('places Tigerstar ancestry outward from Firestar and Squirrelflight', () => { const p = computeLayout(cats); expect(p.get('tigerstar')?.x).toBeGreaterThan(p.get('brambleclaw')?.x ?? Infinity); expect(p.get('goldenflower')?.x).toBeGreaterThan(p.get('squirrelflight')?.x ?? Infinity); });
 it('uses a Clan own trees as its roster once created', () => { const trees = [{ id: 'source', name: '', updatedAt: 0, clanId: 'thunderclan', cats }, { id: 'wind', name: '', updatedAt: 1, clanId: 'windclan', cats: [] }]; expect(clanRoster(trees, 'windclan', 'WindClan')).toHaveLength(0); expect(clanRoster(trees.slice(0,1), 'windclan', 'WindClan').map(c => c.id)).toEqual(['crowfeather']); });
 it('keeps nodes separated within every generation', () => { const p = [...computeLayout(cats).values()]; for (let i=0; i<p.length; i++) for (let j=i+1; j<p.length; j++) { const a=p[i], b=p[j]; if (a && b && a.y === b.y) expect(Math.abs(a.x-b.x)).toBeGreaterThanOrEqual(NODE_W+GAP_X); } });
 it('migrates existing saved trees without dropping cats', () => { const t = { id: 'old', name: 'Saved tree', cats, updatedAt: 0 }; localStorage.setItem('warrior-cats-trees-v1', JSON.stringify({ trees: [t], activeId: 'old' })); const s = loadStore(); expect(s.trees[0]?.cats).toHaveLength(26); expect(s.trees[0]?.clanId).toBe('thunderclan'); expect(s.clans.map(c => c.name)).toEqual(['ThunderClan','ShadowClan','WindClan','RiverClan']); localStorage.clear(); });
 it('removes obsolete defaults once but retains user-created Clans and all trees', () => { const store = loadStore(); const base = store.clans[0]; if (!base) throw new Error('Missing default'); const old = { ...store, presentationVersion: 0, clans: [...store.clans, {...base,id:'skyclan',name:'SkyClan'}, {...base,id:'custom',name:'OakClan'}] }; const migrated = refineStore(old); expect(migrated.clans.map(c => c.id)).toEqual(['thunderclan','shadowclan','windclan','riverclan','custom']); expect(migrated.trees).toBe(old.trees); expect(refineStore({...migrated,clans:[...migrated.clans,{...base,id:'skyclan'}]}).clans).toHaveLength(6); });
});

describe('Clan management', () => {
 it('deletes associated lineages but keeps other Clans and trees', () => {
  const s = loadStore(); const original = s.trees[0]; if (!original) throw new Error('No tree');
  const state = { ...s, trees: [original, {...original,id:'shadow-tree',clanId:'shadowclan'}] };
  const result = deleteClan(state,'thunderclan');
  expect(result.clans.some(c=>c.id==='thunderclan')).toBe(false);
  expect(result.trees.map(t=>t.id)).toEqual(['shadow-tree']);
  expect(result.activeId).toBe('shadow-tree');
 });
 it('moves a lineage without copying or changing its cats and relationships', () => {
  const s = loadStore(); const original=s.trees[0]; if(!original)throw new Error('No tree');
  const result=moveLineage(s,original.id,'riverclan');
  expect(result.trees).toHaveLength(s.trees.length);expect(result.trees[0]?.clanId).toBe('riverclan');
  expect(result.trees[0]?.cats).toBe(original.cats);expect(result.activeId).toBe(original.id);
 });
 it('keeps a saved empty forest empty after all Clans and trees are deleted', () => {
  const s=loadStore();const empty={...s,clans:[],trees:[],activeId:''};saveStore(empty);
  expect(loadStore()).toEqual(empty);localStorage.clear();
 });
});
