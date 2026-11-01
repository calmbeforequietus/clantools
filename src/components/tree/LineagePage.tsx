import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ChevronDown, GitCompare, Sparkles, Copy, Download, FilePlus2, FileUp, Focus, ImageDown, LayoutGrid, Maximize, Minus, Pencil, Plus, RotateCcw, Trash2, X, Undo2, Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForest } from "./ForestProvider";
import { pushHistory } from "@/lib/tree/ops";
import type { Store } from "@/lib/tree/ops";
import { clanTreeCats } from "@/lib/tree/clans";
import { checkRelation, type RelationWarning } from "@/lib/tree/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatDrawer } from "@/components/tree/CatDrawer";
import { TreeCanvas, type CanvasApi, type CanvasOptions } from "@/components/tree/TreeCanvas";
import { canonTree } from "@/lib/tree/canon";
import { computeKinship } from "@/lib/tree/kinship";
import { computeLayout } from "@/lib/tree/layout";
import {
  addRelation, deleteCat, isTree, moveLineage, newCat, removeRelation, type RelKind,
} from "@/lib/tree/ops";
import { catName, type Cat, type Tree } from "@/lib/tree/types";
import { sharedCats, reuseCat, matchingNames, combineCat } from '@/lib/tree/shared-cats';
import { ExistingCatPicker } from './ExistingCatPicker';
import { KinshipChecker } from './KinshipChecker';
import { SettingsButton } from '@/components/SettingsButton';

