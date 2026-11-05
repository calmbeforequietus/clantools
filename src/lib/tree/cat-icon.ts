// Every color key maps to a global --cat-* token. Older saves used the first
// ten keys, so they all remain valid.
export const CAT_COLORS = ['ink', 'ash', 'silver', 'snow', 'ginger', 'chocolate', 'gold', 'rose', 'green', 'blue',
  'cream', 'brown', 'cinnamon', 'lilac', 'fawn', 'amber', 'yellow', 'copper', 'hazel', 'ice', 'brick', 'smoke', 'blue-gray', 'caramel', 'red', 'sandy', 'tawny', 'cinder', 'ivory',
  'russet', 'chestnut', 'sable', 'onyx', 'dun', 'pearl', 'taupe', 'pewter', 'marmalade', 'apricot', 'chinchilla'] as const;
/** A named palette color or a custom #rrggbb hex from the color picker. */
export type CatColor = typeof CAT_COLORS[number] | `#${string}`;
export const isHex = (v: unknown): v is `#${string}` => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

/** Real cat coat colors only. */
/** Ordered darkest to lightest, cool grays then warm browns then reds. */
export const COAT_COLORS: CatColor[] = ['ink', 'onyx', 'sable', 'cinder', 'smoke', 'pewter', 'ash', 'taupe', 'dun', 'blue-gray',
  'silver', 'chinchilla', 'pearl', 'lilac', 'snow', 'ivory', 'cream', 'fawn', 'sandy', 'apricot',
  'chocolate', 'chestnut', 'brown', 'cinnamon', 'russet', 'ginger', 'marmalade', 'red', 'tawny', 'caramel', 'gold'];
export const EYE_COLORS: CatColor[] = ['green', 'hazel', 'yellow', 'amber', 'copper', 'blue', 'ice'];
export const NOSE_COLORS: CatColor[] = ['rose', 'brick', 'chocolate', 'ash', 'ink'];

export const COLOR_LABEL: Record<typeof CAT_COLORS[number], string> = {
  ink: 'Black', ash: 'Gray', silver: 'Silver', snow: 'White', ginger: 'Ginger', chocolate: 'Dark brown', gold: 'Golden',
  rose: 'Pink', green: 'Green', blue: 'Blue', cream: 'Cream', brown: 'Brown', cinnamon: 'Cinnamon', lilac: 'Lilac',
  fawn: 'Fawn', amber: 'Amber', yellow: 'Yellow', copper: 'Copper', hazel: 'Hazel', ice: 'Pale blue', brick: 'Brick red',
  smoke: 'Smoke', 'blue-gray': 'Blue-gray', caramel: 'Caramel', red: 'Deep red', sandy: 'Sandy', tawny: 'Tawny', cinder: 'Charcoal', ivory: 'Ivory',
  russet: 'Russet', chestnut: 'Chestnut', sable: 'Sable', onyx: 'Onyx', dun: 'Dun', pearl: 'Pearl',
  taupe: 'Taupe', pewter: 'Pewter', marmalade: 'Marmalade', apricot: 'Apricot', chinchilla: 'Chinchilla',
};

export const COAT_PATTERNS = ['solid', 'tabby', 'marbled', 'spotted', 'tortoiseshell', 'calico', 'bicolor', 'tuxedo', 'pointed'] as const;
export const MOUTH_SHAPES = ['smile', 'neutral', 'small'] as const;
export const EAR_STYLES = ['whole', 'torn left', 'torn right', 'notched'] as const;
export const SCARS = ['muzzle', 'cheek', 'brow', 'eye'] as const;
export const BLIND_EYES = ['none', 'left', 'right'] as const;
export const ACCESSORIES = ['none', 'collar', 'bell collar', 'feather', 'flower'] as const;

export interface CatIconSettings {
  coat: CatColor; markings: CatColor; pattern: typeof COAT_PATTERNS[number];
  leftEye: CatColor; rightEye: CatColor; nose: CatColor; mouth: typeof MOUTH_SHAPES[number];
  ears?: typeof EAR_STYLES[number];
  scars?: typeof SCARS[number][];
  blind?: typeof BLIND_EYES[number];
  accessory?: typeof ACCESSORIES[number];
}
export const DEFAULT_CAT_ICON: CatIconSettings = { coat: 'ash', markings: 'ink', pattern: 'tabby', leftEye: 'green', rightEye: 'green', nose: 'rose', mouth: 'smile', ears: 'whole', scars: [], blind: 'none', accessory: 'none' };

/** Fill fields that older saved icons do not have. */
export function normalizeIcon(s: Partial<CatIconSettings>): CatIconSettings {
  const pick = <T,>(v: unknown, list: readonly T[], d: T) => (list.includes(v as T) || (list === (CAT_COLORS as readonly unknown[]) && isHex(v)) ? v as T : d);
  return {
    coat: pick(s.coat, CAT_COLORS, DEFAULT_CAT_ICON.coat), markings: pick(s.markings, CAT_COLORS, DEFAULT_CAT_ICON.markings),
    pattern: pick(s.pattern, COAT_PATTERNS, 'tabby'), leftEye: pick(s.leftEye, CAT_COLORS, 'green'), rightEye: pick(s.rightEye, CAT_COLORS, 'green'),
    nose: pick(s.nose, CAT_COLORS, 'rose'), mouth: pick(s.mouth, MOUTH_SHAPES, 'smile'), ears: pick(s.ears, EAR_STYLES, 'whole'),
    scars: (s.scars ?? []).filter(x => SCARS.includes(x)), blind: pick(s.blind, BLIND_EYES, 'none'), accessory: pick(s.accessory, ACCESSORIES, 'none'),
  };
}
export const catColor = (color: CatColor) => isHex(color) ? color : `var(--cat-${color})`;
export const colorLabel = (color: CatColor) => isHex(color) ? `Custom ${color}` : COLOR_LABEL[color];
