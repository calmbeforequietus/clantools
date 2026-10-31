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
 it('places a standalone in-law branch outward from Firestar and Squirrelflight', () => {
  // Isolate the original two-founder topology; extended shared ancestry can
  // legitimately reverse branch order while preserving mate adjacency.
  const ids=cats.slice(0,26).map(c=>c.id);
  const family=cats.filter(c=>ids.includes(c.id)).map(c=>({...c,parents:c.parents.filter(id=>ids.includes(id)),mates:c.mates.filter(id=>ids.includes(id))}));
  const p=computeLayout(family);expect(p.get('tigerstar')?.x).toBeGreaterThan(p.get('brambleclaw')?.x ?? Infinity);expect(p.get('goldenflower')?.x).toBeGreaterThan(p.get('squirrelflight')?.x ?? Infinity);
 });
 it('uses a Clan own trees as its roster once created', () => { const trees = [{ id: 'source', name: '', updatedAt: 0, clanId: 'thunderclan', cats }, { id: 'wind', name: '', updatedAt: 1, clanId: 'windclan', cats: [] }]; expect(clanRoster(trees, 'windclan', 'WindClan')).toHaveLength(0); expect(clanRoster(trees.slice(0,1), 'windclan', 'WindClan').map(c => c.id)).toEqual(['crowfeather']); });
 it('keeps nodes separated within every generation', () => { const p = [...computeLayout(cats).values()]; for (let i=0; i<p.length; i++) for (let j=i+1; j<p.length; j++) { const a=p[i], b=p[j]; if (a && b && a.y === b.y) expect(Math.abs(a.x-b.x)).toBeGreaterThanOrEqual(NODE_W+GAP_X); } });
 it('resets unversioned saved forests to the canonical preset', () => {
  localStorage.setItem('warrior-cats-trees-v1', JSON.stringify({ trees: [{ id:'old',name:'Edited',cats:[],updatedAt:0 }],activeId:'old' }));
  const s=loadStore(); expect(s.clans.map(c=>c.name)).toEqual(['ThunderClan']);
  expect(s.trees).toHaveLength(1);expect(s.trees[0]?.name).toBe("Firestar's Lineage");expect(s.trees[0]?.cats).toEqual(cats);localStorage.clear();
 });
 it('resets version-one edits including Princess artwork and extra cats only once', () => {
  const store=loadStore();const base=store.clans[0];const tree=store.trees[0];if(!base||!tree)throw new Error('Missing defaults');
  const old={...store,presentationVersion:1,clans:[...store.clans,{...base,id:'custom',name:'OakClan'}],trees:[{...tree,cats:tree.cats.map(c=>c.id==='princess'?{...c,avatar:{kind:'pelt' as const,pelt:'black'}}:c).concat([{...cats[0],id:'custom-cat'} as typeof cats[number]])}]};
  const reset=refineStore(old);expect(reset.clans.map(c=>c.id)).toEqual(['thunderclan']);
  expect(reset.trees[0]?.cats.find(c=>c.id==='princess')?.avatar).toEqual({kind:'pelt',pelt:'princess'});
  expect(reset.trees[0]?.cats.some(c=>c.id==='custom-cat')).toBe(false);
  const edited={...reset,clans:[...reset.clans,{...base,id:'custom',name:'OakClan'}]};
  expect(refineStore(edited)).toBe(edited);saveStore(edited);expect(loadStore()).toEqual(edited);localStorage.clear();
 });
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
  const base=s.clans[0];if(!base)throw new Error('No Clan');
  const state={...s,clans:[...s.clans,{...base,id:'riverclan',name:'RiverClan',affiliation:'RiverClan'}]};
  const result=moveLineage(state,original.id,'riverclan');
  expect(result.trees).toHaveLength(s.trees.length);expect(result.trees[0]?.clanId).toBe('riverclan');
  expect(result.trees[0]?.cats).toBe(original.cats);expect(result.activeId).toBe(original.id);
 });
 it('keeps a saved empty forest empty after all Clans and trees are deleted', () => {
  const s=loadStore();const empty={...s,clans:[],trees:[],activeId:''};saveStore(empty);
  expect(loadStore()).toEqual(empty);localStorage.clear();
 });
});
