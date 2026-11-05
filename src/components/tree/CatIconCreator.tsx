import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ACCESSORIES, BLIND_EYES, COAT_COLORS, COAT_PATTERNS, COLOR_LABEL, EAR_STYLES, EYE_COLORS, MOUTH_SHAPES, NOSE_COLORS, SCARS,
  catColor, colorLabel, isHex, normalizeIcon, type CatColor, type CatIconSettings,
} from '@/lib/tree/cat-icon';
import { CustomCatFace } from './CustomCatFace';

function Chips<T extends string>({ label, options, value, onPick }: { label: string; options: readonly T[]; value: T | T[]; onPick: (v: T) => void }) {
  const on = (o: T) => (Array.isArray(value) ? value.includes(o) : value === o);
  return <fieldset><legend className="mb-1.5 text-xs font-semibold">{label}</legend><div className="flex flex-wrap gap-1.5">
    {options.map(o => <Button key={o} type="button" size="sm" variant={on(o) ? 'default' : 'outline'} className="h-7 rounded-full px-3 capitalize" aria-pressed={on(o)} onClick={() => onPick(o)}>{o}</Button>)}
  </div></fieldset>;
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: CatColor[]; value: CatColor; onPick: (c: CatColor) => void }) {
  return <fieldset><legend className="mb-1.5 text-xs font-semibold">{label} <span className="font-normal text-muted-foreground">· {colorLabel(value)}</span></legend><div className="flex flex-wrap gap-1.5">
    {colors.map(color => <button type="button" key={color} title={COLOR_LABEL[color]} aria-label={`${label}: ${COLOR_LABEL[color]}`} aria-pressed={value === color} onClick={() => onPick(color)}
      className={`size-7 rounded-full border border-border ${value === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-popover' : ''}`} style={{ background: catColor(color) }} />)}
    <label title="Custom color" className={`relative size-7 cursor-pointer overflow-hidden rounded-full border border-border bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] ${isHex(value) ? 'ring-2 ring-primary ring-offset-2 ring-offset-popover' : ''}`} style={isHex(value) ? { background: value } : undefined}>
      <span className="sr-only">{label}: custom color</span>
      <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={isHex(value) ? value : '#808080'} onChange={e => onPick(e.target.value as CatColor)} />
    </label>
  </div></fieldset>;
}

export function CatIconCreator({ value: raw, onChange }: { value: CatIconSettings; onChange: (s: CatIconSettings) => void }) {
  const value = normalizeIcon(raw);
  const set = (patch: Partial<CatIconSettings>) => onChange({ ...value, ...patch });
  const matching = value.leftEye === value.rightEye;
  const usesMarkings = !['solid', 'bicolor'].includes(value.pattern);
  return <div className="space-y-3 pt-3">
    <div className="mx-auto size-24 overflow-hidden rounded-full border border-border"><CustomCatFace settings={value} /></div>
    <Tabs defaultValue="coat">
      <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="coat">Coat</TabsTrigger><TabsTrigger value="face">Face</TabsTrigger><TabsTrigger value="extras">Extras</TabsTrigger></TabsList>
      <TabsContent value="coat" className="space-y-4 pt-2">
        <Chips label="Pattern" options={COAT_PATTERNS} value={value.pattern} onPick={pattern => set({ pattern })} />
        <Swatches label={value.pattern === 'calico' ? 'First patch color' : 'Coat color'} colors={COAT_COLORS} value={value.coat} onPick={coat => set({ coat })} />
        {usesMarkings && <Swatches label={value.pattern === 'pointed' ? 'Point color' : value.pattern === 'calico' || value.pattern === 'tortoiseshell' ? 'Second patch color' : 'Marking color'} colors={COAT_COLORS} value={value.markings} onPick={markings => set({ markings })} />}
      </TabsContent>
      <TabsContent value="face" className="space-y-4 pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold"><Switch checked={!matching} onCheckedChange={odd => set({ rightEye: odd ? (value.leftEye === 'blue' ? 'yellow' : 'blue') : value.leftEye })} aria-label="Odd-eyed" />Odd-eyed (different eye colors)</label>
        <Swatches label={matching ? 'Eye color' : 'Left eye'} colors={EYE_COLORS} value={value.leftEye} onPick={c => set(matching ? { leftEye: c, rightEye: c } : { leftEye: c })} />
        {!matching && <Swatches label="Right eye" colors={EYE_COLORS} value={value.rightEye} onPick={rightEye => set({ rightEye })} />}
        <Swatches label="Nose" colors={NOSE_COLORS} value={value.nose} onPick={nose => set({ nose })} />
        <Chips label="Mouth" options={MOUTH_SHAPES} value={value.mouth} onPick={mouth => set({ mouth })} />
      </TabsContent>
      <TabsContent value="extras" className="space-y-4 pt-2">
        <Chips label="Battle scars (pick any)" options={SCARS} value={value.scars ?? []} onPick={s => set({ scars: value.scars?.includes(s) ? value.scars.filter(x => x !== s) : [...(value.scars ?? []), s] })} />
        <Chips label="Ears" options={EAR_STYLES} value={value.ears ?? 'whole'} onPick={ears => set({ ears })} />
        <Chips label="Blind eye" options={BLIND_EYES} value={value.blind ?? 'none'} onPick={blind => set({ blind })} />
        <Chips label="Accessory" options={ACCESSORIES} value={value.accessory ?? 'none'} onPick={accessory => set({ accessory })} />
      </TabsContent>
    </Tabs>
  </div>;
}
