import type { Cat, ClanPage, Tree } from './types';

export function allegianceCats(cats: Cat[], includeStarClan = false) {
  return cats.filter(c => c.status === 'Living' || (includeStarClan && c.status === 'StarClan'));
}

export const CRESTS = ['ThunderClan', 'ShadowClan', 'WindClan', 'RiverClan', 'SkyClan', 'StarClan', 'BloodClan', 'Leaf', 'Feather', 'Flame', 'Mountain', 'Flower', 'Fish', 'Sun', 'Snow', 'Paw'];
export const CLAN_COLORS = ['var(--clan-thunder)', 'var(--clan-shadow)', 'var(--clan-wind)', 'var(--clan-river)', 'var(--clan-sky)', 'var(--clan-star)', 'var(--clan-blood)', 'var(--clan-kittypet)', 'var(--clan-forest)', 'var(--clan-moss)', 'var(--clan-teal)', 'var(--clan-navy)', 'var(--clan-plum)', 'var(--clan-rust)', 'var(--clan-ember)', 'var(--clan-sand)', 'var(--clan-slate)'];
export function initialClans(_treeId: string): ClanPage[] {
  return ['ThunderClan'].map((name, i) => ({
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

/** Readable, unique URL id from a Clan name (e.g. "Light Clan" -> "light-clan"). */
export function clanSlug(name: string, taken: string[]) {
  const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'clan';
  let id = base, n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}
export const BASE_SECTIONS = ['leadership', 'lore', 'territory', 'allegiances'];
/** Top-level section keys in display order, including custom sections. */
export function clanSectionOrder(clan: ClanPage) {
  const all = [...BASE_SECTIONS, ...(clan.customSections ?? []).map(s => `custom:${s.id}`)];
  return [...new Set([...(clan.sectionOrder ?? []), ...all])].filter(k => all.includes(k));
}
/** Groups section keys into rows; adjacent half-width sections share a row. Allegiances is always full. */
export function sectionRows(order: string[], half: string[] = []) {
  const rows: string[][] = [];
  for (const k of order) {
    const isHalf = k !== 'allegiances' && half.includes(k);
    const last = rows[rows.length - 1];
    if (isHalf && last && last.length === 1 && last[0] !== 'allegiances' && half.includes(last[0]!)) last.push(k);
    else rows.push([k]);
  }
  return rows;
}
