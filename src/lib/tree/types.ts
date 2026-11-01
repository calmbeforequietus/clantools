import type { CatIconSettings } from './cat-icon';

export const CLANS = [
  "ThunderClan",
  "ShadowClan",
  "WindClan",
  "RiverClan",
  "SkyClan",
  "StarClan",
  "Dark Forest",
  "Loner/Rogue",
  "Kittypet",
  "BloodClan",
] as const;
export type Clan = (typeof CLANS)[number] | (string & {});

export const CLAN_VAR: Record<Clan, string> = {
  ThunderClan: "var(--clan-thunder)",
  ShadowClan: "var(--clan-shadow)",
  WindClan: "var(--clan-wind)",
  RiverClan: "var(--clan-river)",
  SkyClan: "var(--clan-sky)",
  StarClan: "var(--clan-star)",
  "Dark Forest": "var(--clan-darkforest)",
  "Loner/Rogue": "var(--clan-loner)",
  Kittypet: "var(--clan-kittypet)",
  BloodClan: "var(--clan-blood)",
};

export const RANKS = [
  "Leader",
  "Deputy",
  "Medicine Cat",
  "Warrior",
  "Apprentice",
  "Kit",
  "Elder",
  "Queen",
  "None",
] as const;
export type Rank = (typeof RANKS)[number];

export const STATUSES = ["Living", "StarClan", "Dark Forest"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  Living: "Living",
  StarClan: "StarClan",
  "Dark Forest": "Place of No Stars",
};

export const GENDERS = ["She-cat", "Tom", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

export type Avatar =
  | { kind: "custom"; settings: CatIconSettings }
  | { kind: "pelt"; pelt: string }
  | { kind: "clan"; clan: Clan }
  | { kind: "image"; src: string };

export interface LifeStage {
  name: string;
  avatar?: Avatar;
  description?: string;
  age?: string;
  mentors?: string;
  apprentices?: string;
  rank?: Rank;
}

export interface Era { id: string; name: string; }
export interface LoreSection { id: string; title: string; body: string; }
export interface MapPin { id: string; x: number; y: number; name: string; body: string; }
export interface ClanPage {
  id: string; name: string; affiliation: Clan; crest: string; color: string;
  sections: LoreSection[]; map?: string; pins: MapPin[]; eras: Era[];
  sectionOrder?: string[];
  motto?: string | undefined;
  /** Extra top-level text sections, ordered through sectionOrder as `custom:<id>`. */
  customSections?: LoreSection[];
  /** Sections shown at half width; two adjacent half sections share a row. */
  halfSections?: string[];
}

export interface Cat {
  id: string;
  /** Name history; the last entry is the current name. */
  names: string[];
  clan: Clan;
  rank: Rank;
  status: Status;
  gender: Gender;
  appearance: string;
  summary?: string;
  biography?: string;
  stages?: LifeStage[];
  birthEra?: string | undefined;
  avatar: Avatar;
  /** Large profile art; defaults to the full-body drawing of a custom avatar. */
  portrait?: string | undefined;
  parents: string[];
  fosterParents: string[];
  mates: string[];
  mentors: string[];
  /** Manual canvas position from dragging; layout picks it up and keeps it anchored. */
  pos?: { x: number; y: number } | undefined;
  customSections?: { id: string; title: string; body: string }[];
  sectionOrder?: string[];
}

export interface Tree {
  id: string;
  name: string;
  cats: Cat[];
  updatedAt: number;
  clanId?: string;
  /** Applied additive canon expansion; user edits are never reapplied on load. */
  canonRevision?: number;
}

export const catName = (c: Cat) => c.names[c.names.length - 1] || "Unnamed";
