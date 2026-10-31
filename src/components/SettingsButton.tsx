import { useEffect, useState } from 'react';
import { Check, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { applySettings, DEFAULT_SETTINGS, parseSettings, SETTINGS_KEY, TEXT_SIZES, THEMES, type Settings } from '@/lib/settings';

export function SettingsButton({ className = '' }: { className?: string }) {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => setS(parseSettings(localStorage.getItem(SETTINGS_KEY))), []);
  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next); applySettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };
  return <Popover>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label="Settings" title="Settings" className={className}><Settings2 /></Button></PopoverTrigger>
    <PopoverContent align="end" className="w-72 space-y-4">
      <div>
        <h2 className="mb-2 text-sm font-semibold">Color theme</h2>
        <div className="space-y-1">{THEMES.map(t => <Button key={t.id} variant="ghost" className="h-9 w-full justify-start gap-3 px-2" aria-pressed={s.theme === t.id} onClick={() => update({ theme: t.id })}>
          <span className="flex">{t.swatch.map(c => <span key={c} className="-ml-1 size-4 rounded-full border border-border first:ml-0" style={{ background: c }} />)}</span>
          <span className="flex-1 text-left text-sm">{t.label}</span>{s.theme === t.id && <Check className="text-primary" />}
        </Button>)}</div>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold">Text size</h2>
        <div className="grid grid-cols-4 gap-1">{TEXT_SIZES.map(t => <Button key={t.id} size="sm" variant={s.text === t.id ? 'default' : 'outline'} aria-label={`Text size: ${t.label}`} aria-pressed={s.text === t.id} onClick={() => update({ text: t.id })} style={{ fontSize: t.px * 0.8 }}>Aa</Button>)}</div>
      </div>
      <p className="text-xs text-muted-foreground">Saved in this browser only.</p>
    </PopoverContent>
  </Popover>;
}
