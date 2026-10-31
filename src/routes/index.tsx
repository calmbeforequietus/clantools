import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown, Copy, Download, FilePlus2, FileUp, Focus, ImageDown, Maximize, Minus, Pencil, Plus, RotateCcw, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CatDrawer } from "@/components/tree/CatDrawer";
import { TreeCanvas, type CanvasApi, type CanvasOptions } from "@/components/tree/TreeCanvas";
import { canonTree } from "@/lib/tree/canon";
import { computeKinship } from "@/lib/tree/kinship";
import { computeLayout } from "@/lib/tree/layout";
import {
  addRelation, deleteCat, isTree, loadStore, mutate, newCat, removeRelation, saveStore, type RelKind, type Store,
} from "@/lib/tree/ops";
import { catName, type Cat, type Tree } from "@/lib/tree/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clan Lineage — Warrior Cats Family Tree Builder" },
      { name: "description", content: "Map Warrior Cats bloodlines, mates and mentors on an interactive canvas, starting with Firestar's lineage." },
      { property: "og:title", content: "Clan Lineage — Warrior Cats Family Tree Builder" },
      { property: "og:description", content: "Interactive Warrior Cats family trees with kinship calculator, profiles and PNG export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [store, setStore] = useState<Store | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [options, setOptions] = useState<CanvasOptions>({ showMentors: true, showFoster: true, hideUnrelated: false });
  const api = useRef<CanvasApi>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setStore(loadStore()), []);
  useEffect(() => {
    if (!store) return;
    try {
      saveStore(store);
    } catch {
      toast.error("Couldn't auto-save — storage is full. Try smaller uploaded images.");
    }
  }, [store]);

  const tree = store?.trees.find((t) => t.id === store.activeId) ?? store?.trees[0];
  const cats = tree?.cats ?? [];
  const positions = useMemo(() => computeLayout(cats), [cats]);
  const kinship = useMemo(() => (focusId && cats.some((c) => c.id === focusId) ? computeKinship(cats, focusId) : null), [cats, focusId]);
  const focused = cats.find((c) => c.id === focusId);

  const setCats = useCallback((fn: (c: Cat[]) => Cat[]) => {
    setStore((s) => s && { ...s, trees: s.trees.map((t) => (t.id === s.activeId ? { ...t, cats: fn(t.cats), updatedAt: Date.now() } : t)) });
  }, []);
  const switchTo = (id: string) => {
    setStore((s) => s && { ...s, activeId: id });
    setFocusId(null);
    setDrawer(false);
  };
  const addTree = (t: Tree) => {
    setStore((s) => s && { trees: [...s.trees, t], activeId: t.id });
    setFocusId(null);
    setDrawer(false);
  };
  const select = (id: string | null) => {
    setFocusId(id);
    setDrawer(!!id);
  };

  if (!store || !tree) return <div className="h-screen bg-canvas" />;

  const actions = {
    newTree: () => {
      const c = newCat({ names: ["First Cat"] });
      addTree({ id: crypto.randomUUID(), name: "Untitled Tree", cats: [c], updatedAt: Date.now() });
    },
    rename: () => {
      const n = window.prompt("Rename tree", tree.name)?.trim();
      if (n) setStore((s) => s && { ...s, trees: s.trees.map((t) => (t.id === tree.id ? { ...t, name: n } : t)) });
    },
    duplicate: () => addTree({ ...structuredClone(tree), id: crypto.randomUUID(), name: `${tree.name} (copy)` }),
    remove: () => {
      if (store.trees.length === 1) return toast.error("You need at least one tree.");
      if (!window.confirm(`Delete "${tree.name}"?`)) return;
      const rest = store.trees.filter((t) => t.id !== tree.id);
      setStore({ trees: rest, activeId: rest[0].id });
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
    addCat: () => {
      const c = newCat({ clan: focused?.clan ?? "ThunderClan" });
      setCats((cs) => [...cs, c]);
      select(c.id);
    },
  };

  const relCount = kinship ? kinship.highlight.size - 1 : 0;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-canvas text-foreground">
      <TreeCanvas
        cats={cats}
        positions={positions}
        focusId={focusId}
        kinship={kinship}
        options={options}
        onSelect={select}
        onZoom={setZoom}
        apiRef={api}
        treeKey={tree.id}
      />

      {/* Top-left: brand + tree switcher */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-1.5 pl-3 shadow-float backdrop-blur">
        <span className="font-display text-lg font-bold text-primary">Clan Lineage</span>
        <span className="h-5 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="max-w-[220px] gap-1 font-semibold">
              <span className="truncate">{tree.name}</span> <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Your trees</DropdownMenuLabel>
            {store.trees.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => switchTo(t.id)} className={t.id === tree.id ? "font-semibold text-primary" : ""}>
                <span className="truncate">{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.cats.length} cats</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={actions.newTree}><FilePlus2 /> New blank tree</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.canon}><RotateCcw /> Add Firestar's lineage</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.rename}><Pencil /> Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.duplicate}><Copy /> Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={actions.remove} className="text-destructive"><Trash2 /> Delete tree</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Top-center: focus banner */}
      {focused && (
        <div className="absolute left-1/2 top-3 z-20 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card/95 py-1.5 pl-4 pr-1.5 text-sm shadow-float backdrop-blur md:flex">
          <Focus size={15} className="text-primary" />
          <span>Focused on <b>{catName(focused)}</b> · {relCount} relatives</span>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch checked={options.hideUnrelated} onCheckedChange={(v) => setOptions((o) => ({ ...o, hideUnrelated: v }))} />
            Hide others
          </label>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => select(null)} aria-label="Clear focus"><X size={14} /></Button>
        </div>
      )}

      {/* Top-right: actions */}
      <div className={`absolute top-3 z-20 flex items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-float backdrop-blur transition-all ${drawer ? "right-[416px] max-lg:hidden" : "right-3"}`}>
        <Button size="sm" onClick={actions.addCat}><Plus size={15} /> Add cat</Button>
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
      </div>

      {/* Bottom-right: legend */}
      {!drawer && (
        <div className="absolute bottom-3 right-3 z-20 hidden space-y-1.5 rounded-2xl border border-border bg-card/95 p-3 text-xs shadow-float backdrop-blur sm:block">
          <LegendRow color="var(--edge-blood)" label="Parentage" />
          <LegendRow color="var(--edge-mate)" label="Mates" thick />
          <LegendRow color="var(--edge-foster)" label="Foster" dash="6 4" toggle={options.showFoster} onToggle={(v) => setOptions((o) => ({ ...o, showFoster: v }))} />
          <LegendRow color="var(--edge-mentor)" label="Mentor → apprentice" dash="2 4" toggle={options.showMentors} onToggle={(v) => setOptions((o) => ({ ...o, showMentors: v }))} />
        </div>
      )}

      {drawer && focused && (
        <CatDrawer
          key={focused.id}
          cat={focused}
          cats={cats}
          relTags={undefined}
          onClose={() => setDrawer(false)}
          onSelect={(id) => select(id)}
          onUpdate={(patch) => setCats((cs) => cs.map((c) => (c.id === focused.id ? { ...c, ...patch } : c)))}
          onAddRel={(k, o) => setCats((cs) => addRelation(cs, focused.id, k, o))}
          onRemoveRel={(k, o) => setCats((cs) => removeRelation(cs, focused.id, k, o))}
          onCreateRel={(k: RelKind) => {
            const isKit = k === "kits" || k === "fosterKits" || k === "apprentices";
            const c = newCat({ clan: focused.clan, names: [isKit ? "New Kit" : "New Cat"], rank: k === "apprentices" ? "Apprentice" : isKit ? "Kit" : "Warrior" });
            setCats((cs) => addRelation(mutate([...cs, c], () => {}), focused.id, k, c.id));
            toast.success(`Added a new cat linked to ${catName(focused)}`);
          }}
          onDelete={() => {
            if (!window.confirm(`Remove ${catName(focused)} from this tree?`)) return;
            setCats((cs) => deleteCat(cs, focused.id));
            select(null);
          }}
        />
      )}
    </main>
  );
}

function LegendRow({ color, label, dash, thick, toggle, onToggle }: {
  color: string; label: string; dash?: string; thick?: boolean; toggle?: boolean; onToggle?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="8"><path d="M2 4 H26" stroke={color} strokeWidth={thick ? 3 : 2} strokeDasharray={dash} strokeLinecap="round" /></svg>
      <span className="flex-1 text-muted-foreground">{label}</span>
      {onToggle && <Switch checked={toggle} onCheckedChange={onToggle} className="scale-75" />}
    </div>
  );
}