export function LineagePage() {
  const { store, setStore: rawSetStore } = useForest();
  const past = useRef<Store[]>([]), future = useRef<Store[]>([]), lastEdit = useRef(0);
  const storeRef = useRef(store); storeRef.current = store;
  /** Records an undo step (typing bursts within 800ms count as one) then applies the change. */
  const setStore: typeof rawSetStore = useCallback((next) => {
    const cur = storeRef.current;
    if (cur && Date.now() - lastEdit.current > 800) { past.current = pushHistory(past.current, cur); future.current = []; }
    lastEdit.current = Date.now();
    rawSetStore(next);
  }, [rawSetStore]);
  const [, bump] = useState(0);
  const undo = useCallback(() => { const prev = past.current.pop(); const cur = storeRef.current; if (!prev || !cur) return; future.current = pushHistory(future.current, cur); lastEdit.current = 0; rawSetStore({ ...prev, activeId: cur.activeId }); bump(n => n + 1); toast("Undone"); }, [rawSetStore]);
  const redo = useCallback(() => { const next = future.current.pop(); const cur = storeRef.current; if (!next || !cur) return; past.current = pushHistory(past.current, cur); lastEdit.current = 0; rawSetStore({ ...next, activeId: cur.activeId }); bump(n => n + 1); toast("Redone"); }, [rawSetStore]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, [contenteditable=true]"))) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);
  const navigate = useNavigate();
  const [moving, setMoving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [kinHighlight, setKinHighlight] = useState<Set<string> | null>(null);
  const [addingCat,setAddingCat]=useState(false);
  const [creatingRelation,setCreatingRelation]=useState<RelKind|null>(null);
  const [nameMatches,setNameMatches]=useState<Cat[]>([]);
  const [combining,setCombining]=useState<Cat|null>(null);
  const newIds=useRef(new Set<string>());
  const separateIds=useRef(new Set<string>());
  const [destination, setDestination] = useState('');
  const { clanId } = useParams({ from: '/clan/$clanId/lineage' });
  const search = useSearch({ from: '/clan/$clanId/lineage' });
  const clan = store?.clans.find(c => c.id === clanId);
  const [warning, setWarning] = useState<(RelationWarning & { kind: RelKind; other: string; pendingCat?: Cat }) | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(search.cat ?? null);
  const [drawer, setDrawer] = useState(!!search.cat);
  const [panKey, setPanKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [options, setOptions] = useState<CanvasOptions>({ showMentors: false, showFoster: false, showParents: true, showMates: true, showEras: false, hideUnrelated: false, snapToGrid: false });
  const api = useRef<CanvasApi>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!store || !clan) return;
    const existing = store.trees.find(t=>t.id===search.tree && t.clanId===clanId) ?? store.trees.find(t=>t.clanId===clanId && search.cat && t.cats.some(c=>c.id===search.cat)) ?? store.trees.find(t => t.clanId === clanId);
    if (!existing) {
      const shared = store.trees.flatMap(t => t.cats).filter((c, i, all) => all.findIndex(v => v.id === c.id) === i);
      const t: Tree = { id: crypto.randomUUID(), name: `${clan.name} Lineage`, cats: clanTreeCats({ id: '', name: '', cats: shared, updatedAt: 0 }, clan.affiliation), clanId, updatedAt: Date.now() };
      rawSetStore(s => s && { ...s, trees: [...s.trees, t], activeId: t.id });
    } else if (((search.tree || search.cat) && existing.id!==store.activeId) || store.trees.find(t => t.id === store.activeId)?.clanId !== clanId) {
      rawSetStore(s => s && { ...s, activeId: existing.id });
    }
  }, [clanId, clan, store, rawSetStore, search.tree, search.cat]);
  useEffect(() => { if (search.cat) { setFocusId(search.cat); setDrawer(true); setPanKey(k => k + 1); } }, [search.cat]);
  const tree = store?.trees.find(t => t.id === store.activeId && t.clanId === clanId) ?? store?.trees.find(t => t.clanId === clanId);
  const cats = tree?.cats ?? [];
  const positions = useMemo(() => computeLayout(cats), [cats]);
  const kinship = useMemo(() => (focusId && cats.some((c) => c.id === focusId) ? computeKinship(cats, focusId) : null), [cats, focusId]);
  const focused = cats.find((c) => c.id === focusId);
  useEffect(() => {
    if (!tree || search.cat) return;
    const leader = cats.find(c => c.clan === clan?.affiliation && c.rank === 'Leader' && c.status === 'Living');
    setFocusId(leader?.id ?? null);
    setDrawer(false);
  }, [tree?.id, search.cat]);

  const setCats = useCallback((fn: (c: Cat[]) => Cat[]) => {
    setStore((s) => s && { ...s, trees: s.trees.map((t) => (t.id === tree?.id ? { ...t, cats: fn(t.cats), updatedAt: Date.now() } : t)) });
  }, [tree?.id, setStore]);
  const switchTo = (id: string) => {
    rawSetStore((s) => s && { ...s, activeId: id });
    navigate({to:'/clan/$clanId/lineage',params:{clanId},search:{tree:id}});
    setFocusId(null);
    setDrawer(false);
  };
  const addTree = (t: Tree) => {
    setStore((s) => s && { ...s, trees: [...s.trees, { ...t, clanId }], activeId: t.id });
    navigate({to:'/clan/$clanId/lineage',params:{clanId},search:{tree:t.id}});
    setFocusId(null);
    setDrawer(false);
  };
  const select = (id: string | null) => {
    setFocusId(id);
    setDrawer(!!id);
  };

  if (!store || !tree || !clan) return <div className="h-screen bg-canvas" />;

  const actions = {
    newTree: () => {
      addTree({ id: crypto.randomUUID(), name: "Untitled Tree", cats: [], updatedAt: Date.now() });
    },
    rename: () => {
      const n = window.prompt("Rename tree", tree.name)?.trim();
      if (n) setStore((s) => s && { ...s, trees: s.trees.map((t) => (t.id === tree.id ? { ...t, name: n } : t)) });
    },
    duplicate: () => addTree({ ...structuredClone(tree), id: crypto.randomUUID(), name: `${tree.name} (copy)` }),
    remove: () => {
      if (store.trees.length === 1) { toast.error("You need at least one tree."); return; }
      if (!window.confirm(`Delete "${tree.name}"?`)) return;
      const rest = store.trees.filter((t) => t.id !== tree.id);
      const next = rest.find(t => t.clanId === clanId);
      if (!next) { toast.error("Keep at least one tree for this Clan."); return; }
      setStore({ ...store, trees: rest, activeId: next.id });
      select(null);
    },
    canon: () => addTree(canonTree(crypto.randomUUID())),
    exportJson: () => {
      const blob = new Blob([JSON.stringify(tree, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${tree.name.replace(/[^\w-]+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    importJson: async (f?: File) => {
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!isTree(data)) throw new Error();
        addTree({ ...data, id: crypto.randomUUID(), updatedAt: Date.now() });
        toast.success(`Imported "${data.name}"`);
      } catch {
        toast.error("That file isn't a valid family tree.");
      }
    },
    png: async () => {
      const t = toast.loading("Rendering image…");
      try {
        await api.current?.exportPng(tree.name);
        toast.success("Image downloaded", { id: t });
      } catch {
        toast.error("Couldn't render the image. Linked web images can block export.", { id: t });
      }
    },
    addCat: (name='New Cat') => {
      const c = newCat({ clan: focused?.clan ?? clan.affiliation,names:[name] });
      newIds.current.add(c.id);
      setCats((cs) => [...cs, c]);
      select(c.id);
    },
    resetLayout: () => {
      const n = cats.filter(c => c.pos).length;
      if (n) setCats(cs => cs.map(c => (c.pos ? { ...c, pos: undefined } : c)));
      toast.success(n === 1 ? "Restored automatic layout for 1 cat" : `Restored automatic layout for ${n} cats`);
    },
  };

  const relCount = kinship ? kinship.highlight.size - 1 : 0;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-canvas text-foreground">
      <TreeCanvas
        clan={clan}
        cats={cats}
        positions={positions}
        focusId={focusId}
        kinship={kinship}
        options={options}
        onSelect={select}
        onMoveCat={(id, pos) => {
          // Dropping a cat moves its whole mate-unit by the same shift so the
          // joined family line stays coherent; other units' pins are untouched.
          const base = positions.get(id);
          if (!base) return;
          const dx = pos.x - base.x, dy = pos.y - base.y;
          setCats(cs => cs.map(c2 => {
            if (c2.id !== id && !c2.mates.includes(id)) return c2;
            const prev = c2.pos ?? positions.get(c2.id);
            if (!prev) return c2;
            return { ...c2, pos: { x: prev.x + dx, y: prev.y + dy } };
          }));
        }}
        onZoom={setZoom}
        apiRef={api}
        treeKey={tree.id}
        panKey={panKey}
        highlightIds={kinHighlight}
      />

      {/* Top-left: brand + tree switcher */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-1.5 pl-3 shadow-float backdrop-blur">
        <Button size="icon" variant="ghost" title="Back to Clan" aria-label="Back to Clan" asChild><Link to="/clan/$clanId" params={{ clanId }}><ArrowLeft /></Link></Button>
        <span className="site-wordmark">Clantools</span><SettingsButton />
        <span className="h-5 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="max-w-[160px] gap-1 font-semibold">
              <span className="truncate">{tree.name}</span> <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Your trees</DropdownMenuLabel>
            {store.trees.filter(t => t.clanId === clanId).map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => switchTo(t.id)} className={t.id === tree.id ? "font-semibold text-primary" : ""}>
                <span className="truncate">{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.cats.length} cats</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={actions.newTree}><FilePlus2 /> New blank tree</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.canon}><RotateCcw /> Add a copy of Firestar's lineage</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.rename}><Pencil /> Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.duplicate}><Copy /> Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>{setDestination('');setMoving(true);}}><ArrowLeft />Move to another Clan</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.remove} className="text-destructive"><Trash2 /> Delete tree</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Top-center: focus banner */}
      {focused && (
        <div className={`absolute top-3 z-30 flex -translate-x-1/2 ${drawer ? "left-[calc((100%-416px)/2)] " : "left-1/2"} max-w-[calc(100%-24px)] items-center gap-2.5 rounded-full border border-border bg-card/95 py-1.5 pl-3.5 pr-1.5 text-xs sm:text-sm shadow-float backdrop-blur transition-all`}>
          <Focus size={15} className="shrink-0 text-primary" />
          <span className="truncate">Focused on <b>{catName(focused)}</b> · {relCount} relatives</span>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Switch className="scale-75" checked={options.hideUnrelated} onCheckedChange={(v) => setOptions((o) => ({ ...o, hideUnrelated: v }))} />
            <span className="hidden sm:inline">Hide others</span>
          </label>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 rounded-full" onClick={() => select(null)} aria-label="Clear focus"><X size={14} /></Button>
        </div>
      )}

      {/* Top-right: actions */}
      <div className={`absolute top-20 sm:top-3 z-20 flex items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-float backdrop-blur transition-all right-3 ${drawer ? "hidden" : ""}`}>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)" disabled={!past.current.length} onClick={undo}><Undo2 size={15} /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)" disabled={!future.current.length} onClick={redo}><Redo2 size={15} /></Button>
        <Button size="sm" onClick={()=>setAddingCat(true)}><Plus size={15} /> Add cat</Button>
        <Button size="sm" variant="ghost" aria-pressed={checking} onClick={()=>{setChecking(v=>!v);setKinHighlight(null);}}><GitCompare size={15} /> Kinship</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost"><Download size={15} /> Share</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={actions.png}><ImageDown /> Download PNG image</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.exportJson}><Download /> Export JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileRef.current?.click()}><FileUp /> Import JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { actions.importJson(e.target.files?.[0]); e.target.value = ""; }} />
      </div>

      {/* Bottom-left: zoom */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-0.5 rounded-2xl border border-border bg-card/95 p-1 shadow-float backdrop-blur">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => api.current?.zoomBy(1 / 1.25)} aria-label="Zoom out"><Minus size={15} /></Button>
        <span className="w-12 text-center text-xs font-semibold tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => api.current?.zoomBy(1.25)} aria-label="Zoom in"><Plus size={15} /></Button>
        <span className="mx-0.5 h-5 w-px bg-border" />
        <Button size="sm" variant="ghost" className="h-8" onClick={() => api.current?.fit()}><Maximize size={14} /> Fit</Button>
        <span className="mx-0.5 h-5 w-px bg-border" />
        <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirmReset(true)} title="Restore automatic layout" aria-label="Restore automatic layout"><LayoutGrid size={14} /> Reset</Button>
      </div>

      {/* Bottom-right: legend */}
      {!drawer && (
        <div className="absolute bottom-3 right-3 z-20 space-y-1.5 rounded-2xl border border-border bg-card/95 p-3 text-xs shadow-float backdrop-blur">
          <LegendRow color="var(--edge-blood)" color2="var(--edge-mate)" label="Parentage & mates" toggle={options.showParents} onToggle={v => setOptions(o => ({ ...o, showParents: v, showMates: v }))} />
          <LegendRow color="var(--edge-foster)" label="Foster" dash="6 4" toggle={options.showFoster} onToggle={(v) => setOptions((o) => ({ ...o, showFoster: v }))} />
          <LegendRow color="var(--edge-mentor)" label="Mentor → apprentice" dash="2 4" toggle={options.showMentors} onToggle={(v) => setOptions((o) => ({ ...o, showMentors: v }))} />
          <label className="flex items-center gap-2"><Sparkles size={14} className="text-muted-foreground" /><span className="flex-1 text-muted-foreground">Afterlives</span><Switch className="scale-75" checked={!!options.spiritRealm} onCheckedChange={v => setOptions(o => ({ ...o, spiritRealm: v }))} aria-label="Show afterlives" /></label>
          <div className="border-t border-border pt-1.5 mt-0.5">
            <label className="flex items-center gap-2"><LayoutGrid size={14} className="text-muted-foreground" /><span className="flex-1 text-muted-foreground">Snap cats to grid</span><Switch className="scale-75" checked={!!options.snapToGrid} onCheckedChange={v => setOptions(o => ({ ...o, snapToGrid: v }))} aria-label="Snap cats to grid while dragging" /></label>
          </div>
        </div>
      )}

      {checking && !drawer && <KinshipChecker key={tree.id} cats={cats} initialA={focusId} onHighlight={setKinHighlight} onClose={()=>setChecking(false)} />}
      {drawer && focused && (
        <CatDrawer
          key={focused.id}
          cat={focused}
          cats={cats}
          affiliations={store.clans.map(c => c.affiliation)}
          otherLineages={store.trees.filter(t=>t.id!==tree.id && t.cats.some(c=>c.id===focused.id)).map(t=>({id:t.id,name:t.name,clanId:t.clanId??clanId}))}
          onOpenLineage={(id,targetClan)=>{rawSetStore(s=>s&&{...s,activeId:id});navigate({to:'/clan/$clanId/lineage',params:{clanId:targetClan},search:{tree:id,cat:focused.id}});}}
          relTags={kinship?.labels.get(focused.id)}
          onClose={() => setDrawer(false)}
          onSelect={(id) => select(id)}
          onCheckName={()=>{if(newIds.current.has(focused.id)&&!separateIds.current.has(focused.id))setNameMatches(matchingNames(sharedCats(store.trees),focused.names,focused.id));}}
          onUpdate={(patch) => setStore(s => s && { ...s, trees: s.trees.map(t => t.cats.some(c=>c.id===focused.id)?{ ...t,updatedAt:Date.now(),cats: t.cats.map(c => c.id === focused.id ? { ...c, ...patch } : c) }:t) })}
          onAddRel={(k, o) => { const issue = checkRelation(cats, focused.id, k, o); if (issue) setWarning({ ...issue, kind: k, other: o }); else setCats(cs => addRelation(cs, focused.id, k, o)); }}
          onRemoveRel={(k, o) => setCats((cs) => removeRelation(cs, focused.id, k, o))}
          onCreateRel={(k: RelKind) => {
            setCreatingRelation(k);
          }}
          onDelete={() => {
            if (!window.confirm(`Remove ${catName(focused)} from this tree?`)) return;
            setCats((cs) => deleteCat(cs, focused.id));
            select(null);
          }}
        />
      )}
      {confirmReset && <Dialog open onOpenChange={v => !v && setConfirmReset(false)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Restore automatic layout?</DialogTitle></DialogHeader><p className="text-sm leading-relaxed text-muted-foreground">Every cat you placed by hand returns to its automatic spot. You can undo this with Ctrl+Z.</p><DialogFooter><Button variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="destructive" onClick={() => { setConfirmReset(false); actions.resetLayout(); }}>Reset layout</Button></DialogFooter></DialogContent></Dialog>}
      {warning && <Dialog open onOpenChange={v => !v && setWarning(null)}><DialogContent><DialogHeader><DialogTitle>{warning.title}</DialogTitle></DialogHeader><p className="text-sm leading-relaxed text-muted-foreground">{warning.message}</p><DialogFooter><Button variant="outline" onClick={() => setWarning(null)}>{warning.blocked ? 'Close' : 'Cancel'}</Button>{!warning.blocked && <Button onClick={() => { if (focusId) setCats(cs => addRelation(warning.pendingCat ? [...cs, warning.pendingCat] : cs, focusId, warning.kind, warning.other)); setWarning(null); }}>Connect anyway</Button>}</DialogFooter></DialogContent></Dialog>}
      {moving && <Dialog open onOpenChange={setMoving}><DialogContent><DialogHeader><DialogTitle>Move lineage</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Move “{tree.name}” and all its cats to another Clan. Cat affiliations and relationships stay unchanged.</p><Select value={destination} onValueChange={setDestination}><SelectTrigger aria-label="Destination Clan"><SelectValue placeholder="Choose a Clan" /></SelectTrigger><SelectContent>{store.clans.filter(c=>c.id!==clanId).map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" onClick={()=>setMoving(false)}>Cancel</Button><Button disabled={!destination} onClick={()=>{setStore(s=>s && moveLineage(s,tree.id,destination));setMoving(false);navigate({to:'/clan/$clanId/lineage',params:{clanId:destination},search:{}});}}>Move lineage</Button></DialogFooter></DialogContent></Dialog>}
      {addingCat && <ExistingCatPicker all={sharedCats(store.trees)} available={sharedCats(store.trees).filter(c=>!cats.some(local=>local.id===c.id))} onClose={()=>setAddingCat(false)} onNew={(name)=>{setAddingCat(false);actions.addCat(name);}} onAdd={(id,selected)=>{setCats(cs=>reuseCat(cs,sharedCats(store.trees),id,selected));setAddingCat(false);select(id);}}/>}
      {creatingRelation&&focused&&<ExistingCatPicker nameFirst all={sharedCats(store.trees)} available={[]} onClose={()=>setCreatingRelation(null)} onNew={name=>{
        const kind=creatingRelation,isKit=kind==='kits'||kind==='fosterKits';
        const c=newCat({names:[name],clan:focused.clan,rank:kind==='apprentices'?'Apprentice':isKit?'Kit':'Warrior'});
        newIds.current.add(c.id);setCreatingRelation(null);
        const issue=checkRelation([...cats,c],focused.id,kind,c.id);
        if(issue)setWarning({...issue,kind,other:c.id,pendingCat:c});else setCats(cs=>addRelation([...cs,c],focused.id,kind,c.id));
      }} onAdd={(id,selected)=>{
        const kind=creatingRelation,next=reuseCat(cats,sharedCats(store.trees),id,selected);
        setCreatingRelation(null);const issue=checkRelation(next,focused.id,kind,id);
        if(issue){if(!issue.blocked)setCats(()=>next);setWarning({...issue,kind,other:id});}
        else setCats(()=>addRelation(next,focused.id,kind,id));
      }}/>} 
      {nameMatches.length>0&&focused&&<Dialog open onOpenChange={v=>!v&&setNameMatches([])}><DialogContent><DialogHeader><DialogTitle>Is this the same character?</DialogTitle></DialogHeader>{nameMatches.map(c=><Button key={c.id} variant="outline" className="h-auto whitespace-normal" onClick={()=>{setNameMatches([]);setCombining(c);}}>Same character: {catName(c)} · {c.clan}</Button>)}<Button variant="secondary" onClick={()=>{separateIds.current.add(focused.id);setNameMatches([]);}}>No, this is a separate character</Button></DialogContent></Dialog>}
      {combining&&focused&&<ExistingCatPicker initialCat={combining} available={[]} all={sharedCats(store.trees)} onClose={()=>setCombining(null)} onNew={()=>setCombining(null)} onAdd={(id,selected)=>{setCats(cs=>combineCat(cs,sharedCats(store.trees),focused.id,id,selected));newIds.current.delete(focused.id);setCombining(null);select(id);}}/>}
    </main>
  );
}

function LegendRow({ color, color2, label, dash, toggle, onToggle }: {
  color: string; color2?: string; label: string; dash?: string; toggle?: boolean; onToggle?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="10" aria-hidden><path d={color2 ? "M2 3 H26" : "M2 5 H26"} stroke={color} strokeWidth={2.5} strokeDasharray={dash} strokeLinecap="round" />{color2 && <path d="M2 8 H26" stroke={color2} strokeWidth={2.5} strokeLinecap="round" />}</svg>
      <span className="flex-1 text-muted-foreground">{label}</span>
      {onToggle && <Switch aria-label={`Show ${label}`} checked={!!toggle} onCheckedChange={onToggle} className="scale-75" />}
    </div>
  );
}
