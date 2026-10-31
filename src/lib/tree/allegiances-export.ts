import { catName, type Cat } from './types';

const GROUPS: { rank: Cat['rank']; title: string; note?: string }[] = [
  { rank: 'Leader', title: 'LEADER' },
  { rank: 'Deputy', title: 'DEPUTY' },
  { rank: 'Medicine Cat', title: 'MEDICINE CAT' },
  { rank: 'Warrior', title: 'WARRIORS', note: 'toms and she-cats without kits' },
  { rank: 'Apprentice', title: 'APPRENTICES', note: 'more than six moons old, in training to become warriors' },
  { rank: 'Queen', title: 'QUEENS', note: 'she-cats expecting or nursing kits' },
  { rank: 'Kit', title: 'KITS' },
  { rank: 'Elder', title: 'ELDERS', note: 'former warriors and queens, now retired' },
  { rank: 'None', title: 'OTHER CATS' },
];

/** Book-style Allegiances. Markdown bolds headings and names for Discord/AO3. */
export function allegiancesText(clanName: string, cats: Cat[], markdown = false) {
  const b = (s: string) => (markdown ? `**${s}**` : s);
  const lines = [markdown ? `# ${clanName.toUpperCase()}` : clanName.toUpperCase(), ''];
  for (const g of GROUPS) {
    const members = cats.filter(c => c.rank === g.rank);
    if (!members.length) continue;
    const title = g.rank === 'Medicine Cat' && members.length > 1 ? 'MEDICINE CATS' : g.title;
    lines.push(b(title) + (g.note ? ` (${g.note})` : ''));
    for (const c of members) {
      const desc = c.appearance?.trim() || c.gender.toLowerCase();
      lines.push(`${b(catName(c).toUpperCase())} — ${desc}${c.status !== 'Living' ? ` (${c.status})` : ''}`);
      for (const a of cats.filter(x => x.rank === 'Apprentice' && x.mentors.includes(c.id)))
        lines.push(`    APPRENTICE, ${catName(a).toUpperCase()}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}
