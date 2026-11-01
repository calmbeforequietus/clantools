import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, ChevronUp, GitBranch, ImageUp, Pencil, Plus, Trash2, X } from "lucide-react";
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (kind: string) => setOpenSections((prev) => ({ ...prev, [kind]: !prev[kind] }));
  const [stageIndex, setStageIndex] = useState<number | null>(() => cat.names.length - 1);
  const stages = cat.names.map((name, i) => ({ rank: name.endsWith("kit") ? "Kit" as const : name.endsWith("paw") ? "Apprentice" as const : name.endsWith("star") ? "Leader" as const : i === cat.names.length - 1 ? cat.rank : "Warrior" as const, ...cat.stages?.[i], name }));
  const stage = stageIndex === null ? undefined : stages[stageIndex];
  const updateStage = (patch: Partial<LifeStage>) => { if (stageIndex === null) return; onUpdate({ stages: stages.map((v, i) => i === stageIndex ? { ...v, ...patch } : v) }); };
  const cycleStage = () => {
    if (stages.length <= 1) return;
    setStageIndex((prev) => {
      const cur = prev ?? stages.length - 1;
      return (cur + 1) % stages.length;
    });
  };
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
  const isKit = stage?.rank === "Kit";
  const portrait = cat.portrait && !stage?.avatar && !isKit ? <img src={cat.portrait} alt={`${catName(cat)} portrait`} className="h-full w-full object-contain" />
    : shownAvatar.kind === "custom" ? <CatBodyArt settings={shownAvatar.settings} kit={isKit} className="h-full max-h-[300px] w-full" />
    : shownAvatar.kind === "pelt" ? <PeltBodyArt pelt={shownAvatar.pelt} kit={isKit} className="h-full max-h-[300px] w-full" />
    : <CatAvatar avatar={shownAvatar} className={`aspect-square ${isKit ? "w-1/2" : "w-3/4"}`} />;

  const isNoRank = !cat.rank || cat.rank === "None";
  const isOutsider = cat.clan === "Kittypet" || cat.clan === "Loner" || cat.clan === "Rogue";
  const headerRank = isOutsider || isNoRank ? "" : ` – ${cat.rank}`;

  const customSections = cat.customSections ?? [];
  const defaultOrder = ["info", "family", ...customSections.map((s) => `custom:${s.id}`)];
  const rawOrder = cat.sectionOrder && cat.sectionOrder.length > 0 ? cat.sectionOrder : defaultOrder;
  const order = [
    ...rawOrder.filter((k) => k === "info" || k === "family" || customSections.some((s) => `custom:${s.id}` === k)),
    ...(["info", "family"] as const).filter((k) => !rawOrder.includes(k)),
    ...customSections.filter((s) => !rawOrder.includes(`custom:${s.id}`)).map((s) => `custom:${s.id}`),
  ];

  const moveSection = (key: string, delta: number) => {
    const i = order.indexOf(key);
    if (i < 0 || i + delta < 0 || i + delta >= order.length) return;
    const nextOrder = [...order];
    const [moved] = nextOrder.splice(i, 1);
    if (moved === undefined) return;
    nextOrder.splice(i + delta, 0, moved);
    onUpdate({ sectionOrder: nextOrder });
  };

  const addSection = () => {
    const id = crypto.randomUUID();
    const newSec = { id, title: "Notes", body: "" };
    onUpdate({
      customSections: [...customSections, newSec],
      sectionOrder: [...order, `custom:${id}`],
    });
  };

  const updateCustomSection = (id: string, patch: Partial<{ title: string; body: string }>) => {
    onUpdate({
      customSections: customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const deleteCustomSection = (id: string) => {
    onUpdate({
      customSections: customSections.filter((s) => s.id !== id),
      sectionOrder: order.filter((k) => k !== `custom:${id}`),
    });
  };

  const renderSection = (key: string, i: number) => {
    const isCustom = key.startsWith("custom:");
    const customId = isCustom ? key.slice(7) : "";
    const customSec = isCustom ? customSections.find((s) => s.id === customId) : null;
    if (isCustom && !customSec) return null;

    const label = key === "info" ? "Info" : key === "family" ? "Family" : customSec?.title || "Custom section";

    const reorderHeader = editing && (
      <div className="flex items-center justify-between gap-1 border-b border-border/60 bg-muted/50 px-2.5 py-1 text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={i === 0}
            onClick={() => moveSection(key, -1)}
            aria-label={`Move ${label} up`}
            title={`Move ${label} up`}
          >
            <ArrowUp size={12} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={i === order.length - 1}
            onClick={() => moveSection(key, 1)}
            aria-label={`Move ${label} down`}
            title={`Move ${label} down`}
          >
            <ArrowDown size={12} />
          </Button>
          {isCustom && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => deleteCustomSection(customId)}
              aria-label={`Delete ${label}`}
              title={`Delete ${label}`}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      </div>
    );

    if (key === "info") {
      return (
        <section key="info" className="overflow-hidden rounded-xl border border-border">
          {reorderHeader}
          <div className="p-3">
            <h3 className="mb-2 font-display text-base font-semibold">Info</h3>
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
                {!isNoRank && !isOutsider && <Row k="Rank" v={cat.rank} />}
                <Row k="Status" v={STATUS_LABEL[cat.status]} />
                <Row k="Clan" v={cat.clan} />
                {cat.appearance && <p className="pt-1 text-muted-foreground">{cat.appearance}</p>}
              </dl>
            )}
          </div>
        </section>
      );
    }

    if (key === "family") {
      return (
        <section key="family" className="overflow-hidden rounded-xl border border-border">
          {reorderHeader}
          <div className="p-3">
            <h3 className="mb-2 font-display text-base font-semibold">Family</h3>
            <div className="space-y-2">
              {SECTIONS.map(({ kind, label }) => {
                const ids = lists[kind];
                if (!editing && !ids.length) return null;
                const isOpen = !!openSections[kind];
                return (
                  <div key={kind} className="rounded-lg border border-border/70 bg-card p-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => toggleSection(kind)}
                        className="flex flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-left text-xs font-semibold hover:bg-muted/60 transition-colors"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronUp size={13} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={13} className="shrink-0 text-muted-foreground" />}
                        <span>{label}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">({ids.length})</span>
                      </button>
                      {editing && (
                        <div className="flex items-center gap-1">
                          <Select value="" onValueChange={(v) => onAddRel(kind, v)}>
                            <SelectTrigger aria-label={`Link ${label.toLowerCase()}`} className="h-6 w-[95px] px-1.5 text-[11px]">
                              <SelectValue placeholder="Link cat…" />
                            </SelectTrigger>
                            <SelectContent>
                              {cats.filter((c) => c.id !== cat.id).map((o) => (
                                <SelectItem key={o.id} value={o.id}>{catName(o)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {onCreateRel && (
                            <Button size="icon" variant="ghost" className="h-6 w-6" aria-label={`Create new ${label.toLowerCase()}`} title={`Create new ${label.toLowerCase()}`} onClick={() => onCreateRel(kind)}>
                              <Plus size={13} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {isOpen && (
                      ids.length === 0 ? (
                        <p className="px-2 pt-1 text-[11px] text-muted-foreground">None yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {ids.map((id) => {
                            const o = idx.byId.get(id);
                            if (!o) return null;
                            return (
                              <span key={id} className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2 py-1 text-xs">
                                <Button variant="ghost" className="flex h-auto items-center gap-1.5 p-0 text-left hover:underline whitespace-nowrap" onClick={() => onSelect(id)}>
                                  <CatAvatar avatar={o.avatar} className="h-4 w-4 shrink-0 rounded-full" />
                                  <span>{catName(o)}</span>
                                </Button>
                                {editing && (
                                  <Button variant="ghost" size="icon" onClick={() => onRemoveRel(kind, id)} className="h-4 w-4 shrink-0 rounded-full text-muted-foreground hover:text-destructive" aria-label={`Unlink ${catName(o)}`}>
                                    <X size={11} />
                                  </Button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              {!editing && SECTIONS.every(({ kind }) => !lists[kind].length) && (
                <p className="p-1 text-xs text-muted-foreground">No family recorded.</p>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (customSec) {
      return (
        <section key={key} className="overflow-hidden rounded-xl border border-border">
          {reorderHeader}
          <div className="p-3">
            {editing ? (
              <div className="space-y-2">
                <Field label="Section title (optional)">
                  <Input
                    value={customSec.title}
                    onChange={(e) => updateCustomSection(customId, { title: e.target.value })}
                    placeholder="Section title (optional)"
                    className="h-8 text-sm"
                  />
                </Field>
                <Field label="Content">
                  <Textarea
                    value={customSec.body}
                    rows={3}
                    onChange={(e) => updateCustomSection(customId, { body: e.target.value })}
                    placeholder="Write anything: history, traits, roleplay notes, quotes…"
                    className="text-sm"
                  />
                </Field>
              </div>
            ) : (
              <div>
                {customSec.title.trim() && (
                  <h3 className="mb-2 font-display text-base font-semibold">{customSec.title}</h3>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {customSec.body || "Nothing written yet."}
                </p>
              </div>
            )}
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85dvh] w-[min(940px,calc(100%-24px))] max-w-none gap-0 overflow-y-auto p-0 sm:rounded-2xl [&>button.absolute]:hidden">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-3 py-1.5" style={{ background: `color-mix(in oklab, ${CLAN_VAR[cat.clan] ?? "var(--primary)"} 14%, var(--card))` }}>
          {onViewInLineage && <Button size="sm" variant="outline" onClick={onViewInLineage}><GitBranch size={14} />View in lineage</Button>}
          <Button size="sm" variant={editing ? "default" : "outline"} onClick={() => setEditing((v) => !v)}><Pencil size={14} />{editing ? "Done editing" : "Edit profile"}</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close profile"><X size={18} /></Button>
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
          <div className="space-y-3">
            <div className="flex items-center justify-evenly gap-4 rounded-xl border border-border p-3">
              <span title={cat.clan} className="inline-flex shrink-0 items-center justify-center" style={{ color: CLAN_VAR[cat.clan] ?? "var(--primary)" }}>
                <ClanCrest crest={cat.clan} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
              </span>
              {editing ? (
                <AvatarPicker value={cat.avatar} onChange={(avatar) => onUpdate({ avatar })} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 rounded-full ring-2 ring-border/80 shadow-sm" />
              ) : (
                <CatAvatar avatar={cat.avatar} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 rounded-full ring-2 ring-border/80 shadow-sm" />
              )}
            </div>

            <button
              type="button"
              onClick={cycleStage}
              disabled={stages.length <= 1}
              title={stages.length > 1 ? "Click portrait to cycle life stage" : undefined}
              aria-label={stages.length > 1 ? "Cycle life stage" : undefined}
              className={`flex min-h-[180px] w-full items-center justify-center rounded-xl border border-border bg-muted/40 p-3 transition-colors ${stages.length > 1 ? "cursor-pointer hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : ""}`}
            >
              {portrait}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1" aria-label="Life stages">
              {stages.map((lifeStage, i) => <Button
                key={`${lifeStage.name}-${i}`}
                size="sm"
                variant={stageIndex === i ? "default" : "secondary"}
                aria-label={`View ${lifeStage.name} life stage`}
                aria-pressed={stageIndex === i}
                onClick={() => setStageIndex(i)}
              >{lifeStage.name || "…"}</Button>)}
            </div>

            {otherLineages.length > 0 && (
              <div className="rounded-xl border border-border p-3 space-y-1.5">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Other lineages</h4>
                <div className="space-y-1">
                  {otherLineages.map((t) => (
                    <Button
                      key={t.id}
                      variant="outline"
                      size="sm"
                      className="h-auto w-full justify-between whitespace-normal text-left text-xs py-1.5 px-2"
                      onClick={() => onOpenLineage?.(t.id, t.clanId)}
                    >
                      <span className="truncate">{t.name}</span>
                      <ArrowRight className="shrink-0 ml-1.5" size={13} />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {editing && onDelete && (
              <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 size={14} className="mr-1" /> Remove {catName(cat)} from tree
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <DialogTitle className="font-display text-2xl font-bold">{catName(cat)}</DialogTitle>
                {relTags && <span className="text-xs font-semibold text-primary">{relTags.join(" · ")}</span>}
              </div>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
                {cat.clan}{headerRank}{cat.status !== "Living" && ` · ${STATUS_LABEL[cat.status]}`}
              </DialogDescription>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Cat names">
                {stages.map((lifeStage, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={stageIndex === i ? "default" : "secondary"}
                      className="h-7 px-2.5 text-xs font-medium"
                      aria-label={`View ${lifeStage.name} life stage`}
                      aria-pressed={stageIndex === i}
                      onClick={() => setStageIndex(i)}
                    >
                      {lifeStage.name || "…"}
                    </Button>
                    {i < stages.length - 1 && <ArrowRight size={11} className="text-muted-foreground shrink-0" />}
                  </span>
                ))}
              </div>

              {editing && (
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <label className="cursor-pointer">
                      <ImageUp size={14} className="mr-1.5" />Upload picture
                      <input type="file" accept="image/*" className="sr-only" aria-label="Upload profile picture" onChange={(e) => { uploadPortrait(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </Button>
                  {cat.portrait && (
                    <Button size="sm" variant="ghost" onClick={() => onUpdate({ portrait: undefined })}>
                      Use drawn cat
                    </Button>
                  )}
                </div>
              )}

              {stage && (
                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                  {(() => {
                    const stageRank = stage.rank ?? cat.rank;
                    const showRank = stageRank && stageRank !== "None" && !isOutsider;
                    const sub = showRank ? `${stageRank}${stage.age ? ` · ${stage.age}` : ""}` : (stage.age || "");
                    return sub ? <span className="font-medium text-foreground">{sub}</span> : null;
                  })()}
                  {stage.mentors && <span>Mentors: {stage.mentors}</span>}
                  {stage.apprentices && <span>Apprentices: {stage.apprentices}</span>}
                </div>
              )}

              {editing && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-2.5">
                  <div className="text-xs font-semibold text-muted-foreground">Manage name history</div>
                  {cat.names.map((n, i) => (
                    <div key={i} className="flex gap-1.5">
                      <Input aria-label={`Name ${i + 1}`} value={n} onChange={(e) => setName(i, e.target.value)} onBlur={onCheckName} className="h-7 text-xs" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={cat.names.length === 1} onClick={() => onUpdate({ names: cat.names.filter((_, j) => j !== i), stages: stages.filter((_, j) => j !== i) })} aria-label="Remove name"><X size={13} /></Button>
                    </div>
                  ))}
                  <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { onUpdate({ names: [...cat.names, newName.trim()] }); setNewName(""); } }}>
                    <Input aria-label="Newer name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a newer name (e.g. Firestar)" className="h-7 text-xs" />
                    <Button type="submit" size="sm" variant="secondary" className="h-7 text-xs">Add</Button>
                  </form>
                  <NameIdeas hint={cat.appearance} onPick={setNewName} />
                </div>
              )}
            </div>

            {order.map((k, i) => renderSection(k, i))}

            {editing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
                className="w-full border-dashed"
              >
                <Plus size={14} className="mr-1.5" />
                Add section
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
