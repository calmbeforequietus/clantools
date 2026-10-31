import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clanRoster } from "@/lib/tree/clans";
import { ClanCrest } from '@/components/tree/ClanCrest';
import { ClanEditor } from '@/components/tree/ClanEditor';
import { SettingsButton } from '@/components/SettingsButton';
import { BackupControls } from '@/components/tree/BackupControls';
import { useForest } from '@/components/tree/ForestProvider';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [ { title: 'Clantools — The Clans' }, { name: 'description', content: 'Plan Warrior Cats Clans: allegiances, family trees, territory maps and lore, saved in your browser.' }, { property: 'og:title', content: 'Clantools — The Clans' }, { property: 'og:description', content: 'Clan histories, territory and Warrior Cats family trees.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
  component: ClanGateway,
});
function ClanGateway() {
  const { store, setStore } = useForest();
  const [adding, setAdding] = useState(false);
  return <main className="bg-background"><div className="clan-page"><header className="flex items-center justify-between border-b border-border pb-3"><span className="site-wordmark">Clantools</span><SettingsButton /></header>
    <div className="mb-5 mt-6 text-center"><h1 className="clan-heading">The Clans</h1><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Build your Clans, from allegiances and family trees to territory maps and lore.</p></div>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-4">{store?.clans.map(clan => <Link key={clan.id} to="/clan/$clanId" params={{ clanId: clan.id }} className="group flex min-h-[14rem] w-40 sm:w-52 flex-col items-center justify-between border-b border-border py-4 transition-colors hover:bg-muted/60"><div className="flex flex-col items-center gap-2"><div style={{ color: clan.color }}><ClanCrest crest={clan.crest} className="crest-bounce h-16 w-16 sm:h-18 sm:w-18" /></div><div className="flex items-center gap-1.5"><h2 className="font-display text-lg sm:text-xl font-semibold">{clan.name}</h2><ArrowUpRight size={15} className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>{clan.motto && <p className="px-2 text-center text-xs italic font-serif text-muted-foreground">“{clan.motto}”</p>}</div><span className="mt-2 text-xs text-muted-foreground">{clanRoster(store.trees, clan.id, clan.affiliation).length} cats</span></Link>)}
    <Button variant="ghost" className="flex min-h-[14rem] w-40 sm:w-52 flex-col items-center justify-center gap-3 self-stretch rounded-none border-b border-dashed border-border text-muted-foreground" onClick={() => setAdding(true)}><Plus className="size-9" /><span>New Clan</span></Button></div>
    <BackupControls />
  </div>{adding && <ClanEditor existingIds={store?.clans.map(c => c.id) ?? []} onClose={() => setAdding(false)} onSave={clan => { setStore(s => s && { ...s, clans: [...s.clans, clan] }); setAdding(false); }} />}</main>;
}
