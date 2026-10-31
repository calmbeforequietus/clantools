import { canonTree } from "./canon";
import { initialClans } from "./clans";
import type { ClanPage, Cat, Tree } from "./types";

export type RelKind = "parents" | "mates" | "fosterParents" | "mentors" | "kits" | "fosterKits" | "apprentices";

const clone = (c: Cat): Cat => ({
  ...c,
  names: [...c.names],
  parents: [...c.parents],
  fosterParents: [...c.fosterParents],
  mates: [...c.mates],
  mentors: [...c.mentors],
});

export function mutate(cats: Cat[], fn: (m: Map<string, Cat>) => void): Cat[] {
  const m = new Map(cats.map((c) => [c.id, clone(c)]));
  fn(m);
  return [...m.values()];
}

const addTo = (arr: string[], v: string) => !arr.includes(v) && arr.push(v);
const rm = (arr: string[], v: string) => {
  const i = arr.indexOf(v);
  if (i >= 0) arr.splice(i, 1);
};

export function addRelation(cats: Cat[], id: string, kind: RelKind, other: string) {
  if (id === other) return cats;
  return mutate(cats, (m) => {
    const a = m.get(id), b = m.get(other);
    if (!a || !b) return;
    if (kind === "parents") addTo(a.parents, other);
    if (kind === "mates") addTo(a.mates, other);
    if (kind === "fosterParents") addTo(a.fosterParents, other);
    if (kind === "mentors") addTo(a.mentors, other);
    if (kind === "kits") addTo(b.parents, id);
    if (kind === "fosterKits") addTo(b.fosterParents, id);
    if (kind === "apprentices") addTo(b.mentors, id);
  });
}

export function removeRelation(cats: Cat[], id: string, kind: RelKind, other: string) {
  return mutate(cats, (m) => {
    const a = m.get(id), b = m.get(other);
    if (!a || !b) return;
    if (kind === "parents") rm(a.parents, other);
    if (kind === "mates") (rm(a.mates, other), rm(b.mates, id));
    if (kind === "fosterParents") rm(a.fosterParents, other);
    if (kind === "mentors") rm(a.mentors, other);
    if (kind === "kits") rm(b.parents, id);
    if (kind === "fosterKits") rm(b.fosterParents, id);
    if (kind === "apprentices") rm(b.mentors, id);
  });
}

export function deleteCat(cats: Cat[], id: string) {
  return mutate(cats, (m) => {
    m.delete(id);
    m.forEach((c) => {
      rm(c.parents, id);
      rm(c.fosterParents, id);
      rm(c.mates, id);
      rm(c.mentors, id);
    });
  });
}

export function newCat(partial: Partial<Cat> = {}): Cat {
  return {
    id: crypto.randomUUID(),
    names: ["New Cat"],
    clan: "ThunderClan",
    rank: "Warrior",
    status: "Living",
    gender: "Other",
    appearance: "",
    avatar: { kind: "pelt", pelt: "gray" },
    parents: [],
    fosterParents: [],
    mates: [],
    mentors: [],
    ...partial,
  };
}

// ---------- persistence ----------
export interface Store {
  trees: Tree[];
  activeId: string;
  clans: ClanPage[];
}
const KEY = "warrior-cats-trees-v1";

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      if (s.trees?.length) {
        const first = s.trees[0];
        if (!first) throw new Error("No trees");
        const clans = s.clans ?? initialClans(first.id);
        return { ...s, clans, trees: s.trees.map(t => ({ ...t, clanId: t.clanId ?? "thunderclan" })) };
      }
    }
  } catch {
    /* ignore */
  }
  const t = canonTree(crypto.randomUUID());
  return { trees: [{ ...t, clanId: "thunderclan" }], activeId: t.id, clans: initialClans(t.id) };
}

export function saveStore(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function isTree(x: unknown): x is Tree {
  const t = x as Tree;
  return !!t && typeof t.name === "string" && Array.isArray(t.cats);
}
