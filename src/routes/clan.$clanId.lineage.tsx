import { createFileRoute } from '@tanstack/react-router';
import { LineagePage } from '@/components/tree/LineagePage';
export const Route = createFileRoute('/clan/$clanId/lineage')({
 validateSearch: (search: Record<string, unknown>): { cat?: string | undefined } => ({ cat: typeof search['cat'] === 'string' ? search['cat'] : undefined }),
 head: () => ({ meta: [{ title: 'Warrior Cats Lineage — Clantools' }, { name: 'description', content: 'Explore generations, mates and mentors in an interactive Clan tree.' }, { property: 'og:title', content: 'Warrior Cats Lineage — Clantools' }, { property: 'og:description', content: 'Interactive family trees with life stages and relationship histories.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: LineagePage,
});
