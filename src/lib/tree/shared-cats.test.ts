import { expect,it } from 'vitest';
import { canonCats } from './canon';
import { knownRelationships,reuseCat,sharedCats,matchingNames,combineCat } from './shared-cats';
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
 expect(result.find(c=>c.id==='leafpool')?.parents).toEqual(['firestar']);
 expect(reuseCat(result,canonCats(),'firestar',[]).map(c=>c.id)).toEqual(result.map(c=>c.id));
});
it('finds same names across Clans and name histories without matching the cat itself',()=>{
 expect(matchingNames(canonCats(),['  FIRESTAR ']).map(c=>c.id)).toEqual(['firestar']);
 expect(matchingNames(canonCats(),['Rusty']).map(c=>c.id)).toEqual(['firestar']);
 expect(matchingNames(canonCats(),['Tigerstar']).map(c=>c.id)).toEqual(['tigerstar']);
 expect(matchingNames(canonCats(),['Firestar'],'firestar')).toEqual([]);
});
it('combines a new identity with existing profile data and remaps local connections',()=>{
 const source=canonCats(),fire=source.find(c=>c.id==='firestar'),kit=source.find(c=>c.id==='cloudtail');if(!fire||!kit)throw new Error('Missing fixtures');
 const result=combineCat([{...fire,id:'new-id',avatar:{kind:'pelt',pelt:'black'},parents:[],mates:[],mentors:[]},{...kit,parents:['new-id'],mentors:[]}],source,'new-id','firestar',['sandstorm']);
 expect(result.some(c=>c.id==='new-id')).toBe(false);expect(result.filter(c=>c.id==='firestar')).toHaveLength(1);
 expect(result.find(c=>c.id==='firestar')?.avatar).toEqual(fire.avatar);
 expect(result.find(c=>c.id==='cloudtail')?.parents).toEqual(['firestar']);
 expect(result.find(c=>c.id==='firestar')?.mates).toEqual(['sandstorm']);
});
it('can add Firestar alone and merges known links across overlapping trees',()=>{
 const solo=reuseCat([],canonCats(),'firestar',[]);expect(solo).toHaveLength(1);expect(solo[0]?.parents).toEqual([]);expect(solo[0]?.mates).toEqual([]);
 const all=sharedCats([{id:'canon',name:'',updatedAt:0,cats:canonCats()},{id:'solo',name:'',updatedAt:1,cats:solo}]);
 expect(all.filter(c=>c.id==='firestar')).toHaveLength(1);expect(all.find(c=>c.id==='firestar')?.parents).toEqual(['jake','nutmeg']);
});