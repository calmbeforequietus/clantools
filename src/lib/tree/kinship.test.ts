import { describe, expect, it } from "vitest";
import { canonCats } from "./canon";
import { computeKinship } from "./kinship";
import { computeLayout } from "./layout";

const cats = canonCats();

describe("kinship", () => {
  it("labels Lionblaze's mother and maternal grandmother", () => {
    const { labels } = computeKinship(cats, "lionblaze");
    expect(labels.get("leafpool")).toContain("Mother");
    expect(labels.get("crowfeather")).toContain("Father");
    expect(labels.get("sandstorm")).toContain("Maternal Grandmother");
    expect(labels.get("squirrelflight")).toEqual(expect.arrayContaining(["Foster Mother", "Aunt"]));
    expect(labels.get("jayfeather")).toContain("Brother");
  });
  it("labels Firestar's mate, former apprentice and son-in-law", () => {
    const { labels } = computeKinship(cats, "firestar");
    expect(labels.get("sandstorm")).toContain("Mate");
    expect(labels.get("bluestar")).toContain("Former Mentor");
    expect(labels.get("brambleclaw")).toEqual(expect.arrayContaining(["Former Apprentice", "Son-in-law"]));
    expect(labels.get("princess")).toContain("Sister");
    expect(labels.get("flamepaw")).toContain("Great-Grandson");
  });
  it("detects half-siblings", () => {
    const extra = [...cats, { ...cats.find((c) => c.id === "cloudtail")!, id: "half", parents: ["princess", "jake"], mates: [] }];
    const { labels } = computeKinship(extra, "cloudtail");
    expect(labels.get("half")).toContain("Half-Brother");
  });
  it("places mates on the same generation", () => {
    const pos = computeLayout(cats);
    expect(pos.get("crowfeather")!.y).toBe(pos.get("leafpool")!.y);
    expect(pos.get("sandstorm")!.y).toBe(pos.get("firestar")!.y);
  });
});
