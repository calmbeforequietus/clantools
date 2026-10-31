import type { Cat } from "./types";

export function buildIndex(cats: Cat[]) {
  const byId = new Map(cats.map((c) => [c.id, c]));
  const children = new Map<string, string[]>();
  const fosterKits = new Map<string, string[]>();
  const apprentices = new Map<string, string[]>();
  const mates = new Map<string, Set<string>>();
  const push = (m: Map<string, string[]>, k: string, v: string) => {
    if (!byId.has(k)) return;
    const a = m.get(k) ?? [];
    if (!a.includes(v)) a.push(v);
    m.set(k, a);
  };
  const mate = (a: string, b: string) => {
    if (!byId.has(a) || !byId.has(b) || a === b) return;
    (mates.get(a) ?? mates.set(a, new Set()).get(a)!).add(b);
    (mates.get(b) ?? mates.set(b, new Set()).get(b)!).add(a);
  };
  for (const c of cats) {
    c.parents.forEach((p) => push(children, p, c.id));
    c.fosterParents.forEach((p) => push(fosterKits, p, c.id));
    c.mentors.forEach((p) => push(apprentices, p, c.id));
    c.mates.forEach((m) => mate(c.id, m));
  }
  const valid = (ids: string[] | undefined) => (ids ?? []).filter((i) => byId.has(i));
  return {
    byId,
    parents: (id: string) => valid(byId.get(id)?.parents),
    fosterParents: (id: string) => valid(byId.get(id)?.fosterParents),
    mentors: (id: string) => valid(byId.get(id)?.mentors),
    children: (id: string) => children.get(id) ?? [],
    fosterKits: (id: string) => fosterKits.get(id) ?? [],
    apprentices: (id: string) => apprentices.get(id) ?? [],
    mates: (id: string) => [...(mates.get(id) ?? [])],
  };
}
export type CatIndex = ReturnType<typeof buildIndex>;

export interface Kinship {
  labels: Map<string, string[]>;
  highlight: Set<string>;
}

export function computeKinship(cats: Cat[], f: string): Kinship {
  const idx = buildIndex(cats);
  const labels = new Map<string, string[]>();
  const add = (id: string, l: string) => {
    if (id === f || !idx.byId.has(id)) return;
    const a = labels.get(id) ?? [];
    if (!a.includes(l)) a.push(l);
    labels.set(id, a);
  };
  const G = (id: string, she: string, tom: string, other: string) => {
    const g = idx.byId.get(id)?.gender;
    return g === "She-cat" ? she : g === "Tom" ? tom : other;
  };

  const P = idx.parents(f);
  idx.mates(f).forEach((m) => add(m, "Mate"));
  P.forEach((p) => add(p, G(p, "Mother", "Father", "Parent")));
  idx.fosterParents(f).forEach((p) => add(p, G(p, "Foster Mother", "Foster Father", "Foster Parent")));
  const kids = idx.children(f);
  kids.forEach((k) => add(k, G(k, "Daughter", "Son", "Kit")));
  idx.fosterKits(f).forEach((k) => add(k, G(k, "Foster Daughter", "Foster Son", "Foster Kit")));

  // Siblings
  const sibs = new Set<string>();
  P.forEach((p) => idx.children(p).forEach((c) => c !== f && sibs.add(c)));
  sibs.forEach((s) => {
    const sp = idx.parents(s);
    const shared = P.filter((p) => sp.includes(p)).length;
    const full = shared === P.length && sp.length === P.length;
    add(s, full ? G(s, "Sister", "Brother", "Sibling") : G(s, "Half-Sister", "Half-Brother", "Half-Sibling"));
  });
  const fosterSibs = new Set<string>();
  idx.fosterParents(f).forEach((fp) => [...idx.children(fp), ...idx.fosterKits(fp)].forEach((c) => fosterSibs.add(c)));
  P.forEach((p) => idx.fosterKits(p).forEach((c) => fosterSibs.add(c)));
  fosterSibs.forEach((s) => !sibs.has(s) && add(s, G(s, "Foster Sister", "Foster Brother", "Foster Sibling")));

  // Grandparents, aunts/uncles, cousins
  P.forEach((p) => {
    const g = idx.byId.get(p)?.gender;
    const side = g === "She-cat" ? "Maternal " : g === "Tom" ? "Paternal " : "";
    idx.parents(p).forEach((gp) => {
      add(gp, side + G(gp, "Grandmother", "Grandfather", "Grandparent"));
      idx.parents(gp).forEach((ggp) => add(ggp, G(ggp, "Great-Grandmother", "Great-Grandfather", "Great-Grandparent")));
      idx.children(gp).forEach((au) => {
        if (au === p || P.includes(au) || au === f || sibs.has(au)) return;
        add(au, G(au, "Aunt", "Uncle", "Parent's Sibling"));
        idx.children(au).forEach((cz) => cz !== f && !sibs.has(cz) && add(cz, "Cousin"));
      });
    });
  });

  // Descendants
  kids.forEach((k) =>
    idx.children(k).forEach((gc) => {
      add(gc, G(gc, "Granddaughter", "Grandson", "Grandkit"));
      idx.children(gc).forEach((ggc) => add(ggc, G(ggc, "Great-Granddaughter", "Great-Grandson", "Great-Grandkit")));
    }),
  );
  sibs.forEach((s) => idx.children(s).forEach((n) => add(n, G(n, "Niece", "Nephew", "Sibling's Kit"))));

  // In-laws
  idx.mates(f).forEach((m) => idx.parents(m).forEach((mp) => add(mp, G(mp, "Mother-in-law", "Father-in-law", "Parent-in-law"))));
  kids.forEach((k) => idx.mates(k).forEach((km) => add(km, G(km, "Daughter-in-law", "Son-in-law", "Kit-in-law"))));
  sibs.forEach((s) => idx.mates(s).forEach((sm) => add(sm, G(sm, "Sister-in-law", "Brother-in-law", "Sibling-in-law"))));

  // Mentorship
  const me = idx.byId.get(f);
  const training = me?.rank === "Apprentice" || me?.rank === "Kit";
  idx.mentors(f).forEach((m) => add(m, training ? "Mentor" : "Former Mentor"));
  idx.apprentices(f).forEach((a) => add(a, idx.byId.get(a)?.rank === "Apprentice" ? "Apprentice" : "Former Apprentice"));

  // Ancestors / descendants for highlighting
  const highlight = new Set<string>([f]);
  const walk = (id: string, next: (i: string) => string[], tag: string) => {
    for (const n of next(id)) {
      if (highlight.has(n) && labels.has(n)) continue;
      const seen = highlight.has(n);
      highlight.add(n);
      if (!labels.has(n)) add(n, tag);
      if (!seen) walk(n, next, tag);
    }
  };
  walk(f, (i) => [...idx.parents(i), ...idx.fosterParents(i)], "Ancestor");
  walk(f, (i) => [...idx.children(i), ...idx.fosterKits(i)], "Descendant");
  labels.forEach((_, k) => highlight.add(k));
  return { labels, highlight };
}
