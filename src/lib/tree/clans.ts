import type { ClanPage, Tree } from './types';

export const CRESTS = ['ThunderClan', 'ShadowClan', 'WindClan', 'RiverClan', 'SkyClan', 'StarClan', 'BloodClan', 'Leaf', 'Feather', 'Flame', 'Mountain', 'Flower', 'Fish', 'Sun', 'Snow', 'Paw'];
export const CLAN_COLORS = ['var(--clan-thunder)', 'var(--clan-shadow)', 'var(--clan-wind)', 'var(--clan-river)', 'var(--clan-sky)', 'var(--clan-star)', 'var(--clan-blood)', 'var(--clan-kittypet)'];
export function initialClans(_treeId: string): ClanPage[] {
  return ['ThunderClan', 'ShadowClan', 'WindClan', 'RiverClan'].map((name, i) => ({
    id: name === 'ThunderClan' ? 'thunderclan' : name.toLowerCase(), name, affiliation: name,
    crest: name, color: CLAN_COLORS[i] ?? CLAN_COLORS[0] ?? 'var(--primary)',
    sections: [], pins: [], eras: [],
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
// A Clan's own saved trees define its roster once it has one. Before that,
// discover available members in the original imported/preset trees.
export function clanRoster(trees: Tree[], clanId: string, affiliation: string) {
  const own = trees.filter(t => t.clanId === clanId);
  const source = own.length ? own : trees;
  const byId = new Map<string, typeof trees[number]['cats'][number]>();
  for (const tree of [...source].sort((a,b) => a.updatedAt-b.updatedAt)) for (const cat of tree.cats) byId.set(cat.id, cat);
  return [...byId.values()].filter(c => c.clan === affiliation);
}
