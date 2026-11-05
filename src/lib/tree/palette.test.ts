import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CAT_COLORS, COAT_COLORS, COLOR_LABEL } from './cat-icon';
import { PELTS, type Pattern } from './pelts';

const css = readFileSync(new URL('../../styles.css', import.meta.url), 'utf8');
const hex = /^#[0-9a-f]{6}$/i;
const patterns: Pattern[] = ['solid', 'tabby', 'white', 'tortie'];

it('gives every named cat color a label and a --cat-* token', () => {
  for (const color of CAT_COLORS) {
    expect(COLOR_LABEL[color as keyof typeof COLOR_LABEL], `${color} label`).toBeTruthy();
    expect(css, `--cat-${color} token`).toContain(`--cat-${color}:`);
  }
});

it('offers only named colors in the coat picker', () => {
  for (const color of COAT_COLORS) expect(CAT_COLORS as readonly string[]).toContain(color);
  expect(new Set(COAT_COLORS).size).toBe(COAT_COLORS.length);
});

it('adds the new natural pelt colors to the coat picker', () => {
  for (const color of ['onyx', 'sable', 'pewter', 'taupe', 'dun', 'chinchilla', 'pearl', 'apricot', 'chestnut', 'russet', 'marmalade']) {
    expect(COAT_COLORS, color).toContain(color);
  }
});

it('keeps every built-in pelt well formed', () => {
  for (const [key, pelt] of Object.entries(PELTS)) {
    expect(pelt.label, `${key} label`).toBeTruthy();
    expect(patterns, `${key} pattern`).toContain(pelt.pattern);
    for (const channel of ['base', 'mark', 'eye'] as const) expect(pelt[channel], `${key} ${channel}`).toMatch(hex);
  }
});
