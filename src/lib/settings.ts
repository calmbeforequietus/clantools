export const THEMES = [
  { id: 'forest', label: 'Forest (default)', swatch: ['oklch(0.965 0.014 78)', 'oklch(0.64 0.15 52)', 'oklch(0.52 0.11 150)'] },
  { id: 'night', label: 'Night', swatch: ['oklch(0.22 0.02 50)', 'oklch(0.72 0.15 55)', 'oklch(0.6 0.13 305)'] },
  { id: 'leafbare', label: 'Leaf-bare', swatch: ['oklch(0.96 0.008 240)', 'oklch(0.5 0.09 240)', 'oklch(0.55 0.06 200)'] },
  { id: 'cb-redgreen', label: 'Colorblind: red-green safe', swatch: ['oklch(0.97 0.004 90)', 'oklch(0.53 0.13 245)', 'oklch(0.76 0.16 75)'] },
  { id: 'cb-blueyellow', label: 'Colorblind: blue-yellow safe', swatch: ['oklch(0.97 0.004 90)', 'oklch(0.55 0.2 25)', 'oklch(0.5 0.08 200)'] },
  { id: 'mono', label: 'Monochrome', swatch: ['oklch(0.97 0 0)', 'oklch(0.3 0 0)', 'oklch(0.6 0 0)'] },
] as const;
export type ThemeId = typeof THEMES[number]['id'];
export const TEXT_SIZES = [{ id: 'sm', label: 'Smaller', px: 14 }, { id: 'md', label: 'Default', px: 16 }, { id: 'lg', label: 'Larger', px: 18 }, { id: 'xl', label: 'Largest', px: 20 }] as const;
export type TextSize = typeof TEXT_SIZES[number]['id'];
export interface Settings { theme: ThemeId; text: TextSize }
export const SETTINGS_KEY = 'clantools-settings';
export const DEFAULT_SETTINGS: Settings = { theme: 'forest', text: 'md' };

export function parseSettings(raw: string | null): Settings {
  try {
    const s = JSON.parse(raw ?? '{}') as Partial<Settings>;
    return { theme: THEMES.some(t => t.id === s.theme) ? s.theme! : 'forest', text: TEXT_SIZES.some(t => t.id === s.text) ? s.text! : 'md' };
  } catch { return DEFAULT_SETTINGS; }
}

/** Runs before paint (inline script) and after changes. */
export const APPLY_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');var d=document.documentElement;d.dataset.theme=s.theme||'forest';d.dataset.text=s.text||'md';d.classList.toggle('dark',s.theme==='night');}catch(e){}})();`;

export function applySettings(s: Settings) {
  const d = document.documentElement;
  d.dataset.theme = s.theme; d.dataset.text = s.text;
  d.classList.toggle('dark', s.theme === 'night');
}
