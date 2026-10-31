import { createFileRoute } from '@tanstack/react-router';
import { InformationPage } from '@/components/InformationPage';

export const Route = createFileRoute('/devlog')({
  head: () => ({ meta: [{ title: 'Devlog — Clantools' }, { name: 'description', content: 'What has changed in Clantools, the Warrior Cats Clan planner.' }, { property: 'og:title', content: 'Clantools Devlog' }, { property: 'og:description', content: 'Updates and new features in the Warrior Cats Clan planner.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Devlog,
});

const ENTRIES = [
  { title: 'Profiles, sections and polish', items: ['Cat profiles open in the center with a full-body drawing or your own uploaded picture.', 'Clans can have a motto, your own extra sections, and half-width sections side by side.', 'Add cats straight from Allegiances, and back up or import a single Clan.', 'Undo and redo on the lineage (last 10 changes), keyboard controls and clearer focus outlines.', 'New “Monochrome (full)” theme; regular Monochrome keeps cat art in color.'] },
  { title: 'Tools and themes', items: ['Expanded cat creator with real coat colors, scars and collars.', 'Kinship checker, Allegiances exporter, name ideas and the tree minimap.', 'Full backups, color themes (including colorblind-friendly ones) and text size.'] },
  { title: 'Shared characters', items: ['Cats can appear in several lineages, with chosen relatives imported.', 'Same-name cats prompt you to combine them or keep them separate.'] },
  { title: 'First release', items: ['Automatic family tree layout, Clan pages, territory maps and lore.'] },
];

function Devlog() {
  return <InformationPage title="Devlog">
    {ENTRIES.map(e => <section key={e.title}><h2>{e.title}</h2><ul className="list-disc space-y-1 pl-5">{e.items.map(i => <li key={i}>{i}</li>)}</ul></section>)}
  </InformationPage>;
}
