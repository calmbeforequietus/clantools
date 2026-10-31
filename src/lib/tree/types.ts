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
  | { kind: "pelt"; pelt: string }
  | { kind: "clan"; clan: Clan }
  | { kind: "image"; src: string };

export interface Cat {
  id: string;
  /** Name history; the last entry is the current name. */
  names: string[];
  clan: Clan;
  rank: Rank;
  status: Status;
  gender: Gender;
  appearance: string;
  avatar: Avatar;
  parents: string[];
  fosterParents: string[];
  mates: string[];
  mentors: string[];
}

export interface Tree {
  id: string;
  name: string;
  cats: Cat[];
  updatedAt: number;
}

export const catName = (c: Cat) => c.names[c.names.length - 1] || "Unnamed";
