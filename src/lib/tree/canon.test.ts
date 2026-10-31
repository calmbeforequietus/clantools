import { expect, it } from 'vitest';
import { canonCats } from './canon';
import { PELTS } from './pelts';

it('includes connected close relatives with canonical parentage', () => {
  const byId=new Map(canonCats().map(c=>[c.id,c]));
  const parents: Record<string,string[]>={
    tigerstar:['pinestar','leopardfoot'], tawnypelt:['tigerstar','goldenflower'],
    brightheart:['lionheart','frostfur'], cinderpelt:['lionheart','frostfur'],
    brackenfur:['lionheart','frostfur'], thornclaw:['lionheart','frostfur'],
    birchfall:['dustpelt','ferncloud'], bluestar:['moonflower','stormtail'],
    snowfur:['moonflower','stormtail'], whitestorm:['snowfur','thistleclaw'],
    mistystar:['bluestar','oakheart'], stonefur:['bluestar','oakheart'], mosskit:['bluestar','oakheart'],
    cinderheart:['brackenfur','sorreltail'], fernsong:['lionblaze','cinderheart'],
    hollytuft:['lionblaze','cinderheart'], sorrelstripe:['lionblaze','cinderheart'],
    snaptooth:['lionblaze','cinderheart'], spotfur:['lionblaze','cinderheart'], flywhisker:['lionblaze','cinderheart'],
    flipclaw:['ivypool','fernsong'], thriftear:['ivypool','fernsong'],
  };
  for(const [id,expected] of Object.entries(parents))expect(byId.get(id)?.parents,id).toEqual(expected);
  expect(byId.get('lionblaze')?.mates).toContain('cinderheart');
  expect(byId.get('ivypool')?.mates).toContain('fernsong');
  expect(byId.get('whitestorm')?.fosterParents).toEqual(['bluestar']);
});

it('has unique IDs, resolvable relationships and default preset coats', () => {
  const cats=canonCats(),ids=new Set(cats.map(c=>c.id));expect(ids.size).toBe(cats.length);
  for(const cat of cats){
    for(const id of [...cat.parents,...cat.fosterParents,...cat.mates,...cat.mentors]){
      expect(ids.has(id),`${cat.id} references ${id}`).toBe(true);expect(id).not.toBe(cat.id);
    }
    expect(cat.avatar.kind).toBe('pelt');
    if(cat.avatar.kind==='pelt')expect(PELTS[cat.avatar.pelt]).toBeDefined();
  }
  expect(cats.find(c=>c.id==='princess')?.avatar).toEqual({kind:'pelt',pelt:'princess'});
});