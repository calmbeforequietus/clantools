import { buildIndex } from './kinship';
import type { Cat, Tree } from './types';

const fields=['parents','fosterParents','mates','mentors'] as const;
export function matchingNames(cats:Cat[],names:string[],exclude?:string){
  const normalized=new Set(names.map(n=>n.trim().toLowerCase()).filter(Boolean));
  return cats.filter(c=>c.id!==exclude&&c.names.some(n=>normalized.has(n.trim().toLowerCase())));
}
export function combineCat(target:Cat[],source:Cat[],localId:string,existingId:string,selected:string[]):Cat[]{
  const existing=source.find(c=>c.id===existingId);if(!existing)return target;
  const remapped=target.map(c=>{
    const copy=c.id===localId?{...existing,id:existingId,parents:[...c.parents],fosterParents:[...c.fosterParents],mates:[...c.mates],mentors:[...c.mentors]}:{...c};
    for(const key of fields)copy[key]=[...new Set(copy[key].map(id=>id===localId?existingId:id).filter(id=>id!==copy.id))];
    return copy;
  });
  const unique=new Map<string,Cat>();
  for(const c of remapped){const previous=unique.get(c.id);const merged={...c};for(const key of fields)merged[key]=[...new Set([...(previous?.[key]??[]),...c[key]])];unique.set(c.id,merged);}
  return reuseCat([...unique.values()],source,existingId,selected);
}
export function sharedCats(trees:Tree[]):Cat[]{
  const cats=new Map<string,Cat>();
  for(const tree of [...trees].sort((a,b)=>a.updatedAt-b.updatedAt))for(const cat of tree.cats){
    const previous=cats.get(cat.id);
    const merged={...cat};
    for(const key of fields)merged[key]=[...new Set([...(previous?.[key]??[]),...cat[key]])];
    cats.set(cat.id,merged);
  }
  return [...cats.values()];
}
export function knownRelationships(cats:Cat[],id:string){
  const idx=buildIndex(cats);
  const groups=[['Parent',idx.parents(id)],['Mate',idx.mates(id)],['Kit',idx.children(id)],['Foster parent',idx.fosterParents(id)],['Foster kit',idx.fosterKits(id)],['Mentor',idx.mentors(id)],['Apprentice',idx.apprentices(id)]] as const;
  const found=new Map<string,{cat:Cat;labels:string[]}>();
  for(const [label,ids] of groups)for(const other of ids){
    const cat=idx.byId.get(other);if(!cat)continue;
    const row=found.get(other)??{cat,labels:[]};row.labels.push(label);found.set(other,row);
  }
  return [...found.values()];
}
export function reuseCat(target:Cat[],source:Cat[],id:string,selected:string[]):Cat[]{
  const byId=new Map(source.map(c=>[c.id,c]));if(!byId.has(id))return target;
  const allowed=new Set(knownRelationships(source,id).map(r=>r.cat.id));
  const importing=new Set([id,...selected.filter(other=>allowed.has(other))]);
  const present=new Set([...target.map(c=>c.id),...importing]);
  const result=new Map(target.map(c=>[c.id,c]));
  for(const key of importing){
    const cat=byId.get(key);if(!cat)continue;
    const existing=result.get(key),copy={...(existing??cat)};
    // Only explicitly selected links to this cat are imported. Existing local
    // relationships remain untouched; no hidden IDs reappear later.
    for(const field of fields)copy[field]=[...new Set([...(existing?.[field]??[]),...cat[field].filter(other=>present.has(other)&&((key===id&&selected.includes(other))||(key!==id&&other===id)))])];
    result.set(key,copy);
  }
  // Mates may be stored only on the other partner.
  const index=buildIndex(source),root=result.get(id);
  if(root)for(const mate of index.mates(id))if(selected.includes(mate))root.mates=[...new Set([...root.mates,mate])];
  return [...result.values()];
}