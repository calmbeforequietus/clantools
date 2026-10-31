import { describe, expect, it } from 'vitest';
import { checkKinship } from './kinship-check';
import { allegiancesText } from './allegiances-export';
import { suggestNames } from './names';
import { makeBackup, newCat, parseBackup, factoryStore } from './ops';
import { normalizeIcon } from './cat-icon';
import { parseSettings } from '../settings';
import type { Cat } from './types';

const cat = (id: string, p: Partial<Cat> = {}) => ({ ...newCat({ names: [id], ...p }), id });
// gp → (pa, pb siblings via ma+gp) ; pa → a ; pb → b  ⇒ a and b are first cousins
const gp = cat('gp', { gender: 'Tom' }), gm = cat('gm', { gender: 'She-cat' });
const pa = cat('pa', { parents: ['gp', 'gm'] }), pb = cat('pb', { parents: ['gp', 'gm'] }), half = cat('half', { parents: ['gp'] });
const a = cat('a', { parents: ['pa'] }), b = cat('b', { parents: ['pb'] });
const fam = [gp, gm, pa, pb, half, a, b];

describe('kinship checker', () => {
  it('finds full siblings', () => expect(checkKinship(fam, 'pa', 'pb').label).toBe('Full siblings'));
  it('finds half-siblings', () => expect(checkKinship(fam, 'pa', 'half').label).toBe('Half-siblings'));
  it('finds first cousins with both grandparents shared', () => {
    const r = checkKinship(fam, 'a', 'b');
    expect(r.label).toBe('First cousins');
    expect(r.shared.map(s => s.id).sort()).toEqual(['gm', 'gp']);
  });
  it('finds grandparents', () => expect(checkKinship(fam, 'a', 'gp').label).toBe('Grandparent of the first cat'));
  it('reports unrelated cats', () => expect(checkKinship([...fam, cat('x')], 'a', 'x').closeness).toBe('none'));
});

describe('allegiances export', () => {
  it('lists ranks book-style with apprentices under mentors', () => {
    const l = cat('l', { names: ['Firestar'], rank: 'Leader', appearance: 'ginger tom' });
    const w = cat('w', { names: ['Graystripe'], rank: 'Warrior', appearance: 'gray tom' });
    const ap = cat('p', { names: ['Brackenpaw'], rank: 'Apprentice', mentors: ['w'] });
    const t = allegiancesText('ThunderClan', [l, w, ap]);
    expect(t).toContain('LEADER\nFIRESTAR — ginger tom');
    expect(t).toContain('GRAYSTRIPE — gray tom\n    APPRENTICE, BRACKENPAW');
    expect(allegiancesText('ThunderClan', [l], true)).toContain('**FIRESTAR**');
  });
});

describe('name generator', () => {
  it('uses the stage suffix', () => {
    expect(suggestNames(4, 'kit').every(n => n.endsWith('kit'))).toBe(true);
    expect(suggestNames(4, 'star').every(n => n.endsWith('star'))).toBe(true);
  });
  it('returns unique names', () => { const n = suggestNames(6); expect(new Set(n).size).toBe(n.length); });
});

describe('full backup', () => {
  it('round-trips every Clan and lineage', () => {
    const s = factoryStore();
    expect(parseBackup(JSON.parse(JSON.stringify(makeBackup(s))))?.trees).toHaveLength(s.trees.length);
  });
  it('rejects a single tree file', () => expect(parseBackup({ name: 'x', cats: [] })).toBeNull());
});

describe('icons and settings', () => {
  it('fills extras for old saved icons', () => expect(normalizeIcon({ coat: 'ginger' }).scars).toEqual([]));
  it('falls back to default theme and text size', () => expect(parseSettings('{"theme":"bogus","text":"lg"}')).toEqual({ theme: 'forest', text: 'lg' }));
});
