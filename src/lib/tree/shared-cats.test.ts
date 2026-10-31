import { expect,it } from 'vitest';
import { canonCats } from './canon';
import { knownRelationships,reuseCat,sharedCats } from './shared-cats';
it('offers Firestar parents, mate, kits and apprentices including reverse links',()=>{
 const options=knownRelationships(canonCats(),'firestar');
 expect(options.find(r=>r.cat.id==='jake')?.labels).toEqual(['Parent']);
 expect(options.find(r=>r.cat.id==='sandstorm')?.labels).toEqual(['Mate']);
 expect(options.find(r=>r.cat.id==='leafpool')?.labels).toEqual(['Kit']);
 expect(options.find(r=>r.cat.id==='cloudtail')?.labels).toEqual(['Apprentice']);
});
it('reuses identity and adds only the chosen Firestar relationships without hidden links',()=>{
 const result=reuseCat([],canonCats(),'firestar',['sandstorm','leafpool']);
 expect(result.map(c=>c.id)).toEqual(['firestar','sandstorm','leafpool']);
 expect(result.find(c=>c.id==='firestar')?.parents).toEqual([]);
 expect(result.find(c=>c.id==='firestar')?.mates).toEqual(['sandstorm']);
 expect(result.find(c=>c.id==='leafpool')?.parents).toEqual(['firestar','sandstorm'].filter(id=>id==='firestar'));
 expect(reuseCat(result,canonCats(),'firestar',[]).map(c=>c.id)).toEqual(result.map(c=>c.id));
});
it('can add Firestar alone and merges known links across overlapping trees',()=>{
 const solo=reuseCat([],canonCats(),'firestar',[]);expect(solo).toHaveLength(1);expect(solo[0]?.parents).toEqual([]);expect(solo[0]?.mates).toEqual([]);
 const all=sharedCats([{id:'canon',name:'',updatedAt:0,cats:canonCats()},{id:'solo',name:'',updatedAt:1,cats:solo}]);
 expect(all.filter(c=>c.id==='firestar')).toHaveLength(1);expect(all.find(c=>c.id==='firestar')?.parents).toEqual(['jake','nutmeg']);
});