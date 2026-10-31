import { catColor, type CatIconSettings } from '@/lib/tree/cat-icon';

export function CustomCatFace({ settings: s }: { settings: CatIconSettings }) {
  const coat = catColor(s.coat), mark = catColor(s.markings);
  return <svg viewBox="0 0 64 64" role="img" aria-label="Custom cat icon" className="h-full! w-full!">
    <rect width="64" height="64" fill="var(--muted)" />
    <path d="M11 35 14 7 30 22 M53 35 50 7 34 22" fill={s.pattern === 'pointed' ? mark : coat} />
    <path d="M16 26 17 13 26 23 M48 26 47 13 38 23" fill="var(--cat-rose)" />
    <ellipse cx="32" cy="38" rx="22" ry="20" fill={coat} />
    {s.pattern === 'tabby' && <g stroke={mark} strokeWidth="3" strokeLinecap="round"><path d="M32 20v9 M25 22l3 7 M39 22l-3 7 M12 39l7 2 M13 46l7 1 M52 39l-7 2 M51 46l-7 1" /></g>}
    {s.pattern === 'tortoiseshell' && <g fill={mark}><path d="M11 36Q15 20 30 20L27 36 17 45Z" /><path d="M37 46Q50 36 53 40Q51 55 39 57Z" /></g>}
    {s.pattern === 'bicolor' && <path d="M32 25Q28 40 20 48Q22 59 32 58Q42 59 44 48Q36 40 32 25" fill={mark} />}
    {s.pattern === 'spotted' && <g fill={mark}><circle cx="22" cy="25" r="3" /><circle cx="41" cy="26" r="4" /><circle cx="15" cy="43" r="3" /><circle cx="48" cy="45" r="3" /><circle cx="23" cy="53" r="2" /></g>}
    {s.pattern === 'pointed' && <ellipse cx="32" cy="39" rx="15" ry="15" fill={mark} />}
    <ellipse cx="24" cy="36" rx="4.5" ry="5" fill={catColor(s.leftEye)} /><ellipse cx="40" cy="36" rx="4.5" ry="5" fill={catColor(s.rightEye)} />
    <g fill="var(--cat-ink)"><ellipse cx="24" cy="36" rx="1.4" ry="3.7" /><ellipse cx="40" cy="36" rx="1.4" ry="3.7" /></g>
    <path d="M29 44H35L32 47Z" fill={catColor(s.nose)} />
    <path d={s.mouth === 'smile' ? 'M32 47Q29 52 26 49M32 47Q35 52 38 49' : s.mouth === 'neutral' ? 'M32 47V50M27 50H37' : 'M29 51L32 48L35 51'} fill="none" stroke="var(--cat-ink)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>;
}