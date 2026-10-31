import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, GitBranch, ImageUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

/** Cat profile: centered dialog for Clan pages; docked side pop-up over the lineage canvas. View mode by default. */
export function CatDrawer({
  cat, cats, relTags, affiliations = [], onClose, onUpdate, onAddRel, onRemoveRel, onCreateRel, onDelete, onSelect,
  otherLineages = [], onOpenLineage, onCheckName, onViewInLineage, variant = "dialog",
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
  variant?: "dialog" | "side";
}) {
  const idx = useMemo(() => buildIndex(cats), [cats]);
  const [editing, setEditing] = useState(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);

  const stages = cat.names.map((name, i) => ({
    rank: name.endsWith("kit") ? "Kit" as const
      : name.endsWith("paw") ? "Apprentice" as const
      : name.endsWith("star") ? "Leader" as const
      : i === cat.names.length - 1 ? cat.rank : "Warrior" as const,
    ...cat.stages?.[i],
    name,
  }));

  const activeStageIdx = stageIndex !== null ? stageIndex : stages.length - 1;
  const currentStage = stages[activeStageIdx] ?? { name: catName(cat), rank: cat.rank };
  const stage = stageIndex === null ? undefined : stages[stageIndex];
  const updateStage = (patch: Partial<LifeStage>) => {
    if (stageIndex === null) return;
    onUpdate({ stages: stages.map((v, i) => i === stageIndex ? { ...v, ...patch } : v) });
  };

  const cycleAge = () => {
    if (stages.length <= 1) return;
    const next = (activeStageIdx + 1) % stages.length;
    setStageIndex(next);
  };

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

  const uploadPortrait = (f?: File) => {
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { toast.error("Please choose an image under 1.5 MB."); return; }
    const r = new FileReader();
    r.onload = () => onUpdate({ portrait: String(r.result) });
    r.readAsDataURL(f);
  };

  const shownAvatar = stage?.avatar ?? (stages[activeStageIdx]?.avatar ?? cat.avatar);
  const portrait = cat.portrait && !stage?.avatar ? (
    <img src={cat.portrait} alt={`${catName(cat)} portrait`} className="h-full w-full max-h-[260px] sm:max-h-[320px] object-contain drop-shadow" />
  ) : shownAvatar.kind === "custom" ? (
    <CatBodyArt settings={shownAvatar.settings} className="h-full w-full max-h-[260px] sm:max-h-[320px] max-w-full drop-shadow" />
  ) : shownAvatar.kind === "pelt" ? (
    <PeltBodyArt pelt={shownAvatar.pelt} className="h-full w-full max-h-[260px] sm:max-h-[320px] max-w-full drop-shadow" />
  ) : (
    <CatAvatar avatar={shownAvatar} className="aspect-square w-3/4 max-w-[220px]" />
  );

  const clanColor = CLAN_VAR[cat.clan] ?? "var(--primary)";

  const heroCard = (
    <div
      className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-border p-3 pt-2 text-center"
      style={{ background: `color-mix(in oklab, ${clanColor} 14%, var(--card))` }}
    >
      {/* Top action row */}
      <div className="flex w-full items-center justify-between pb-1.5">
        <div className="flex items-center gap-1.5">
          <span title={cat.clan} style={{ color: clanColor }}>
            <ClanCrest crest={cat.clan} className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{cat.clan}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onViewInLineage && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-background/80 shadow-sm" onClick={onViewInLineage}>
              <GitBranch size={13} className="mr-1" />Lineage
            </Button>
          )}
          <Button
            size="sm"
            variant={editing ? "default" : "outline"}
            className="h-7 px-2.5 text-xs bg-background/80 shadow-sm"
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil size={12} className="mr-1" />{editing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Clickable full-body portrait that cycles life stages */}
      <div
        className="group relative flex w-full min-h-0 flex-1 cursor-pointer select-none items-center justify-center p-1 transition-transform active:scale-[0.98]"
        onClick={cycleAge}
        title={stages.length > 1 ? "Click to cycle through life stages" : catName(cat)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleAge(); } }}
      >
        {portrait}
      </div>

      {/* Current stage name & position / rank under the image */}
      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-lg font-bold leading-snug">{currentStage.name}</h3>
          <span className="text-xs font-medium text-muted-foreground">· {currentStage.rank ?? cat.rank}</span>
        </div>
        {currentStage.age && (
          <p className="text-[11px] text-muted-foreground">{currentStage.age}</p>
        )}
        {stages.length > 1 && (
          <div className="mt-1.5 flex items-center gap-1">
            {stages.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setStageIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${activeStageIdx === i ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
                title={`View ${st.name} (${st.rank})`}
                aria-label={`View stage: ${st.name}`}
              />
            ))}
          </div>
        )}
        {stages.length > 1 && (
          <span className="mt-0.5 text-[10px] text-muted-foreground/70">Click image to cycle ages</span>
        )}
      </div>

      {editing && (
        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
          <AvatarPicker value={stage?.avatar ?? cat.avatar} onChange={(avatar) => (stage ? updateStage({ avatar }) : onUpdate({ avatar }))} />
          <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
            <label>
              <ImageUp size={12} className="mr-1" />Upload picture
              <input type="file" accept="image/*" className="sr-only" aria-label="Upload profile picture" onChange={(e) => { uploadPortrait(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </Button>
          {cat.portrait && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onUpdate({ portrait: undefined })}>Use drawn cat</Button>
          )}
        </div>
      )}
    </div>
  );

  const mainDetails = (
    <div className="space-y-3">
      {/* Cat identity header (if looking at a previous stage, show back button) */}
      {stage && stageIndex !== stages.length - 1 && (
        <div className="flex items-center justify-between rounded-xl border border-border p-2">
          <span className="text-xs text-muted-foreground">Viewing past stage: <b>{stage.name}</b></span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setStageIndex(null)}>
            <ArrowLeft size={12} className="mr-1" />Current age
          </Button>
        </div>
      )}

      {/* Lore Section: Summary, Name History, Biography */}
      <Box title="Lore">
        {editing ? (
          <Textarea aria-label="TL;DR history" value={cat.summary ?? ""} onChange={(e) => onUpdate({ summary: e.target.value })} placeholder="Short summary" rows={2} />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{cat.summary || "No summary recorded."}</p>
        )}

        <h4 className="mb-1.5 mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name History</h4>
        <div className="mb-2.5 flex flex-wrap items-center gap-1 text-sm">
          {cat.names.map((n, i) => (
            <span key={i} className="flex items-center gap-1">
              <Button
                size="sm"
                variant={activeStageIdx === i ? "default" : "secondary"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setStageIndex(i)}
              >
                {n || "…"}
              </Button>
              {i < cat.names.length - 1 && <ArrowRight size={11} className="text-muted-foreground/60" />}
            </span>
          ))}
        </div>

        {editing && (
          <div className="mb-3 space-y-1.5">
            {cat.names.map((n, i) => (
              <div key={i} className="flex gap-1.5">
                <Input aria-label={`Name ${i + 1}`} value={n} onChange={(e) => setName(i, e.target.value)} onBlur={onCheckName} className="h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={cat.names.length === 1} onClick={() => onUpdate({ names: cat.names.filter((_, j) => j !== i), stages: stages.filter((_, j) => j !== i) })} aria-label="Remove name"><X size={14} /></Button>
              </div>
            ))}
            <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { onUpdate({ names: [...cat.names, newName.trim()] }); setNewName(""); } }}>
              <Input aria-label="Newer name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a newer name (e.g. Firestar)" className="h-8" />
              <Button type="submit" size="sm" variant="secondary" className="h-8">Add</Button>
            </form>
            <NameIdeas hint={cat.appearance} onPick={setNewName} />
          </div>
        )}

        <h4 className="mb-1.5 mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">History & Personality</h4>
        {editing ? (
          <Textarea aria-label="Biography" rows={4} value={cat.biography ?? ""} onChange={(e) => onUpdate({ biography: e.target.value })} />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{cat.biography || "No biography recorded."}</p>
        )}
      </Box>

      {/* INFO SECTION — PLACED ABOVE FAMILY */}
      <Box title="Info">
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Clan"><Select value={cat.clan} onValueChange={(v) => onUpdate({ clan: v as Cat["clan"] })}><SelectTrigger aria-label="Clan" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{[...new Set([...CLANS, ...affiliations, cat.clan])].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Rank"><Select value={cat.rank} onValueChange={(v) => onUpdate({ rank: v as Cat["rank"] })}><SelectTrigger aria-label="Rank" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{RANKS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Status"><Select value={cat.status} onValueChange={(v) => onUpdate({ status: v as Cat["status"] })}><SelectTrigger aria-label="Status" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((c) => <SelectItem key={c} value={c}>{STATUS_LABEL[c]}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Gender"><Select value={cat.gender} onValueChange={(v) => onUpdate({ gender: v as Cat["gender"] })}><SelectTrigger aria-label="Gender" className="h-9"><SelectValue /></SelectTrigger><SelectContent>{GENDERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
            <div className="col-span-2"><Field label="Pelt & eyes"><Textarea aria-label="Pelt and eyes" rows={2} value={cat.appearance} onChange={(e) => onUpdate({ appearance: e.target.value })} placeholder="Flame-colored tom with green eyes…" /></Field></div>
          </div>
        ) : (
          <dl className="space-y-1.5 text-sm">
            <Row k="Gender" v={cat.gender} />
            <Row k="Rank" v={cat.rank} />
            <Row k="Status" v={STATUS_LABEL[cat.status]} />
            <Row k="Clan" v={cat.clan} />
            {cat.appearance && <p className="pt-1 text-xs text-muted-foreground">{cat.appearance}</p>}
          </dl>
        )}
        {otherLineages.length > 0 && (
          <div className="mt-3 space-y-1">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Other lineages</h4>
            {otherLineages.map((t) => (
              <Button key={t.id} variant="outline" size="sm" className="h-auto w-full justify-between whitespace-normal text-left" onClick={() => onOpenLineage?.(t.id, t.clanId)}>
                {t.name}<ArrowRight className="shrink-0" size={14} />
              </Button>
            ))}
          </div>
        )}
      </Box>

      {/* FAMILY SECTION — PLACED BELOW INFO */}
      <Box title="Family">
        <div className="space-y-3">
          {SECTIONS.map(({ kind, label }) => {
            const ids = lists[kind];
            if (!editing && !ids.length) return null;
            return (
              <div key={kind}>
                <div className="mb-1 flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                  {editing && (
                    <div className="flex items-center gap-1">
                      <Select value="" onValueChange={(v) => onAddRel(kind, v)}>
                        <SelectTrigger aria-label={`Link ${label.toLowerCase()}`} className="h-7 w-[110px] text-xs">
                          <SelectValue placeholder="Link cat…" />
                        </SelectTrigger>
                        <SelectContent>
                          {cats.filter((c) => c.id !== cat.id).map((o) => (
                            <SelectItem key={o.id} value={o.id}>{catName(o)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {onCreateRel && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Create new ${label.toLowerCase()}`} title={`Create new ${label.toLowerCase()}`} onClick={() => onCreateRel(kind)}>
                          <Plus size={14} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {ids.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {ids.map((id) => {
                      const o = idx.byId.get(id);
                      if (!o) return null;
                      return (
                        <span key={id} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-0.5 pr-2 text-xs">
                          <Button variant="ghost" className="flex h-auto items-center gap-1 p-0 hover:underline" onClick={() => onSelect(id)}>
                            <CatAvatar avatar={o.avatar} className="h-5 w-5" />{catName(o)}
                          </Button>
                          {editing && (
                            <Button variant="ghost" size="icon" onClick={() => onRemoveRel(kind, id)} className="h-5 w-5 rounded-full text-muted-foreground" aria-label={`Unlink ${catName(o)}`}>
                              <X size={11} />
                            </Button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {!editing && SECTIONS.every(({ kind }) => !lists[kind].length) && (
            <p className="text-xs text-muted-foreground">No family recorded.</p>
          )}
        </div>
      </Box>

      {editing && onDelete && (
        <div className="pt-1">
          <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 size={14} className="mr-1" /> Remove {catName(cat)} from tree
          </Button>
        </div>
      )}
    </div>
  );

  if (variant === "side") {
    return (
      <aside
        role="dialog"
        aria-label={`${catName(cat)} profile`}
        className="absolute bottom-3 right-3 top-3 z-30 flex w-[min(390px,calc(100%-24px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float animate-in slide-in-from-right-8 fade-in duration-200"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {heroCard}
          {mainDetails}
        </div>
      </aside>
    );
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-label={`${catName(cat)} profile`}
        className="max-h-[88dvh] w-[min(820px,calc(100%-24px))] max-w-none gap-0 overflow-y-auto p-3 sm:rounded-2xl [&>button.absolute]:hidden"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
          <div className="flex flex-col">{heroCard}</div>
          <div className="overflow-y-auto">{mainDetails}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border p-3"><h3 className="mb-2 font-display text-base font-semibold">{title}</h3>{children}</section>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
