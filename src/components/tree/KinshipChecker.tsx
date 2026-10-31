import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { checkKinship } from '@/lib/tree/kinship-check';
import { catName, type Cat } from '@/lib/tree/types';

export function KinshipChecker({ cats, initialA, onHighlight, onClose }: { cats: Cat[]; initialA?: string | null; onHighlight: (ids: Set<string> | null) => void; onClose: () => void }) {
  const [a, setA] = useState(initialA ?? ''), [b, setB] = useState('');
  const sorted = useMemo(() => [...cats].sort((x, y) => catName(x).localeCompare(catName(y))), [cats]);
  const result = a && b ? checkKinship(cats, a, b) : null;
  const name = (id: string) => { const c = cats.find(x => x.id === id); return c ? catName(c) : '?'; };
  const pick = (na: string, nb: string) => { setA(na); setB(nb); onHighlight(na && nb ? checkKinship(cats, na, nb).highlight : null); };
  const sel = (v: string, on: (v: string) => void, label: string) => <Select value={v} onValueChange={on}><SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger><SelectContent>{sorted.map(c => <SelectItem key={c.id} value={c.id}>{catName(c)}</SelectItem>)}</SelectContent></Select>;
  return <div className="absolute right-3 top-36 z-30 w-80 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-float sm:top-16" onPointerDown={e => e.stopPropagation()}>
    <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Kinship check</h2><Button size="icon" variant="ghost" className="size-8" aria-label="Close kinship check" onClick={() => { onHighlight(null); onClose(); }}><X /></Button></div>
    <p className="text-xs text-muted-foreground">Pick two cats to see how they're related by blood — useful before making them mates.</p>
    {sel(a, v => pick(v, b), 'First cat')}
    {sel(b, v => pick(a, v), 'Second cat')}
    {result && <div className="space-y-2 rounded-md bg-muted p-3 text-sm" role="status">
      <p className="font-semibold">{result.label}</p>
      {result.shared.length > 0 && result.closeness !== 'none' && <p className="text-muted-foreground">Shared ancestors: {result.shared.map(s => name(s.id)).join(', ')} (highlighted on the tree)</p>}
      {result.mates && result.closeness === 'close' && <p className="font-semibold text-destructive">These cats are mates and closely related.</p>}
      {!result.mates && result.closeness === 'close' && <p className="text-destructive">Too closely related to be mates without complicating the tree.</p>}
      {!result.mates && result.closeness === 'distant' && <p className="text-muted-foreground">Distantly related — mates are possible, but the tree will loop.</p>}
      {result.closeness === 'none' && result.label !== 'Same cat' && <p className="text-muted-foreground">No shared ancestors in this lineage.</p>}
    </div>}
  </div>;
}
