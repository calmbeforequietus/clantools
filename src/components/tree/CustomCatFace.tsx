import { catColor, normalizeIcon, type CatIconSettings } from '@/lib/tree/cat-icon';

const EAR_CUT: Record<string, string> = {
  'torn left': 'M10 6 22 20 14 22Z',
  'torn right': 'M54 6 42 20 50 22Z',
  notched: 'M47 8 52 12 49 15Z',
};

export function CustomCatFace({ settings }: { settings: CatIconSettings }) {
  const s = normalizeIcon(settings);
  const coat = catColor(s.coat), mark = catColor(s.markings), white = catColor('snow');
  const base = s.pattern === 'calico' || s.pattern === 'tuxedo' ? (s.pattern === 'calico' ? white : coat) : coat;
  const earFill = s.pattern === 'pointed' ? mark : base;
  const scar = { stroke: 'var(--cat-scar)', strokeWidth: 1.6, strokeLinecap: 'round' as const, fill: 'none' };
  return <svg viewBox="0 0 64 64" role="img" aria-label="Custom cat icon" className="h-full! w-full!">
    <rect width="64" height="64" fill="var(--muted)" />
    <path d="M11 35 14 7 30 22 M53 35 50 7 34 22" fill={earFill} />
    <path d="M16 26 17 13 26 23 M48 26 47 13 38 23" fill="var(--cat-rose)" />
    {s.ears !== 'whole' && EAR_CUT[s.ears ?? ''] && <path d={EAR_CUT[s.ears ?? '']} fill="var(--muted)" />}
    <ellipse cx="32" cy="38" rx="22" ry="20" fill={base} />
    {s.pattern === 'tabby' && <g stroke={mark} strokeWidth="3" strokeLinecap="round"><path d="M32 20v9 M25 22l3 7 M39 22l-3 7 M12 39l7 2 M13 46l7 1 M52 39l-7 2 M51 46l-7 1" /></g>}
    {s.pattern === 'marbled' && <g stroke={mark} strokeWidth="3" fill="none" strokeLinecap="round"><path d="M24 21Q32 28 40 21 M13 38Q19 33 18 44 M51 38Q45 33 46 44 M28 25Q32 31 36 25" /></g>}
    {s.pattern === 'tortoiseshell' && <g fill={mark}><path d="M11 36Q15 20 30 20L27 36 17 45Z" /><path d="M37 46Q50 36 53 40Q51 55 39 57Z" /></g>}
    {s.pattern === 'calico' && <g><path d="M11 36Q15 20 30 20L27 34 16 42Z" fill={coat} /><path d="M36 20Q50 20 53 36L44 38Z" fill={mark} /><path d="M40 50Q50 44 53 42Q50 55 42 57Z" fill={coat} /></g>}
    {s.pattern === 'bicolor' && <path d="M32 25Q28 40 20 48Q22 59 32 58Q42 59 44 48Q36 40 32 25" fill={white} />}
    {s.pattern === 'tuxedo' && <path d="M32 33Q27 42 23 48Q24 58 32 58Q40 58 41 48Q37 42 32 33" fill={white} />}
    {s.pattern === 'spotted' && <g fill={mark}><circle cx="22" cy="25" r="3" /><circle cx="41" cy="26" r="4" /><circle cx="15" cy="43" r="3" /><circle cx="48" cy="45" r="3" /><circle cx="23" cy="53" r="2" /></g>}
    {s.pattern === 'pointed' && <ellipse cx="32" cy="39" rx="15" ry="15" fill={mark} />}
    {(['left', 'right'] as const).map(side => {
      const cx = side === 'left' ? 24 : 40, blind = s.blind === side;
      return <g key={side}>
        <ellipse cx={cx} cy="36" rx="4.5" ry="5" fill={blind ? 'var(--cat-cloud)' : catColor(side === 'left' ? s.leftEye : s.rightEye)} />
        {!blind && <ellipse cx={cx} cy="36" rx="1.4" ry="3.7" fill="var(--cat-ink)" />}
      </g>;
    })}
    {s.scars?.includes('eye') && <path d="M18 29 30 43" {...scar} />}
    {s.scars?.includes('brow') && <path d="M37 26 45 30 M38 28 43 25" {...scar} />}
    {s.scars?.includes('cheek') && <path d="M46 40 52 46 M44 43 50 49" {...scar} />}
    {s.scars?.includes('muzzle') && <path d="M27 41 37 47" {...scar} />}
    <path d="M29 44H35L32 47Z" fill={catColor(s.nose)} />
    <path d={s.mouth === 'smile' ? 'M32 47Q29 52 26 49M32 47Q35 52 38 49' : s.mouth === 'neutral' ? 'M32 47V50M27 50H37' : 'M29 51L32 48L35 51'} fill="none" stroke="var(--cat-ink)" strokeWidth="1.2" strokeLinecap="round" />
    {(s.accessory === 'collar' || s.accessory === 'bell collar') && <path d="M14 53Q32 63 50 53" fill="none" stroke="var(--cat-collar)" strokeWidth="4" strokeLinecap="round" />}
    {s.accessory === 'bell collar' && <circle cx="32" cy="60" r="3" fill="var(--cat-gold)" stroke="var(--cat-ink)" strokeWidth=".6" />}
    {s.accessory === 'feather' && <g><path d="M50 22Q60 10 58 3Q48 9 50 22Z" fill="var(--cat-feather)" /><path d="M50 22 57 5" stroke="var(--cat-ink)" strokeWidth=".7" /></g>}
    {s.accessory === 'flower' && <g fill="var(--cat-flower)"><circle cx="14" cy="22" r="2.6" /><circle cx="19" cy="22" r="2.6" /><circle cx="16.5" cy="18" r="2.6" /><circle cx="16.5" cy="25.5" r="2.6" /><circle cx="16.5" cy="22" r="1.6" fill="var(--cat-gold)" /></g>}
  </svg>;
}
