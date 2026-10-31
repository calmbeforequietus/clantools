import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CLAN_COLORS, CRESTS } from '@/lib/tree/clans';
import type { ClanPage } from '@/lib/tree/types';
import { ClanCrest } from './ClanCrest';

export function ClanEditor({ value, onSave, onClose }: { value?: ClanPage; onSave: (c: ClanPage) => void; onClose: () => void }) {
  const [name, setName] = useState(value?.name ?? '');
  const [crest, setCrest] = useState(value?.crest ?? 'ThunderClan');
  const [color, setColor] = useState(value?.color ?? CLAN_COLORS[0]);
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{value ? 'Edit Clan' : 'New Clan'}</DialogTitle></DialogHeader>
    <label className="space-y-2 text-sm">Clan name<Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Clan name" /></label>
    <div className="flex justify-center py-2" style={{ color }}><ClanCrest crest={crest} className="h-20 w-20" /></div>
    <div className="grid grid-cols-6 gap-2">{CRESTS.map(c => <Button key={c} variant={crest === c ? 'secondary' : 'ghost'} className="h-14 p-2" title={c} aria-label={`Choose ${c} crest`} onClick={() => setCrest(c)}><ClanCrest crest={c} className="h-10 w-10" /></Button>)}</div>
    <label className="text-sm">Upload crest<Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 1.5 * 1024 * 1024) { toast.error('Choose an image under 1.5 MB.'); return; } const reader = new FileReader(); reader.onload = () => setCrest(String(reader.result)); reader.readAsDataURL(f); }} /></label>
    <div className="flex gap-2">{CLAN_COLORS.map((c, i) => <Button key={c} size="icon" variant="ghost" aria-label={`Clan color ${i + 1}`} title={`Clan color ${i + 1}`} onClick={() => setColor(c)} className={color === c ? 'ring-2 ring-primary' : ''}><span className="h-6 w-6 rounded-full" style={{ background: c }} /></Button>)}</div>
    <DialogFooter><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!name.trim()} onClick={() => onSave({ ...(value ?? { id: crypto.randomUUID(), affiliation: name.trim(), sections: [], pins: [], eras: [] }), name: name.trim(), crest, color: color ?? 'var(--primary)' })}>Save Clan</Button></DialogFooter>
  </DialogContent></Dialog>;
}
