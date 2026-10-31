import { useMemo, useState } from "react";
import { ArrowRight, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildIndex } from "@/lib/tree/kinship";
import type { RelKind } from "@/lib/tree/ops";
import { CLAN_VAR, CLANS, GENDERS, RANKS, STATUS_LABEL, STATUSES, catName, type Cat } from "@/lib/tree/types";
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
  onClose,
  onUpdate,
  onAddRel,
  onRemoveRel,
  onCreateRel,
  onDelete,
  onSelect,
}: {
  cat: Cat;
  cats: Cat[];
  relTags?: string[];
  onClose: () => void;
  onUpdate: (patch: Partial<Cat>) => void;
  onAddRel: (kind: RelKind, other: string) => void;
  onRemoveRel: (kind: RelKind, other: string) => void;
  onCreateRel: (kind: RelKind) => void;
  onDelete: () => void;
  onSelect: (id: string) => void;
}) {
  const idx = useMemo(() => buildIndex(cats), [cats]);
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
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close profile">
          <X size={18} />
        </button>
        <div className="flex items-center gap-4">
          <AvatarPicker value={cat.avatar} onChange={(avatar) => onUpdate({ avatar })} />
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-bold text-foreground">{catName(cat)}</h2>
            <p className="text-sm text-muted-foreground">{cat.clan} · {cat.rank === "None" ? "No rank" : cat.rank}</p>
            {relTags && <p className="mt-1 text-xs font-semibold text-primary">{relTags.join(" · ")}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name history</h3>
          <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            {cat.names.map((n, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`rounded-full px-2 py-0.5 ${i === cat.names.length - 1 ? "bg-primary font-semibold text-primary-foreground" : "bg-muted text-foreground"}`}>{n || "…"}</span>
                {i < cat.names.length - 1 && <ArrowRight size={12} className="text-muted-foreground" />}
              </span>
            ))}
          </div>
          <div className="space-y-1.5">
            {cat.names.map((n, i) => (
              <div key={i} className="flex gap-1.5">
                <Input value={n} onChange={(e) => setName(i, e.target.value)} className="h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={cat.names.length === 1}
                  onClick={() => onUpdate({ names: cat.names.filter((_, j) => j !== i) })} aria-label="Remove name">
                  <X size={14} />
                </Button>
              </div>
            ))}
            <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { onUpdate({ names: [...cat.names, newName.trim()] }); setNewName(""); } }}>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a newer name (e.g. Firestar)" className="h-8" />
              <Button type="submit" size="sm" variant="secondary" className="h-8">Add</Button>
            </form>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Field label="Clan / affiliation">
            <Select value={cat.clan} onValueChange={(v) => onUpdate({ clan: v as Cat["clan"] })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{CLANS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Relationships</h3>
          <div className="space-y-3">
            {SECTIONS.map(({ kind, label }) => {
              const ids = lists[kind];
              const options = cats.filter((c) => c.id !== cat.id && !ids.includes(c.id));
              return (
                <div key={kind} className="rounded-xl border border-border p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <div className="flex items-center gap-1">
                      <Select value="" onValueChange={(v) => onAddRel(kind, v)}>
                        <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue placeholder="Link cat…" /></SelectTrigger>
                        <SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{catName(o)}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={`Create new ${label.toLowerCase()}`} onClick={() => onCreateRel(kind)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  {ids.length === 0 ? (
                    <p className="text-xs text-muted-foreground">None yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ids.map((id) => {
                        const o = idx.byId.get(id)!;
                        return (
                          <span key={id} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-0.5 pr-1 text-xs">
                            <button type="button" className="flex items-center gap-1 hover:underline" onClick={() => onSelect(id)}>
                              <CatAvatar avatar={o.avatar} className="h-5 w-5" />
                              {catName(o)}
                            </button>
                            <button type="button" onClick={() => onRemoveRel(kind, id)} className="rounded-full p-0.5 text-muted-foreground hover:bg-background" aria-label={`Unlink ${catName(o)}`}>
                              <X size={11} />
                            </button>
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

      <div className="border-t border-border px-5 py-3">
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 size={14} /> Remove {catName(cat)} from tree
        </Button>
      </div>
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
