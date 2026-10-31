import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, GitBranch, ImageUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildIndex } from "@/lib/tree/kinship";
import type { RelKind } from "@/lib/tree/ops";
import { CLAN_VAR, CLANS, GENDERS, RANKS, STATUS_LABEL, STATUSES, catName, type Cat, type LifeStage } from "@/lib/tree/types";
import { AvatarPicker } from "./AvatarPicker";
import { CatAvatar } from "./CatAvatar";
import { CatBodyArt, PeltBodyArt } from "./CatBodyArt";
import { ClanCrest } from "./ClanCrest";
import { NameIdeas } from "./NameIdeas";

const SECTIONS: { kind: RelKind; label: string }[] = [
  { kind: "parents", label: "Parents" },
  { kind: "mates", label: "Mates" },
  { kind: "kits", label: "Kits" },
  { kind: "fosterParents", label: "Foster parents" },
  { kind: "fosterKits", label: "Foster kits" },
  { kind: "mentors", label: "Mentors" },
  { kind: "apprentices", label: "Apprentices" },
];

/** Centered cat profile: portrait, header, Lore, Family and Info boxes. View mode by default. */
export function CatDrawer({
  cat, cats, relTags, affiliations = [], onClose, onUpdate, onAddRel, onRemoveRel, onCreateRel, onDelete, onSelect,
  otherLineages = [], onOpenLineage, onCheckName, onViewInLineage,
}: {
  cat: Cat;
  cats: Cat[];
  relTags?: string[] | undefined;
  affiliations?: string[];
  onClose: () => void;
  onUpdate: (patch: Partial<Cat>) => void;
  onAddRel: (kind: RelKind, other: string) => void;
  onRemoveRel: (kind: RelKind, other: string) => void;
  onCreateRel?: (kind: RelKind) => void;
  onDelete?: () => void;
  onSelect: (id: string) => void;
  otherLineages?: { id: string; name: string; clanId: string }[];
  onOpenLineage?: (id: string, clanId: string) => void;
  onCheckName?: () => void;
  onViewInLineage?: () => void;
}) {
  const idx = useMemo(() => buildIndex(cats), [cats]);
  const [editing, setEditing] = useState(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const stages = cat.names.map((name, i) => ({ rank: name.endsWith("kit") ? "Kit" as const : name.endsWith("paw") ? "Apprentice" as const : name.endsWith("star") ? "Leader" as const : i === cat.names.length - 1 ? cat.rank : "Warrior" as const, ...cat.stages?.[i], name }));
  const stage = stageIndex === null ? undefined : stages[stageIndex];
  const updateStage = (patch: Partial<LifeStage>) => { if (stageIndex === null) return; onUpdate({ stages: stages.map((v, i) => i === stageIndex ? { ...v, ...patch } : v) }); };
  const [newName, setNewName] = useState("");
  const setName = (i: number, v: string) => onUpdate({ names: cat.names.map((n, j) => (j === i ? v : n)) });
  const lists: Record<RelKind, string[]> = {
    parents: idx.parents(cat.id), mates: idx.mates(cat.id), kits: idx.children(cat.id),
    fosterParents: idx.fosterParents(cat.id), fosterKits: idx.fosterKits(cat.id),
    mentors: idx.mentors(cat.id), apprentices: idx.apprentices(cat.id),
  };
  const uploadPortrait = (f?: File) => {
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { toast.error("Please choose an image under 1.5 MB."); return; }
    const r = new FileReader(); r.onload = () => onUpdate({ portrait: String(r.result) }); r.readAsDataURL(f);
  };
  const shownAvatar = stage?.avatar ?? cat.avatar;
  const portrait = cat.portrait && !stage?.avatar ? <img src={cat.portrait} alt={`${catName(cat)} portrait`} className="h-full w-full object-contain" />
    : shownAvatar.kind === "custom" ? <CatBodyArt settings={shownAvatar.settings} className="h-full max-h-[300px] w-full" />
    : shownAvatar.kind === "pelt" ? <PeltBodyArt pelt={shownAvatar.pelt} className="h-full max-h-[300px] w-full" />
    : <CatAvatar avatar={shownAvatar} className="aspect-square w-3/4" />;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85dvh] w-[min(780px,calc(100%-24px))] max-w-none gap-0 overflow-y-auto p-0 sm:rounded-2xl [&>button.absolute]:hidden">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-3 py-1.5" style={{ background: `color-mix(in oklab, ${CLAN_VAR[cat.clan] ?? "var(--primary)"} 14%, var(--card))` }}>
          {onViewInLineage && <Button size="sm" variant="outline" onClick={onViewInLineage}><GitBranch size={14} />View in lineage</Button>}
          <Button size="sm" variant={editing ? "default" : "outline"} onClick={() => setEditing((v) => !v)}><Pencil size={14} />{editing ? "Done editing" : "Edit profile"}</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close profile"><X size={18} /></Button>
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-evenly gap-4 rounded-xl border border-border p-3">
              <span title={cat.clan} style={{ color: CLAN_VAR[cat.clan] ?? "var(--primary)" }}><ClanCrest crest={cat.clan} className="h-20 w-20 sm:h-24 sm:w-24" /></span>
              {editing ? <AvatarPicker value={cat.avatar} onChange={(avatar) => onUpdate({ avatar })} /> : <CatAvatar avatar={cat.avatar} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />}
            </div>
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-muted/40 p-3">{portrait}</div>
            {editing && <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild><label><ImageUp size={14} />Upload picture<input type="file" accept="image/*" className="sr-only" aria-label="Upload profile picture" onChange={(e) => { uploadPortrait(e.target.files?.[0]); e.target.value = ""; }} /></label></Button>
              {cat.portrait && <Button size="sm" variant="ghost" onClick={() => onUpdate({ portrait: undefined })}>Use drawn cat</Button>}
            </div>}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border p-2.5">
              <DialogTitle className="font-display text-2xl font-bold">{catName(cat)}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">{cat.clan} – {cat.rank === "None" ? "No rank" : cat.rank}{cat.status !== "Living" && ` · ${STATUS_LABEL[cat.status]}`}</DialogDescription>
              {relTags && <p className="mt-1 text-xs font-semibold text-primary">{relTags.join(" · ")}</p>}
            </div>

            <Box title="Lore">
              {stage && <div className="mb-3 space-y-2 border-b border-border pb-3"><Button variant="ghost" size="sm" onClick={() => setStageIndex(null)}><ArrowLeft />Full profile</Button><h4 className="font-display text-lg">{stage.name}</h4>
                {editing ? <><AvatarPicker value={stage.avatar ?? cat.avatar} onChange={(avatar) => updateStage({ avatar })} />
                  <div className="grid gap-2 sm:grid-cols-2"><Field label="Stage rank"><Select value={stage.rank ?? cat.rank} onValueChange={(v) => updateStage({ rank: v as Cat["rank"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></Field><Field label="Age / moons"><Input aria-label="Stage age" value={stage.age ?? ""} onChange={(e) => updateStage({ age: e.target.value })} /></Field></div>
                  <Field label="Stage history"><Textarea aria-label="Stage history" value={stage.description ?? ""} onChange={(e) => updateStage({ description: e.target.value })} /></Field>
                  <div className="grid gap-2 sm:grid-cols-2"><Field label="Stage mentors"><Input aria-label="Stage mentors" value={stage.mentors ?? ""} onChange={(e) => updateStage({ mentors: e.target.value })} /></Field><Field label="Stage apprentices"><Input aria-label="Stage apprentices" value={stage.apprentices ?? ""} onChange={(e) => updateStage({ apprentices: e.target.value })} /></Field></div></>
                  : <><p className="text-sm text-muted-foreground">{stage.rank ?? cat.rank}{stage.age ? ` · ${stage.age}` : ""}</p><p className="whitespace-pre-wrap text-sm">{stage.description || "No history recorded for this name."}</p>{stage.mentors && <p className="text-sm">Mentors: {stage.mentors}</p>}{stage.apprentices && <p className="text-sm">Apprentices: {stage.apprentices}</p>}</>}
              </div>}
              {editing ? <Textarea aria-label="TL;DR history" value={cat.summary ?? ""} onChange={(e) => onUpdate({ summary: e.target.value })} placeholder="Short summary" /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{cat.summary || "No summary recorded."}</p>}
              <h4 className="mb-2 mt-3 text-xs font-bold uppercase text-muted-foreground">Names</h4>
              <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
                {cat.names.map((n, i) => <span key={i} className="flex items-center gap-1"><Button size="sm" variant={stageIndex === i ? "default" : "secondary"} onClick={() => setStageIndex(i)}>{n || "…"}</Button>{i < cat.names.length - 1 && <ArrowRight size={12} className="text-muted-foreground" />}</span>)}
              </div>
              {editing && <div className="mb-3 space-y-1.5">
                {cat.names.map((n, i) => <div key={i} className="flex gap-1.5">
                  <Input aria-label={`Name ${i + 1}`} value={n} onChange={(e) => setName(i, e.target.value)} onBlur={onCheckName} className="h-8" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={cat.names.length === 1} onClick={() => onUpdate({ names: cat.names.filter((_, j) => j !== i), stages: stages.filter((_, j) => j !== i) })} aria-label="Remove name"><X size={14} /></Button>
                </div>)}
                <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { onUpdate({ names: [...cat.names, newName.trim()] }); setNewName(""); } }}>
                  <Input aria-label="Newer name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a newer name (e.g. Firestar)" className="h-8" />
                  <Button type="submit" size="sm" variant="secondary" className="h-8">Add</Button>
                </form>
                <NameIdeas hint={cat.appearance} onPick={setNewName} />
              </div>}
              <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">History & personality</h4>
              {editing ? <Textarea aria-label="Biography" rows={4} value={cat.biography ?? ""} onChange={(e) => onUpdate({ biography: e.target.value })} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{cat.biography || "No biography recorded."}</p>}
            </Box>

            <div className="grid gap-3 lg:grid-cols-2">
              <Box title="Family">
                <div className="space-y-3">
                  {SECTIONS.map(({ kind, label }) => {
                    const ids = lists[kind];
                    if (!editing && !ids.length) return null;
                    return <div key={kind}>
                      <div className="mb-1 flex items-center justify-between gap-1"><span className="text-sm font-semibold">{label}</span>
                        {editing && <div className="flex items-center gap-1">
                          <Select value="" onValueChange={(v) => onAddRel(kind, v)}><SelectTrigger aria-label={`Link ${label.toLowerCase()}`} className="h-7 w-[110px] text-xs"><SelectValue placeholder="Link cat…" /></SelectTrigger><SelectContent>{cats.filter((c) => c.id !== cat.id).map((o) => <SelectItem key={o.id} value={o.id}>{catName(o)}</SelectItem>)}</SelectContent></Select>
                          {onCreateRel && <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Create new ${label.toLowerCase()}`} title={`Create new ${label.toLowerCase()}`} onClick={() => onCreateRel(kind)}><Plus size={14} /></Button>}
                        </div>}
                      </div>
                      {ids.length === 0 ? <p className="text-xs text-muted-foreground">None yet</p> : <div className="flex flex-wrap gap-1.5">{ids.map((id) => { const o = idx.byId.get(id); if (!o) return null; return <span key={id} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-0.5 pr-2 text-xs">
                        <Button variant="ghost" className="flex h-auto items-center gap-1 p-0 hover:underline" onClick={() => onSelect(id)}><CatAvatar avatar={o.avatar} className="h-5 w-5" />{catName(o)}</Button>
                        {editing && <Button variant="ghost" size="icon" onClick={() => onRemoveRel(kind, id)} className="h-5 w-5 rounded-full text-muted-foreground" aria-label={`Unlink ${catName(o)}`}><X size={11} /></Button>}
                      </span>; })}</div>}
                    </div>;
                  })}
                  {!editing && SECTIONS.every(({ kind }) => !lists[kind].length) && <p className="text-sm text-muted-foreground">No family recorded.</p>}
                </div>
              </Box>
              <Box title="Info">
                {editing ? <div className="grid grid-cols-2 gap-2">
                  <Field label="Clan"><Select value={cat.clan} onValueChange={(v) => onUpdate({ clan: v as Cat["clan"] })}><SelectTrigger aria-label="Clan" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{[...new Set([...CLANS, ...affiliations, cat.clan])].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
                  <Field label="Rank"><Select value={cat.rank} onValueChange={(v) => onUpdate({ rank: v as Cat["rank"] })}><SelectTrigger aria-label="Rank" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{RANKS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
                  <Field label="Status"><Select value={cat.status} onValueChange={(v) => onUpdate({ status: v as Cat["status"] })}><SelectTrigger aria-label="Status" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((c) => <SelectItem key={c} value={c}>{STATUS_LABEL[c]}</SelectItem>)}</SelectContent></Select></Field>
                  <Field label="Gender"><Select value={cat.gender} onValueChange={(v) => onUpdate({ gender: v as Cat["gender"] })}><SelectTrigger aria-label="Gender" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{GENDERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
                  <div className="col-span-2"><Field label="Pelt & eyes"><Textarea aria-label="Pelt and eyes" rows={2} value={cat.appearance} onChange={(e) => onUpdate({ appearance: e.target.value })} placeholder="Flame-colored tom with green eyes…" /></Field></div>
                </div> : <dl className="space-y-1.5 text-sm">
                  <Row k="Gender" v={cat.gender} /><Row k="Rank" v={cat.rank} /><Row k="Status" v={STATUS_LABEL[cat.status]} /><Row k="Clan" v={cat.clan} />
                  {cat.appearance && <p className="pt-1 text-muted-foreground">{cat.appearance}</p>}
                </dl>}
                {otherLineages.length > 0 && <div className="mt-3 space-y-1"><h4 className="text-xs font-bold uppercase text-muted-foreground">Other lineages</h4>{otherLineages.map((t) => <Button key={t.id} variant="outline" size="sm" className="h-auto w-full justify-between whitespace-normal text-left" onClick={() => onOpenLineage?.(t.id, t.clanId)}>{t.name}<ArrowRight className="shrink-0" size={14} /></Button>)}</div>}
              </Box>
            </div>
            {editing && onDelete && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 size={14} /> Remove {catName(cat)} from tree</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border p-2.5"><h3 className="mb-2 font-display text-base font-semibold">{title}</h3>{children}</section>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
