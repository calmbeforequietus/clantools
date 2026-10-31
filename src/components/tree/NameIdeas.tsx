import { useState } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NAME_STAGES, suggestNames, type NameStage } from '@/lib/tree/names';

const STAGE_LABEL: Record<NameStage, string> = { kit: 'Kit', paw: 'Apprentice', warrior: 'Warrior', star: 'Leader' };

export function NameIdeas({ onPick, hint: initialHint = '' }: { onPick: (name: string) => void; hint?: string }) {
  const [open, setOpen] = useState(false), [stage, setStage] = useState<NameStage>('warrior'), [hint, setHint] = useState(initialHint);
  const [ideas, setIdeas] = useState<string[]>([]);
  const roll = (s = stage, h = hint) => setIdeas(suggestNames(6, s, h));
  if (!open) return <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setOpen(true); roll(); }}><Dices />Suggest a name</Button>;
  return <div className="space-y-3 rounded-md border border-border p-3">
    <div className="flex flex-wrap gap-1.5">{NAME_STAGES.map(s => <Button type="button" key={s} size="sm" variant={stage === s ? 'default' : 'outline'} className="h-7 rounded-full" onClick={() => { setStage(s); roll(s); }}>{STAGE_LABEL[s]}</Button>)}</div>
    <Input aria-label="Looks like (optional)" placeholder="Looks like… e.g. ginger tabby, blue eyes" value={hint} onChange={e => setHint(e.target.value)} onBlur={() => roll()} />
    <div className="flex flex-wrap gap-1.5">{ideas.map(n => <Button type="button" key={n} size="sm" variant="secondary" onClick={() => onPick(n)}>{n}</Button>)}
      <Button type="button" size="sm" variant="ghost" onClick={() => roll()}><Dices />More</Button></div>
  </div>;
}
