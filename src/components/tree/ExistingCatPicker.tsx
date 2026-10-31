import { useMemo,useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter } from '@/components/ui/dialog';
import { catName,type Cat } from '@/lib/tree/types';
import { knownRelationships } from '@/lib/tree/shared-cats';
import { CatAvatar } from './CatAvatar';

export function ExistingCatPicker({available,all,onClose,onNew,onAdd}:{available:Cat[];all:Cat[];onClose:()=>void;onNew:()=>void;onAdd:(id:string,selected:string[])=>void}){
  const [query,setQuery]=useState(''),[chosen,setChosen]=useState<Cat|null>(null),[selected,setSelected]=useState<string[]>([]);
  const matches=useMemo(()=>available.filter(c=>c.names.some(n=>n.toLowerCase().includes(query.toLowerCase()))),[available,query]);
  const relationships=chosen?knownRelationships(all,chosen.id):[];
  return <Dialog open onOpenChange={v=>!v&&onClose()}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{chosen?`Add ${catName(chosen)}`:'Add cat'}</DialogTitle></DialogHeader>
    {!chosen?<><Button onClick={onNew}>Create new cat</Button><h3 className="text-sm font-semibold">Existing characters</h3><Input aria-label="Find existing cat" placeholder="Search names…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="max-h-72 space-y-1 overflow-y-auto">{matches.map(c=><Button key={c.id} variant="ghost" className="h-auto w-full justify-start py-2" onClick={()=>{setChosen(c);setSelected([]);}}><CatAvatar avatar={c.avatar} className="size-9 shrink-0"/><span className="text-left">{catName(c)}<span className="block text-xs text-muted-foreground">{c.clan}</span></span></Button>)}{matches.length===0&&<p className="py-4 text-sm text-muted-foreground">No matching characters.</p>}</div></>:<><h3 className="text-sm font-semibold">Include relationships</h3><div className="space-y-2">{relationships.map(({cat,labels})=><label key={cat.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3"><Checkbox checked={selected.includes(cat.id)} onCheckedChange={v=>setSelected(ids=>v?[...ids,cat.id]:ids.filter(id=>id!==cat.id))}/><CatAvatar avatar={cat.avatar} className="size-8 shrink-0"/><span className="text-sm">{catName(cat)}<span className="block text-xs text-muted-foreground">{labels.join(' · ')}</span></span></label>)}{!relationships.length&&<p className="text-sm text-muted-foreground">No known relationships.</p>}</div><DialogFooter><Button variant="outline" onClick={()=>setChosen(null)}>Back</Button><Button onClick={()=>onAdd(chosen.id,selected)}>{selected.length?`Add with ${selected.length} relationships`:'Add cat only'}</Button></DialogFooter></>}
  </DialogContent></Dialog>;
}