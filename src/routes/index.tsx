import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clanRoster } from "@/lib/tree/clans";
import { ClanCrest } from '@/components/tree/ClanCrest';
import { ClanEditor } from '@/components/tree/ClanEditor';
import { useForest } from '@/components/tree/ForestProvider';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [ { title: 'Clantools — The Clans' }, { name: 'description', content: 'Explore Warrior Cats Clans, territory lore and family lineages.' }, { property: 'og:title', content: 'Clantools — The Clans' }, { property: 'og:description', content: 'Clan histories, territory and Warrior Cats family trees.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
  component: ClanGateway,
});
function ClanGateway() {
  const { store, setStore } = useForest();
  const [adding, setAdding] = useState(false);
  return <main className="min-h-screen bg-background"><div className="clan-page"><header className="flex items-center justify-between border-b border-border pb-5"><span className="font-display text-xl font-semibold text-primary">Clantools</span></header>
    <div className="mb-12 mt-12 flex flex-wrap items-end justify-between gap-4"><div><h1 className="clan-heading">The Clans</h1></div><span className="text-sm text-muted-foreground">{store?.clans.length ?? '—'} Clans</span></div>
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 lg:grid-cols-4">{store?.clans.map(clan => <Link key={clan.id} to="/clan/$clanId" params={{ clanId: clan.id }} className="group flex min-h-60 flex-col items-center justify-center gap-5 border-b border-border py-8 transition-colors hover:bg-muted/60"><div style={{ color: clan.color }}><ClanCrest crest={clan.crest} className="h-28 w-28 transition-transform group-hover:-translate-y-1" /></div><div className="flex items-center gap-2"><h2 className="font-display text-xl font-semibold">{clan.name}</h2><ArrowUpRight size={16} className="text-muted-foreground" /></div><span className="text-xs text-muted-foreground">{clanRoster(store.trees, clan.id, clan.affiliation).length} cats</span></Link>)}
    <Button variant="ghost" className="min-h-60 flex-col gap-4 border-b border-dashed border-border text-muted-foreground" onClick={() => setAdding(true)}><Plus className="size-10" /><span>New Clan</span></Button></div>
  </div>{adding && <ClanEditor onClose={() => setAdding(false)} onSave={clan => { setStore(s => s && { ...s, clans: [...s.clans, clan] }); setAdding(false); }} />}</main>;
}
