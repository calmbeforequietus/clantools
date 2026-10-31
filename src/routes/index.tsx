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
  return <main className="bg-background"><div className="clan-page"><header className="flex items-center justify-between border-b border-border pb-3"><span className="site-wordmark">Clantools</span></header>
    <div className="mb-5 mt-6 text-center"><h1 className="clan-heading">The Clans</h1></div>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">{store?.clans.map(clan => <Link key={clan.id} to="/clan/$clanId" params={{ clanId: clan.id }} className="group flex h-48 w-36 flex-col items-center justify-center gap-3 border-b border-border py-4 transition-colors hover:bg-muted/60 sm:w-52"><div style={{ color: clan.color }}><ClanCrest crest={clan.crest} className="h-20 w-20 transition-transform group-hover:-translate-y-1" /></div><div className="flex items-center gap-2"><h2 className="font-display text-xl font-semibold">{clan.name}</h2><ArrowUpRight size={16} className="text-muted-foreground" /></div><span className="text-xs text-muted-foreground">{clanRoster(store.trees, clan.id, clan.affiliation).length} cats</span></Link>)}
    <Button variant="ghost" className="h-48 w-36 flex-col gap-4 self-stretch rounded-none border-b border-dashed border-border text-muted-foreground sm:w-52" onClick={() => setAdding(true)}><Plus className="size-10" /><span>New Clan</span></Button></div>
  </div>{adding && <ClanEditor onClose={() => setAdding(false)} onSave={clan => { setStore(s => s && { ...s, clans: [...s.clans, clan] }); setAdding(false); }} />}</main>;
}
