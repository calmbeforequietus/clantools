import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildIndex } from "@/lib/tree/kinship";
import type { RelKind } from "@/lib/tree/ops";
import { CLAN_VAR, CLANS, GENDERS, RANKS, STATUS_LABEL, STATUSES, catName, type Cat, type LifeStage } from "@/lib/tree/types";
import { AvatarPicker } from "./AvatarPicker";
import { CatAvatar } from "./CatAvatar";

const SECTIONS: { kind: RelKind; label: string }[] = [
  { kind: "parents", label: "Parents" },
  { kind: "mates", label: "Mates" },
  { kind: "kits", label: "Kits" },
  { kind: "fosterParents", label: "Foster parents" },
  { kind: "fosterKits", label: "Foster kits" },
  { kind: "mentors", label: "Mentors" },
  { kind: "apprentices", label: "Apprentices" },
];

export function CatDrawer({
  cat,
  cats,
  relTags,
  affiliations = [],
  onClose,
  onUpdate,
  onAddRel,
  onRemoveRel,
  onCreateRel,
  onDelete,
  onSelect,
  otherLineages=[],
  onOpenLineage,
}: {
  cat: Cat;
  cats: Cat[];
  relTags?: string[] | undefined;
  affiliations?: string[];
  onClose: () => void;
  onUpdate: (patch: Partial<Cat>) => void;
  onAddRel: (kind: RelKind, other: string) => void;
  onRemoveRel: (kind: RelKind, other: string) => void;
  onCreateRel: (kind: RelKind) => void;
  onDelete: () => void;
  onSelect: (id: string) => void;
  otherLineages?: {id:string;name:string;clanId:string}[];
  onOpenLineage?: (id:string,clanId:string)=>void;
}) {
  const idx = useMemo(() => buildIndex(cats), [cats]);
  const [editing, setEditing] = useState(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const stages = cat.names.map((name, i) => ({ rank: name.endsWith("kit") ? "Kit" as const : name.endsWith("paw") ? "Apprentice" as const : name.endsWith("star") ? "Leader" as const : i === cat.names.length-1 ? cat.rank : "Warrior" as const, ...cat.stages?.[i], name }));
  const stage = stageIndex === null ? undefined : stages[stageIndex];
  const updateStage = (patch: Partial<LifeStage>) => { if (stageIndex === null) return; onUpdate({ stages: stages.map((v, i) => i === stageIndex ? { ...v, ...patch } : v) }); };
  const [newName, setNewName] = useState("");
  const setName = (i: number, v: string) => onUpdate({ names: cat.names.map((n, j) => (j === i ? v : n)) });
  const lists: Record<RelKind, string[]> = {
    parents: idx.parents(cat.id),
    mates: idx.mates(cat.id),
    kits: idx.children(cat.id),
    fosterParents: idx.fosterParents(cat.id),
    fosterKits: idx.fosterKits(cat.id),
    mentors: idx.mentors(cat.id),
    apprentices: idx.apprentices(cat.id),
  };

  return (
    <aside
      className="absolute bottom-3 right-3 top-3 z-30 flex w-[min(400px,calc(100%-24px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float animate-in slide-in-from-right-8 fade-in duration-200"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="relative px-5 pb-4 pt-5" style={{ background: `color-mix(in oklab, ${CLAN_VAR[cat.clan]} 18%, var(--card))` }}>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close profile">
          <X size={18} />
        </Button>
        <div className="flex items-center gap-4">
          {editing ? <AvatarPicker value={cat.avatar} onChange={(avatar) => onUpdate({ avatar })} /> : <CatAvatar avatar={cat.avatar} className="h-20 w-20 shrink-0" />}
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-bold text-foreground">{catName(cat)}</h2>
            <p className="text-sm text-muted-foreground">{cat.clan} · {cat.rank === "None" ? "No rank" : cat.rank}</p>
            {relTags && <p className="mt-1 text-xs font-semibold text-primary">{relTags.join(" · ")}</p>}
          </div>
        </div>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => setEditing(v => !v)}><Pencil size={14} />{editing ? "Done editing" : "Edit profile"}</Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {otherLineages.length>0 && <section><h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Other lineages</h3><div className="space-y-1">{otherLineages.map(t=><Button key={t.id} variant="outline" size="sm" className="h-auto w-full justify-between whitespace-normal text-left" onClick={()=>onOpenLineage?.(t.id,t.clanId)}>{t.name}<ArrowRight className="shrink-0" size={14}/></Button>)}</div></section>}
        {stage && <section className="space-y-3 border-b border-border pb-5"><Button variant="ghost" size="sm" onClick={() => setStageIndex(null)}><ArrowLeft />Full profile</Button><h3 className="font-display text-xl">{stage.name}</h3>{editing ? <AvatarPicker value={stage.avatar ?? cat.avatar} onChange={avatar => updateStage({ avatar })} /> : <CatAvatar avatar={stage.avatar ?? cat.avatar} className="h-32 w-32" />}{editing ? <><Field label="Stage rank"><Select value={stage.rank ?? cat.rank} onValueChange={v => updateStage({ rank: v as Cat['rank'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></Field><Field label="Age / moons"><Input aria-label="Stage age" value={stage.age ?? ''} onChange={e => updateStage({ age: e.target.value })} /></Field><Field label="Stage history"><Textarea aria-label="Stage history" value={stage.description ?? ''} onChange={e => updateStage({ description: e.target.value })} /></Field><Field label="Stage mentors"><Input aria-label="Stage mentors" value={stage.mentors ?? ''} onChange={e => updateStage({ mentors: e.target.value })} /></Field><Field label="Stage apprentices"><Input aria-label="Stage apprentices" value={stage.apprentices ?? ''} onChange={e => updateStage({ apprentices: e.target.value })} /></Field></> : <><p className="text-sm text-muted-foreground">{stage.rank ?? cat.rank}{stage.age ? ` · ${stage.age}` : ''}</p><p className="whitespace-pre-wrap text-sm">{stage.description || 'No history recorded for this name.'}</p>{stage.mentors && <p className="text-sm">Mentors: {stage.mentors}</p>}{stage.apprentices && <p className="text-sm">Apprentices: {stage.apprentices}</p>}</>}</section>}

        <section className="space-y-3">{editing ? <Textarea aria-label="TL;DR history" value={cat.summary ?? ''} onChange={e => onUpdate({ summary: e.target.value })} placeholder="TL;DR history" /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{cat.summary || 'No summary recorded.'}</p>}</section>
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name history</h3>
          <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            {cat.names.map((n, i) => (
              <span key={i} className="flex items-center gap-1">
                <Button size="sm" variant={stageIndex === i ? "default" : "secondary"} onClick={() => setStageIndex(i)}>{n || "…"}</Button>
                {i < cat.names.length - 1 && <ArrowRight size={12} className="text-muted-foreground" />}
              </span>
            ))}
          </div>
          {editing && <div className="space-y-1.5">
            {cat.names.map((n, i) => (
              <div key={i} className="flex gap-1.5">
                <Input aria-label={`Name ${i + 1}`} value={n} onChange={(e) => setName(i, e.target.value)} className="h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={cat.names.length === 1}
                  onClick={() => onUpdate({ names: cat.names.filter((_, j) => j !== i), stages: stages.filter((_, j) => j !== i) })} aria-label="Remove name">
                  <X size={14} />
                </Button>
              </div>
            ))}
            <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { onUpdate({ names: [...cat.names, newName.trim()] }); setNewName(""); } }}>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a newer name (e.g. Firestar)" className="h-8" />
              <Button type="submit" size="sm" variant="secondary" className="h-8">Add</Button>
            </form>
          </div>}
        </section>

        <section className="space-y-3"><h3 className="text-xs font-bold uppercase text-muted-foreground">History & personality</h3>{editing ? <Textarea aria-label="Biography" rows={4} value={cat.biography ?? ''} onChange={e => onUpdate({ biography: e.target.value })} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{cat.biography || 'No biography recorded.'}</p>}</section>
        {editing ? <section className="grid grid-cols-2 gap-3">
          <Field label="Clan / affiliation">
            <Select value={cat.clan} onValueChange={(v) => onUpdate({ clan: v as Cat["clan"] })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{[...new Set([...CLANS, ...affiliations, cat.clan])].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Rank">
            <Select value={cat.rank} onValueChange={(v) => onUpdate({ rank: v as Cat["rank"] })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{RANKS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={cat.status} onValueChange={(v) => onUpdate({ status: v as Cat["status"] })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((c) => <SelectItem key={c} value={c}>{STATUS_LABEL[c]}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Gender">
            <Select value={cat.gender} onValueChange={(v) => onUpdate({ gender: v as Cat["gender"] })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{GENDERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Pelt & eyes">
              <Textarea rows={2} value={cat.appearance} onChange={(e) => onUpdate({ appearance: e.target.value })} placeholder="Flame-colored tom with green eyes…" />
            </Field>
          </div>
        </section> : <section className="space-y-2 border-y border-border py-4"><p className="text-sm">{cat.gender} · {cat.rank} · {STATUS_LABEL[cat.status]}</p><p className="whitespace-pre-wrap text-sm text-muted-foreground">{cat.appearance}</p></section>}

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Relationships</h3>
          <div className="space-y-3">
            {SECTIONS.map(({ kind, label }) => {
              const ids = lists[kind];
              const options = cats.filter((c) => c.id !== cat.id && true);
              return (
                <div key={kind} className="rounded-xl border border-border p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    {editing && <div className="flex items-center gap-1">
                      <Select value="" onValueChange={(v) => onAddRel(kind, v)}>
                        <SelectTrigger aria-label={`Link ${label.toLowerCase()}`} className="h-7 w-[120px] text-xs"><SelectValue placeholder="Link cat…" /></SelectTrigger>
                        <SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{catName(o)}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={`Create new ${label.toLowerCase()}`} onClick={() => onCreateRel(kind)}>
                        <Plus size={14} />
                      </Button>
                    </div>}
                  </div>
                  {ids.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ids.map((id) => {
                        const o = idx.byId.get(id);
                         if (!o) return null;
                        return (
                          <span key={id} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-0.5 pr-1 text-xs">
                            <Button variant="ghost" className="h-auto p-0 flex items-center gap-1 hover:underline" onClick={() => onSelect(id)}>
                              <CatAvatar avatar={o.avatar} className="h-5 w-5" />
                              {catName(o)}
                            </Button>
                            {editing && <Button variant="ghost" size="icon" onClick={() => onRemoveRel(kind, id)} className="rounded-full p-0.5 text-muted-foreground hover:bg-background" aria-label={`Unlink ${catName(o)}`}>
                              <X size={11} />
                            </Button>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {editing && <div className="border-t border-border px-5 py-3">
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 size={14} /> Remove {catName(cat)} from tree
        </Button>
      </div>}
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
