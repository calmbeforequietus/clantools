import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CAT_COLORS, COAT_PATTERNS, MOUTH_SHAPES, catColor, type CatIconSettings, type CatColor } from '@/lib/tree/cat-icon';
import { CustomCatFace } from './CustomCatFace';

export function CatIconCreator({ value, onChange }: { value: CatIconSettings; onChange: (s: CatIconSettings) => void }) {
  const colorFields = [['coat', 'Coat color'], ['markings', 'Marking color'], ['leftEye', 'Left eye'], ['rightEye', 'Right eye'], ['nose', 'Nose color']] as const;
  return <div className="space-y-3 pt-3">
    <div className="mx-auto size-24 overflow-hidden rounded-full"><CustomCatFace settings={value} /></div>
    <div className="grid grid-cols-2 gap-2">
      <Select value={value.pattern} onValueChange={pattern => onChange({ ...value, pattern: pattern as CatIconSettings['pattern'] })}><SelectTrigger aria-label="Coat pattern"><SelectValue /></SelectTrigger><SelectContent>{COAT_PATTERNS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select>
      <Select value={value.mouth} onValueChange={mouth => onChange({ ...value, mouth: mouth as CatIconSettings['mouth'] })}><SelectTrigger aria-label="Mouth shape"><SelectValue /></SelectTrigger><SelectContent>{MOUTH_SHAPES.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent></Select>
    </div>
    {colorFields.map(([key, label]) => <fieldset key={key}><legend className="mb-1 text-xs font-semibold">{label}</legend><div className="flex flex-wrap gap-1">{CAT_COLORS.map((color: CatColor) => <Button key={color} variant="outline" size="icon" className="size-6 rounded-full p-0.5" title={`${label}: ${color}`} aria-label={`${label}: ${color}`} aria-pressed={value[key] === color} onClick={() => onChange({ ...value, [key]: color })}><span className={`size-full rounded-full ${value[key] === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-popover' : ''}`} style={{ background: catColor(color) }} /></Button>)}</div></fieldset>)}
  </div>;
}