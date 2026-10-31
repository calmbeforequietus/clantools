import type { ClanPage, Tree } from './types';

export const CRESTS = ['ThunderClan', 'ShadowClan', 'WindClan', 'RiverClan', 'SkyClan', 'StarClan', 'BloodClan', 'Leaf', 'Feather', 'Flame', 'Mountain', 'Flower', 'Fish', 'Sun', 'Snow', 'Paw'];
export const CLAN_COLORS = ['var(--clan-thunder)', 'var(--clan-shadow)', 'var(--clan-wind)', 'var(--clan-river)', 'var(--clan-sky)', 'var(--clan-star)', 'var(--clan-blood)', 'var(--clan-kittypet)'];
export function initialClans(_treeId: string): ClanPage[] {
  return ['ThunderClan', 'ShadowClan', 'WindClan', 'RiverClan', 'SkyClan', 'StarClan', 'BloodClan'].map((name, i) => ({
    id: name === 'ThunderClan' ? 'thunderclan' : name.toLowerCase(), name, affiliation: name,
    crest: name, color: CLAN_COLORS[i] ?? CLAN_COLORS[0] ?? 'var(--primary)',
    sections: [], pins: [], eras: name === 'ThunderClan' ? [
      { id: 'bluestar-era', name: 'Bluestar Era' }, { id: 'firestar-era', name: 'Firestar Era' }, { id: 'bramblestar-era', name: 'Bramblestar Era' },
    ] : [],
  }));
}

export function clanTreeCats(tree: Tree, affiliation: string) {
  const keep = new Set(tree.cats.filter(c => c.clan === affiliation).map(c => c.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of tree.cats) {
      if (!keep.has(c.id)) continue;
      for (const id of [...c.parents, ...c.fosterParents, ...c.mates, ...c.mentors]) {
        if (!keep.has(id)) { keep.add(id); changed = true; }
      }
      for (const other of tree.cats) if (other.mates.includes(c.id)) keep.add(other.id);
    }
  }
  return tree.cats.filter(c => keep.has(c.id));
}