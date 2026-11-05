import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CLAN_COLORS, CRESTS, clanSlug } from '@/lib/tree/clans';
import type { ClanPage } from '@/lib/tree/types';
import { ClanCrest } from './ClanCrest';

export function ClanEditor({ value, onSave, onClose, onDelete, existingIds = [] }: { value?: ClanPage; onSave: (c: ClanPage) => void; onClose: () => void; onDelete?: () => void; existingIds?: string[] }) {
  const [name, setName] = useState(value?.name ?? '');
  const [crest, setCrest] = useState(value?.crest ?? 'ThunderClan');
  const [color, setColor] = useState(value?.color ?? CLAN_COLORS[0]);
  const [motto, setMotto] = useState(value?.motto ?? '');
  const [confirming, setConfirming] = useState(false);
  if (confirming && value && onDelete) return <Dialog open onOpenChange={open => !open && setConfirming(false)}><DialogContent><DialogHeader><DialogTitle>Delete {value.name}?</DialogTitle></DialogHeader><p className="text-sm leading-relaxed">This permanently deletes this Clan and all its associated lineages. Those lineages will not be saved and cannot be recovered. Export or move any lineages you want to keep before continuing.</p><DialogFooter><Button variant="outline" onClick={()=>setConfirming(false)}>Keep Clan</Button><Button variant="destructive" onClick={onDelete}>Delete Clan and lineages</Button></DialogFooter></DialogContent></Dialog>;
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{value ? 'Edit Clan' : 'New Clan'}</DialogTitle></DialogHeader>
    <label className="space-y-2 text-sm">Clan name<Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Clan name" /></label>
    <label className="space-y-2 text-sm">Motto <span className="text-muted-foreground">(optional)</span><Input value={motto} maxLength={120} onChange={e => setMotto(e.target.value)} placeholder="Strength in the thunder" /></label>
    <div className="flex justify-center py-2" style={{ color }}><ClanCrest crest={crest} className="h-20 w-20" /></div>
    <div className="grid grid-cols-6 gap-2">{CRESTS.map(c => <Button key={c} variant={crest === c ? 'secondary' : 'ghost'} className="h-14 p-2" title={c} aria-label={`Choose ${c} crest`} onClick={() => setCrest(c)}><ClanCrest crest={c} className="h-10 w-10" /></Button>)}</div>
    <label className="text-sm">Upload crest<Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 1.5 * 1024 * 1024) { toast.error('Choose an image under 1.5 MB.'); return; } const reader = new FileReader(); reader.onload = () => setCrest(String(reader.result)); reader.readAsDataURL(f); }} /></label>
    <div className="flex flex-wrap gap-2">{CLAN_COLORS.map((c, i) => <Button key={c} size="icon" variant="ghost" aria-label={`Clan color ${i + 1}`} title={`Clan color ${i + 1}`} onClick={() => setColor(c)} className={color === c ? 'ring-2 ring-primary' : ''}><span className="h-6 w-6 rounded-full" style={{ background: c }} /></Button>)}
      <label title="Custom color" className={`relative flex size-9 cursor-pointer items-center justify-center rounded-md ${color?.startsWith('#') ? 'ring-2 ring-primary' : ''}`}><span className="h-6 w-6 rounded-full border border-border bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" style={color?.startsWith('#') ? { background: color } : undefined} /><span className="sr-only">Custom Clan color</span><input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={color?.startsWith('#') ? color : '#808080'} onChange={e => setColor(e.target.value)} /></label></div>
    <DialogFooter>{value && onDelete && <Button variant="ghost" className="mr-auto text-destructive" onClick={()=>setConfirming(true)}>Delete Clan</Button>}<Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!name.trim()} onClick={() => onSave({ ...(value ?? { id: clanSlug(name, existingIds), affiliation: name.trim(), sections: [], pins: [], eras: [] }), name: name.trim(), motto: motto.trim() || undefined, crest, color: color ?? 'var(--primary)' })}>Save Clan</Button></DialogFooter>
  </DialogContent></Dialog>;
}
