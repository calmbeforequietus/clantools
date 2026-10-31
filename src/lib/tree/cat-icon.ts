export const CAT_COLORS = ['ink', 'ash', 'silver', 'snow', 'ginger', 'chocolate', 'gold', 'rose', 'green', 'blue'] as const;
export type CatColor = typeof CAT_COLORS[number];
export const COAT_PATTERNS = ['solid', 'tabby', 'tortoiseshell', 'bicolor', 'spotted', 'pointed'] as const;
export const MOUTH_SHAPES = ['smile', 'neutral', 'small'] as const;
export interface CatIconSettings {
  coat: CatColor; markings: CatColor; pattern: typeof COAT_PATTERNS[number];
  leftEye: CatColor; rightEye: CatColor; nose: CatColor; mouth: typeof MOUTH_SHAPES[number];
}
export const DEFAULT_CAT_ICON: CatIconSettings = { coat: 'ash', markings: 'ink', pattern: 'tabby', leftEye: 'green', rightEye: 'green', nose: 'rose', mouth: 'smile' };
export const catColor = (color: CatColor) => `var(--cat-${color})`;