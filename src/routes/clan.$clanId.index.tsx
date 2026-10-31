import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Columns2, DatabaseBackup, FileUp, GitBranch, Leaf, Pencil, Plus, Search, Shield, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatAvatar } from '@/components/tree/CatAvatar';
import { CatDrawer } from '@/components/tree/CatDrawer';
import { ClanCrest } from '@/components/tree/ClanCrest';
import { ClanEditor } from '@/components/tree/ClanEditor';
import { TerritoryMap } from '@/components/tree/TerritoryMap';
import { AllegiancesExport } from '@/components/tree/AllegiancesExport';
import { SettingsButton } from '@/components/SettingsButton';
import { useForest } from '@/components/tree/ForestProvider';
import { addRelation, deleteClan, makeClanBackup, mergeClanBackup, newCat, parseClanBackup, removeRelation, type ClanBackup } from '@/lib/tree/ops';
import { sharedCats } from '@/lib/tree/shared-cats';
import { Switch } from '@/components/ui/switch';
import { allegianceCats, clanRoster, clanSectionOrder, clanTreeCats, sectionRows } from '@/lib/tree/clans';
import { catName, RANKS, type ClanPage, type Rank } from '@/lib/tree/types';

export const Route = createFileRoute('/clan/$clanId/')({
  head: ({ params }) => { const name = params.clanId === 'thunderclan' ? 'ThunderClan' : 'Clan'; return { meta: [{ title: `${name} Archive — Clantools` }, { name: 'description', content: `${name} leadership, roster, lore and territory map.` }, { property: 'og:title', content: `${name} Archive — Clantools` }, { property: 'og:description', content: 'Explore Clan leadership, members, territory and lore.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; },
  component: ClanOverview,
});

const RANK_HEADINGS: Record<string, string> = { Warrior: 'Warriors', Elder: 'Elders', Kit: 'Kits', Queen: 'Queens', Apprentice: 'Apprentices', None: 'Other cats' };
const SECTION_LABEL: Record<string, string> = { leadership: 'Leadership', lore: 'Lore', territory: 'Territory', allegiances: 'Allegiances' };

function ClanOverview() {
  const { clanId } = Route.useParams();
  const navigate = useNavigate();
  const { store, setStore } = useForest();
  const clan = store?.clans.find(c => c.id === clanId);
  const [includeStarClan, setIncludeStarClan] = useState(false);
  const [arrange, setArrange] = useState(false);
  const [editing, setEditing] = useState(false), [loreEdit, setLoreEdit] = useState(false), [query, setQuery] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false), [addName, setAddName] = useState(''), [addRank, setAddRank] = useState<Rank>('Warrior');
  const [pendingBackup, setPendingBackup] = useState<ClanBackup | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const cats = useMemo(() => clan ? clanRoster(store?.trees ?? [], clanId, clan.affiliation) : [], [store, clan, clanId]);
  const everyone = useMemo(() => sharedCats(store?.trees ?? []), [store]);
  const update = (patch: Partial<ClanPage>) => setStore(s => s && { ...s, clans: s.clans.map(c => c.id === clanId ? { ...c, ...patch } : c) });
  if (!store) return <main className="min-h-screen bg-background" />;
  if (!clan) return <main className="clan-page"><h1 className="clan-heading">Clan not found</h1><Button asChild variant="link"><Link to="/">All Clans</Link></Button></main>;

  const roster = allegianceCats(cats, includeStarClan);
  const filtered = roster.filter(c => c.names.some(n => n.toLowerCase().includes(query.toLowerCase())));
  const order = clanSectionOrder(clan);
  const half = clan.halfSections ?? [];
  const custom = clan.customSections ?? [];
  const move = (key: string, d: number) => { const o = [...order]; const i = o.indexOf(key), j = i + d; const a = o[i], b = o[j]; if (!a || !b) return; o[i] = b; o[j] = a; update({ sectionOrder: o }); };
  const toggleHalf = (key: string) => update({ halfSections: half.includes(key) ? half.filter(k => k !== key) : [...half, key] });
  const addSection = () => { const id = crypto.randomUUID(); update({ customSections: [...custom, { id, title: 'New section', body: '' }], sectionOrder: [...order, `custom:${id}`] }); };
  const reorderLore = (i: number, d: number) => { const sections = [...clan.sections]; const other = sections[i + d], current = sections[i]; if (!other || !current) return; sections[i] = other; sections[i + d] = current; update({ sections }); };

  const profile = profileId ? everyone.find(c => c.id === profileId) : undefined;
  const homeTree = store.trees.find(t => t.clanId === clanId && profileId && t.cats.some(c => c.id === profileId));
  const editTree = (fn: (cats: typeof everyone) => typeof everyone) => homeTree && setStore(s => s && { ...s, trees: s.trees.map(t => t.id === homeTree.id ? { ...t, cats: fn(t.cats), updatedAt: Date.now() } : t) });

  const addCat = () => {
    const name = addName.trim(); if (!name) return;
    const cat = newCat({ names: [name], clan: clan.affiliation, rank: addRank });
    setStore(s => {
      if (!s) return s;
      const own = s.trees.find(t => t.clanId === clanId);
      if (own) return { ...s, trees: s.trees.map(t => t.id === own.id ? { ...t, cats: [...t.cats, cat], updatedAt: Date.now() } : t) };
      // First edit for a Clan without its own lineage: keep its discovered members.
      const base = sharedCats(s.trees);
      const seed = clanTreeCats({ id: '', name: '', cats: base, updatedAt: 0 }, clan.affiliation);
      return { ...s, trees: [...s.trees, { id: crypto.randomUUID(), name: `${clan.name} lineage`, clanId, cats: [...seed, cat], updatedAt: Date.now() }] };
    });
    setAdding(false); setAddName(''); toast.success(`${name} joined ${clan.name}`); setProfileId(cat.id);
  };
  const downloadClan = () => {
    const b = makeClanBackup(store, clanId); if (!b) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }));
    a.download = `${clan.name.replace(/[^\w-]+/g, '_')}_clan_backup.json`; a.click(); URL.revokeObjectURL(a.href); toast.success('Clan backup downloaded');
  };
  const readClan = async (f?: File) => { if (!f) return; try { const b = parseClanBackup(JSON.parse(await f.text())); if (!b) throw new Error(); setPendingBackup(b); } catch { toast.error("That file isn't a Clantools Clan backup."); } };

  const openCat = (id: string) => setProfileId(id);
  const sectionContent = (key: string): React.ReactNode => {
    if (key === 'leadership') return <section className="grid gap-5 sm:grid-cols-3">{[{ rank: 'Leader', Icon: Star }, { rank: 'Deputy', Icon: Shield }, { rank: 'Medicine Cat', Icon: Leaf }].map(({ rank: r, Icon }) => <div key={r}><h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Icon size={16} />{r}</h2><div className="flex flex-col items-start gap-4">{cats.filter(c => c.rank === r && c.status === 'Living').map(c => <Button variant="ghost" className="h-auto max-w-full justify-start gap-3 whitespace-normal px-3 py-2 text-left" key={c.id} onClick={() => openCat(c.id)}><CatAvatar avatar={c.avatar} className="h-12 w-12 shrink-0" /><span className="font-display text-lg">{catName(c)}</span></Button>)}{!cats.some(c => c.rank === r && c.status === 'Living') && <p className="text-sm text-muted-foreground">Not recorded</p>}</div></div>)}</section>;
    if (key === 'lore') return <section><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">Lore</h2><div className="flex gap-2"><Button variant={loreEdit ? 'default' : 'outline'} size="sm" onClick={() => setLoreEdit(v => !v)}><Pencil />{loreEdit ? 'Done' : 'Edit'}</Button><Button variant="outline" size="sm" onClick={() => { update({ sections: [...clan.sections, { id: crypto.randomUUID(), title: 'New entry', body: '' }] }); setLoreEdit(true); }}><Plus />Entry</Button></div></div><div className={`grid gap-4 ${half.includes('lore') ? '' : 'md:grid-cols-2 lg:grid-cols-3'}`}>{clan.sections.map((section, i) => <div key={section.id} className="space-y-3 border-l-2 border-border pl-4">{loreEdit ? <><Input aria-label="Entry title" value={section.title} onChange={e => update({ sections: clan.sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s) })} /><Textarea aria-label={`${section.title} description`} rows={5} value={section.body} onChange={e => update({ sections: clan.sections.map(s => s.id === section.id ? { ...s, body: e.target.value } : s) })} /><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Move ${section.title} up`} disabled={i === 0} onClick={() => reorderLore(i, -1)}><ArrowUp /></Button><Button variant="ghost" size="icon" aria-label={`Move ${section.title} down`} disabled={i === clan.sections.length - 1} onClick={() => reorderLore(i, 1)}><ArrowDown /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${section.title}`} onClick={() => update({ sections: clan.sections.filter(s => s.id !== section.id) })}><Trash2 /></Button></div></> : <><h3 className="font-display text-xl">{section.title}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{section.body || 'No history recorded.'}</p></>}</div>)}</div>{!clan.sections.length && <p className="text-sm text-muted-foreground">No lore recorded.</p>}</section>;
    if (key === 'territory') return <TerritoryMap clan={clan} onUpdate={update} />;
    if (key === 'allegiances') return <section><div className="mb-4 flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-2xl font-semibold">Allegiances <span className="text-base text-muted-foreground">{roster.length}</span></h2><div className="flex flex-wrap items-center gap-3"><Button size="sm" onClick={() => setAdding(true)}><Plus />Add cat</Button><AllegiancesExport clanName={clan.name} cats={roster} targetId="allegiances-list" /><label className="flex items-center gap-2 text-sm"><Switch checked={includeStarClan} onCheckedChange={setIncludeStarClan} aria-label="Include StarClan cats" />StarClan cats</label><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input aria-label="Search Clan cats" className="pl-9" placeholder="Search cats…" value={query} onChange={e => setQuery(e.target.value)} /></div></div></div>
      <div id="allegiances-list" className="mx-auto max-w-4xl space-y-5 bg-background font-sans">{['Leader', 'Deputy', 'Medicine Cat', 'Warrior', 'Apprentice', 'Queen', 'Kit', 'Elder', 'None'].map(r => {
        const members = filtered.filter(c => c.rank === r);
        if (!members.length) return null;
        return <div className="allegiance-row" key={r}><h3 className="pt-1 text-base font-bold uppercase underline underline-offset-4">{RANK_HEADINGS[r] ?? r}</h3><div className="space-y-4">{members.map(c => <div key={c.id}><Button variant="link" className="h-auto w-full justify-start whitespace-normal p-0 text-left text-foreground" onClick={() => openCat(c.id)}><span className="text-base leading-relaxed"><span className={`allegiance-name ${c.status !== 'Living' ? 'deceased-name' : ''}`}>{catName(c)}</span> — {c.appearance || `${c.gender.toLowerCase()}`}{c.status !== 'Living' && <span className="text-muted-foreground"> · {c.status}</span>}</span></Button><div className="flex flex-col items-start gap-1">{roster.filter(a => a.rank === 'Apprentice' && a.mentors.includes(c.id)).map(a => <Button key={a.id} variant="link" className="mt-1 flex h-auto w-fit justify-start p-0 text-foreground" onClick={() => openCat(a.id)}><span className="text-sm font-bold">Apprentice, {catName(a)}</span></Button>)}</div></div>)}</div></div>;
      })}</div>{!filtered.length && <p className="text-sm text-muted-foreground">No cats found.</p>}</section>;
    const sec = custom.find(s => `custom:${s.id}` === key);
    if (!sec) return null;
    const set = (patch: Partial<typeof sec>) => update({ customSections: custom.map(s => s.id === sec.id ? { ...s, ...patch } : s) });
    return <section>{arrange ? <div className="space-y-2"><Input aria-label="Section title" value={sec.title} onChange={e => set({ title: e.target.value })} /><Textarea aria-label={`${sec.title} text`} rows={5} value={sec.body} onChange={e => set({ body: e.target.value })} placeholder="Write anything: customs, prophecies, rivalries…" /></div> : <><h2 className="mb-3 font-display text-2xl font-semibold">{sec.title}</h2><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{sec.body || 'Nothing written yet.'}</p></>}</section>;
  };
  const label = (key: string) => SECTION_LABEL[key] ?? custom.find(s => `custom:${s.id}` === key)?.title ?? 'Section';

  return <main className="min-h-screen bg-background"><div className="clan-page"><header className="flex items-center justify-between border-b border-border pb-3"><Link to="/" className="site-wordmark rounded-sm" aria-label="Clantools home">Clantools</Link><SettingsButton /></header>
    <div className="mb-4 mt-3 flex flex-wrap items-center gap-4">
      <div style={{ color: clan.color }}><ClanCrest crest={clan.crest} className="crest-bounce h-20 w-20" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><h1 className="clan-heading">{clan.name}</h1><div className="flex items-center gap-2"><Button asChild className="h-11 px-5 text-base"><Link to="/clan/$clanId/lineage" params={{ clanId }}><GitBranch className="size-5" />Lineage</Link></Button><Button variant="outline" size="icon" className="h-11 w-11" title="Edit Clan" aria-label="Edit Clan" onClick={() => setEditing(true)}><Pencil className="size-5" /></Button></div></div>
        <p className="mt-1 text-sm text-muted-foreground">{cats.length} members{clan.motto && <span className="italic"> · “{clan.motto}”</span>}</p>
      </div>
      <Button variant={arrange ? 'default' : 'outline'} size="sm" className="self-start" onClick={() => setArrange(v => !v)}><Pencil />{arrange ? 'Done' : 'Edit sections'}</Button>
    </div>
    {sectionRows(order, half).map(row => <div key={row.join('|')} className={`grid gap-6 border-b border-border py-4 ${row.length === 2 ? 'md:grid-cols-2' : ''}`}>{row.map(key => { const i = order.indexOf(key); return <div key={key} className="min-w-0">
      {arrange && <div className="mb-3 flex flex-wrap items-center justify-end gap-1 rounded-md bg-muted/60 px-2 py-1"><span className="mr-auto text-sm font-medium">{label(key)}</span>
        {key !== 'allegiances' && <Button variant={half.includes(key) ? 'secondary' : 'ghost'} size="sm" aria-pressed={half.includes(key)} onClick={() => toggleHalf(key)} title="Half width: sits beside the next half-width section"><Columns2 />Half width</Button>}
        <Button variant="ghost" size="icon" aria-label={`Move ${label(key)} up`} disabled={i === 0} onClick={() => move(key, -1)}><ArrowUp /></Button>
        <Button variant="ghost" size="icon" aria-label={`Move ${label(key)} down`} disabled={i === order.length - 1} onClick={() => move(key, 1)}><ArrowDown /></Button>
        {key.startsWith('custom:') && <Button variant="ghost" size="icon" aria-label={`Delete ${label(key)}`} onClick={() => update({ customSections: custom.filter(s => `custom:${s.id}` !== key), sectionOrder: order.filter(k => k !== key) })}><Trash2 /></Button>}
      </div>}
      {sectionContent(key)}</div>; })}</div>)}
    {arrange && <div className="py-4 text-center"><Button variant="outline" onClick={addSection}><Plus />Add section</Button></div>}
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground"><span>Back up just this Clan:</span><Button variant="outline" size="sm" onClick={downloadClan}><DatabaseBackup />Download Clan backup</Button><Button variant="outline" size="sm" onClick={() => file.current?.click()}><FileUp />Import Clan backup</Button><input ref={file} type="file" accept="application/json,.json" className="hidden" aria-label="Clan backup file" onChange={e => { readClan(e.target.files?.[0]); e.target.value = ''; }} /></div>
  </div>
  {editing && <ClanEditor value={clan} onDelete={() => { setStore(s => s && deleteClan(s, clanId)); navigate({ to: '/' }); }} onClose={() => setEditing(false)} onSave={updated => { update(updated); setEditing(false); }} />}
  {adding && <Dialog open onOpenChange={setAdding}><DialogContent><DialogHeader><DialogTitle>Add a cat to {clan.name}</DialogTitle></DialogHeader><form id="add-cat" className="space-y-3" onSubmit={e => { e.preventDefault(); addCat(); }}><label className="block space-y-1 text-sm">Name<Input autoFocus value={addName} onChange={e => setAddName(e.target.value)} placeholder="Sparrowpelt" /></label><label className="block space-y-1 text-sm">Rank<Select value={addRank} onValueChange={v => setAddRank(v as Rank)}><SelectTrigger aria-label="Rank"><SelectValue /></SelectTrigger><SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></label><p className="text-xs text-muted-foreground">They're added to this Clan's lineage too, so you can connect family later.</p></form><DialogFooter><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" form="add-cat" disabled={!addName.trim()}>Add cat</Button></DialogFooter></DialogContent></Dialog>}
  {pendingBackup && <Dialog open onOpenChange={v => !v && setPendingBackup(null)}><DialogContent><DialogHeader><DialogTitle>Import {pendingBackup.clan.name}?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">This adds the Clan with its {pendingBackup.trees.length} lineage{pendingBackup.trees.length === 1 ? '' : 's'}. If a Clan with the same web address already exists, it and its lineages are replaced. Other Clans are untouched.</p><DialogFooter><Button variant="outline" onClick={() => setPendingBackup(null)}>Cancel</Button><Button onClick={() => { const b = pendingBackup; setStore(s => s && mergeClanBackup(s, b)); setPendingBackup(null); toast.success('Clan imported'); navigate({ to: '/clan/$clanId', params: { clanId: b.clan.id } }); }}>Import Clan</Button></DialogFooter></DialogContent></Dialog>}
  {profile && <CatDrawer key={profile.id} cat={profile} cats={homeTree?.cats ?? everyone} affiliations={store.clans.map(c => c.affiliation)}
    onClose={() => setProfileId(null)} onSelect={setProfileId}
    onViewInLineage={() => { setProfileId(null); navigate({ to: '/clan/$clanId/lineage', params: { clanId }, search: { cat: profile.id, ...(homeTree ? { tree: homeTree.id } : {}) } }); }}
    onUpdate={patch => setStore(s => s && { ...s, trees: s.trees.map(t => t.cats.some(c => c.id === profile.id) ? { ...t, updatedAt: Date.now(), cats: t.cats.map(c => c.id === profile.id ? { ...c, ...patch } : c) } : t) })}
    onAddRel={(kind, other) => editTree(c => addRelation(c, profile.id, kind, other))}
    onRemoveRel={(kind, other) => editTree(c => removeRelation(c, profile.id, kind, other))} />}
  </main>;
}
