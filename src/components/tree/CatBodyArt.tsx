import { catColor, DEFAULT_CAT_ICON, normalizeIcon, type CatIconSettings } from '@/lib/tree/cat-icon';
import { PELTS } from '@/lib/tree/pelts';

const PELT_PATTERN = { solid: 'solid', tabby: 'tabby', white: 'bicolor', tortie: 'tortoiseshell' } as const;
/** Full-body drawing for a built-in pelt, using the pelt's own palette. */
export function PeltBodyArt({ pelt, className = '' }: { pelt: string; className?: string }) {
  const p = PELTS[pelt] ?? Object.values(PELTS)[0]!;
  return <CatBodyArt className={className} settings={{ ...DEFAULT_CAT_ICON, pattern: PELT_PATTERN[p.pattern] }} colors={{ coat: p.base, markings: p.mark, eye: p.eye }} />;
}

/** Full-body sitting cat drawn from the same saved settings as the face icon. */
export function CatBodyArt({ settings, className = '', colors }: { settings: CatIconSettings; className?: string; colors?: { coat: string; markings: string; eye: string } }) {
  const s = normalizeIcon(settings);
  const coat = colors?.coat ?? catColor(s.coat), mark = colors?.markings ?? catColor(s.markings), white = catColor('snow');
  const eyeColor = (c: string) => colors?.eye ?? catColor(c as never);
  const base = s.pattern === 'calico' ? white : coat;
  const points = s.pattern === 'pointed' ? mark : base;
  const ink = 'var(--cat-ink)';
  const scar = { stroke: 'var(--cat-scar)', strokeWidth: 2.4, strokeLinecap: 'round' as const, fill: 'none' };
  return <svg viewBox="34 34 172 220" role="img" aria-label="Full-body cat drawing" className={className} filter="url(#cat-body-outline)">
    <defs>
      {/* Dark ring cut from the artwork's own silhouette so light coats stay visible on light backgrounds. */}
      <filter id="cat-body-outline" x="-10%" y="-10%" width="120%" height="120%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="ring" />
        <feFlood style={{ floodColor: 'var(--cat-ink)' }} result="ink" />
        <feComposite in="ink" in2="ring" operator="in" result="outline" />
        <feMerge><feMergeNode in="outline" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    {/* tail */}
    <path d="M140 232 Q190 225 186 180 Q183 150 168 140" fill="none" stroke={points} strokeWidth="16" strokeLinecap="round" />
    {s.pattern === 'tabby' && <path d="M178 196l10-4 M184 172l10 0 M172 150l8-6" stroke={mark} strokeWidth="5" strokeLinecap="round" />}
    {/* body */}
    <path d="M60 240 Q48 170 72 128 Q100 105 128 128 Q152 170 140 240 Z" fill={base} />
    {/* neck joins head to body */}
    <path d="M76 96 H124 L130 132 Q100 140 70 132 Z" fill={base} />
    {s.pattern === 'tabby' && <g stroke={mark} strokeWidth="6" strokeLinecap="round" fill="none"><path d="M64 160q10 4 14 14 M60 190q12 4 16 14 M136 160q-10 4-14 14 M140 190q-12 4-16 14" /></g>}
    {s.pattern === 'marbled' && <g stroke={mark} strokeWidth="6" fill="none" strokeLinecap="round"><path d="M64 165q18-6 16 16 q-2 16 -14 20 M136 165q-18-6-16 16 q2 16 14 20" /></g>}
    {s.pattern === 'spotted' && <g fill={mark}><circle cx="70" cy="170" r="6" /><circle cx="130" cy="176" r="7" /><circle cx="66" cy="205" r="5" /><circle cx="134" cy="210" r="6" /><circle cx="80" cy="225" r="4" /></g>}
    {s.pattern === 'tortoiseshell' && <g fill={mark}><path d="M60 230Q50 180 72 140 Q86 160 82 200Z" /><path d="M140 200Q148 170 132 140 Q118 170 124 210Z" /></g>}
    {s.pattern === 'calico' && <g><path d="M60 230Q50 180 72 140 Q86 160 82 200Z" fill={coat} /><path d="M140 205Q148 170 132 140 Q118 170 124 210Z" fill={mark} /></g>}
    {(s.pattern === 'bicolor' || s.pattern === 'tuxedo' || s.pattern === 'calico') && <path d="M100 128 Q78 170 82 238 H118 Q122 170 100 128" fill={white} />}
    {s.pattern === 'pointed' && <path d="M60 240 Q56 225 66 222 H86 Q90 232 88 240 Z M140 240 Q144 225 134 222 H114 Q110 232 112 240 Z" fill={mark} />}
    {/* front legs and paws */}
    <path d="M80 175 V238 M120 175 V238" stroke={ink} strokeOpacity=".25" strokeWidth="2" />
    <ellipse cx="80" cy="240" rx="14" ry="7" fill={s.pattern === 'tuxedo' || s.pattern === 'bicolor' ? white : points} />
    <ellipse cx="120" cy="240" rx="14" ry="7" fill={s.pattern === 'tuxedo' || s.pattern === 'bicolor' ? white : points} />
    {/* head */}
    <g transform="translate(52 36) scale(1.5)">
      <path d="M11 35 14 7 30 22 M53 35 50 7 34 22" fill={points} />
      <path d="M16 26 17 13 26 23 M48 26 47 13 38 23" fill="var(--cat-rose)" />
      {s.ears === 'torn left' && <path d="M10 6 22 20 14 22Z" fill="var(--card)" />}
      {s.ears === 'torn right' && <path d="M54 6 42 20 50 22Z" fill="var(--card)" />}
      {s.ears === 'notched' && <path d="M47 8 52 12 49 15Z" fill="var(--card)" />}
      <ellipse cx="32" cy="38" rx="22" ry="20" fill={base} />
      {s.pattern === 'tabby' && <g stroke={mark} strokeWidth="3" strokeLinecap="round"><path d="M32 20v9 M25 22l3 7 M39 22l-3 7 M12 39l7 2 M52 39l-7 2" /></g>}
      {s.pattern === 'tortoiseshell' && <path d="M11 36Q15 20 30 20L27 36 17 45Z" fill={mark} />}
      {s.pattern === 'calico' && <><path d="M11 36Q15 20 30 20L27 34 16 42Z" fill={coat} /><path d="M36 20Q50 20 53 36L44 38Z" fill={mark} /></>}
      {(s.pattern === 'bicolor' || s.pattern === 'tuxedo') && <path d="M32 33Q27 42 23 48Q24 58 32 58Q40 58 41 48Q37 42 32 33" fill={white} />}
      {s.pattern === 'pointed' && <ellipse cx="32" cy="40" rx="14" ry="14" fill={mark} />}
      {(['left', 'right'] as const).map(side => { const cx = side === 'left' ? 24 : 40, blind = s.blind === side; return <g key={side}>
        <ellipse cx={cx} cy="36" rx="4.5" ry="5" fill={blind ? 'var(--cat-cloud)' : eyeColor(side === 'left' ? s.leftEye : s.rightEye)} />
        {!blind && <ellipse cx={cx} cy="36" rx="1.4" ry="3.7" fill={ink} />}</g>; })}
      {s.scars?.includes('eye') && <path d="M18 29 30 43" {...scar} strokeWidth={1.6} />}
      {s.scars?.includes('brow') && <path d="M37 26 45 30" {...scar} strokeWidth={1.6} />}
      {s.scars?.includes('cheek') && <path d="M46 40 52 46" {...scar} strokeWidth={1.6} />}
      {s.scars?.includes('muzzle') && <path d="M27 41 37 47" {...scar} strokeWidth={1.6} />}
      <path d="M29 44H35L32 47Z" fill={catColor(s.nose)} />
      <path d={s.mouth === 'smile' ? 'M32 47Q29 52 26 49M32 47Q35 52 38 49' : s.mouth === 'neutral' ? 'M32 47V50M27 50H37' : 'M29 51L32 48L35 51'} fill="none" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
      {s.accessory === 'feather' && <path d="M50 22Q60 10 58 3Q48 9 50 22Z" fill="var(--cat-feather)" />}
      {s.accessory === 'flower' && <circle cx="48" cy="18" r="4" fill="var(--cat-flower)" />}
    </g>
    {(s.accessory === 'collar' || s.accessory === 'bell collar') && <path d="M72 132 Q100 148 128 132" fill="none" stroke="var(--cat-collar)" strokeWidth="7" strokeLinecap="round" />}
    {s.accessory === 'bell collar' && <circle cx="100" cy="146" r="5" fill="var(--cat-gold)" stroke={ink} strokeWidth="1" />}
  </svg>;
}
