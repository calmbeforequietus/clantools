import { describe, expect, it } from 'vitest';
import { clanSlug, sectionRows } from './clans';
import { factoryStore, makeClanBackup, mergeClanBackup, parseClanBackup, pushHistory, UNDO_LIMIT } from './ops';
import { parseSettings } from '../settings';
import { PREFIXES, SUFFIXES } from './names';

describe('feedback batch rules', () => {
  it('builds a Clan web address from its name and avoids collisions', () => {
    expect(clanSlug('LightClan', ['thunderclan'])).toBe('lightclan');
    expect(clanSlug('Light Clan', [])).toBe('light-clan');
    expect(clanSlug('ThunderClan', ['thunderclan'])).toBe('thunderclan-2');
  });
  it('keeps the full monochrome option', () => {
    expect(parseSettings('{"theme":"mono-full"}').theme).toBe('mono-full');
    expect(parseSettings('{"theme":"mono"}').theme).toBe('mono');
  });
  it('undo keeps only the last 10 changes', () => {
    let stack: number[] = [];
    for (let i = 0; i < 15; i++) stack = pushHistory(stack, i);
    expect(UNDO_LIMIT).toBe(10);
    expect(stack).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('pairs adjacent half-width sections but never Allegiances', () => {
    expect(sectionRows(['leadership', 'lore', 'territory', 'allegiances'], ['leadership', 'lore', 'allegiances'])).toEqual([['leadership', 'lore'], ['territory'], ['allegiances']]);
  });
  it('round-trips one Clan backup without touching other Clans', () => {
    const store = factoryStore();
    const other = { ...store.clans[0]!, id: 'lightclan', name: 'LightClan' };
    const withOther = { ...store, clans: [...store.clans, other] };
    const backup = parseClanBackup(JSON.parse(JSON.stringify(makeClanBackup(withOther, 'thunderclan'))));
    expect(backup?.trees).toHaveLength(1);
    const merged = mergeClanBackup({ ...withOther, clans: [other], trees: [] }, backup!);
    expect(merged.clans.map(c => c.id).sort()).toEqual(['lightclan', 'thunderclan']);
    expect(merged.trees).toHaveLength(1);
  });
  it('has a broad canon name pool', () => {
    expect(PREFIXES.length).toBeGreaterThan(200);
    expect(SUFFIXES).toContain('star'.replace('star', 'heart'));
  });
});
