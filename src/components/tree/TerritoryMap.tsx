import { useState } from 'react';
import { MapPin as PinIcon, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ClanPage, MapPin } from '@/lib/tree/types';

export function TerritoryMap({ clan, onUpdate }: { clan: ClanPage; onUpdate: (p: Partial<ClanPage>) => void }) {
  const [placing, setPlacing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pin = clan.pins.find(p => p.id === selected);
  const patch = (p: Partial<MapPin>) => onUpdate({ pins: clan.pins.map(v => v.id === selected ? { ...v, ...p } : v) });
  return <section className="space-y-4 border-t border-border pt-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold">Territory</h2><div className="flex gap-2">
      {clan.map && <Button size="sm" variant={placing ? 'default' : 'outline'} onClick={() => setPlacing(v => !v)} aria-pressed={placing}><Plus />{placing ? 'Cancel pin' : 'Add landmark'}</Button>}
      <Button size="sm" variant="outline" asChild><label><Upload />{clan.map ? 'Replace map' : 'Upload map'}<input aria-label="Upload territory map" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 1.5 * 1024 * 1024) { toast.error('Choose a map under 1.5 MB.'); return; } const r = new FileReader(); r.onload = () => { if (clan.pins.length && !window.confirm('Replacing the map will clear its landmarks. Continue?')) return; onUpdate({ map: String(r.result), pins: [] }); setSelected(null); }; r.readAsDataURL(f); }} /></label></Button>
    </div></div>
    {clan.map ? <div className="grid gap-5"><div className={`relative self-start overflow-hidden rounded-lg border border-border ${placing ? 'cursor-crosshair ring-2 ring-primary' : ''}`} onClick={e => {
      if (!placing) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const p = { id: crypto.randomUUID(), x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100, name: 'New landmark', body: '' };
      onUpdate({ pins: [...clan.pins, p] }); setSelected(p.id); setEditing(true); setPlacing(false);
    }}><img src={clan.map} alt={`${clan.name} territory`} className="block h-auto w-full" draggable={false} />{clan.pins.map(p => <Button key={p.id} size="icon" variant={selected === p.id ? 'default' : 'secondary'} aria-label={`Landmark ${p.name}`} title={p.name} className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-float" style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={e => { e.stopPropagation(); setSelected(p.id); setEditing(false); }}><PinIcon /></Button>)}</div>
    <div className="space-y-3">{pin ? <><div className="flex items-center justify-between"><h3 className="font-display text-xl">{pin.name}</h3><Button variant="ghost" size="icon" aria-label="Close landmark" onClick={() => setSelected(null)}><X /></Button></div>{editing ? <><Input aria-label="Landmark name" value={pin.name} onChange={e => patch({ name: e.target.value })} /><Textarea aria-label="Landmark lore" value={pin.body} onChange={e => patch({ body: e.target.value })} rows={5} /></> : <p className="whitespace-pre-wrap text-sm text-muted-foreground">{pin.body || 'No lore recorded.'}</p>}<div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(v => !v)}>{editing ? 'Done' : 'Edit landmark'}</Button><Button variant="ghost" size="icon" aria-label="Delete landmark" onClick={() => { onUpdate({ pins: clan.pins.filter(p => p.id !== selected) }); setSelected(null); }}><Trash2 /></Button></div></> : clan.pins.length ? <div className="flex flex-wrap items-center justify-between gap-3">{clan.pins.map(p => <Button variant="ghost" key={p.id} className="h-auto justify-start" onClick={() => { setSelected(p.id); setEditing(false); }}><PinIcon />{p.name}</Button>)}</div> : <p className="text-sm text-muted-foreground">No landmarks recorded.</p>}</div></div> : <div className="flex min-h-40 items-center justify-center border border-dashed border-border text-muted-foreground"><PinIcon size={32} /></div>}
  </section>;
}
