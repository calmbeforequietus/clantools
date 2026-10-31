import type { Cat, Clan, Gender, Rank, Status, Tree } from "./types";

function c(
  id: string,
  names: string[],
  clan: Clan,
  rank: Rank,
  status: Status,
  gender: Gender,
  pelt: string,
  appearance: string,
  rel: Partial<Pick<Cat, "parents" | "fosterParents" | "mates" | "mentors">> = {},
): Cat {
  return {
    id,
    names,
    clan,
    rank,
    status,
    gender,
    appearance,
    avatar: { kind: "pelt", pelt },
    parents: rel.parents ?? [],
    fosterParents: rel.fosterParents ?? [],
    mates: rel.mates ?? [],
    mentors: rel.mentors ?? [],
  };
}

export function canonCats(): Cat[] {
  return [
    c("jake", ["Jake"], "Kittypet", "None", "Living", "Tom", "gingerWhite", "Ginger-and-white tom.", { mates: ["nutmeg"] }),
    c("nutmeg", ["Nutmeg"], "Kittypet", "None", "Living", "She-cat", "brown", "Brown she-cat."),
    c("tigerstar", ["Tigerkit", "Tigerpaw", "Tigerclaw", "Tigerstar"], "ShadowClan", "Leader", "Dark Forest", "Tom", "darkBrownTabby", "Massive dark brown tabby tom with amber eyes and long claws.", { mates: ["goldenflower"] }),
    c("goldenflower", ["Goldenflower"], "ThunderClan", "Elder", "StarClan", "She-cat", "paleGinger", "Pale ginger she-cat."),
    c("bluestar", ["Bluekit", "Bluepaw", "Bluefur", "Bluestar"], "ThunderClan", "Leader", "StarClan", "She-cat", "blueGray", "Blue-gray she-cat with a silver-tipped muzzle and blue eyes."),
    c("firestar", ["Rusty", "Firepaw", "Fireheart", "Firestar"], "ThunderClan", "Leader", "StarClan", "Tom", "flame", "Handsome flame-colored tom with bright green eyes.", { parents: ["jake", "nutmeg"], mates: ["sandstorm"], mentors: ["bluestar"] }),
    c("princess", ["Princess"], "Kittypet", "Queen", "Living", "She-cat", "princess", "Light brown tabby with a white chest and paws.", { parents: ["jake", "nutmeg"] }),
    c("sandstorm", ["Sandkit", "Sandpaw", "Sandstorm"], "ThunderClan", "Warrior", "StarClan", "She-cat", "paleGinger", "Pale ginger she-cat with green eyes."),
    c("cinderpelt", ["Cinderkit", "Cinderpaw", "Cinderpelt"], "ThunderClan", "Medicine Cat", "StarClan", "She-cat", "darkGray", "Fluffy dark gray she-cat with blue eyes.", { mentors: ["firestar"] }),
    c("cloudtail", ["Cloudkit", "Cloudpaw", "Cloudtail"], "ThunderClan", "Warrior", "Living", "Tom", "white", "Long-haired white tom with blue eyes.", { parents: ["princess"], mentors: ["firestar"], mates: ["brightheart"] }),
    c("brightheart", ["Brightkit", "Brightpaw", "Lostface", "Brightheart"], "ThunderClan", "Warrior", "Living", "She-cat", "calicoWhite", "White she-cat with ginger patches and a scarred face."),
    c("brambleclaw", ["Bramblekit", "Bramblepaw", "Brambleclaw", "Bramblestar"], "ThunderClan", "Leader", "Living", "Tom", "darkBrownTabby", "Dark brown tabby tom with amber eyes.", { parents: ["tigerstar", "goldenflower"], mentors: ["firestar"], mates: ["squirrelflight"] }),
    c("squirrelflight", ["Squirrelkit", "Squirrelpaw", "Squirrelflight"], "ThunderClan", "Deputy", "Living", "She-cat", "darkGinger", "Dark ginger she-cat with green eyes and a bushy tail.", { parents: ["firestar", "sandstorm"] }),
    c("leafpool", ["Leafkit", "Leafpaw", "Leafpool"], "ThunderClan", "Medicine Cat", "StarClan", "She-cat", "lightBrownTabby", "Light brown tabby with amber eyes and a white chest.", { parents: ["firestar", "sandstorm"], mentors: ["cinderpelt"], mates: ["crowfeather"] }),
    c("crowfeather", ["Crowkit", "Crowpaw", "Crowfeather"], "WindClan", "Warrior", "Living", "Tom", "smoky", "Smoky dark gray, almost black tom with blue eyes."),
    c("whitewing", ["Whitekit", "Whitepaw", "Whitewing"], "ThunderClan", "Warrior", "Living", "She-cat", "whiteGreen", "White she-cat with green eyes.", { parents: ["cloudtail", "brightheart"], mates: ["birchfall"] }),
    c("birchfall", ["Birchkit", "Birchpaw", "Birchfall"], "ThunderClan", "Warrior", "Living", "Tom", "lightBrownTabby", "Light brown tabby tom."),
    c("lionblaze", ["Lionkit", "Lionpaw", "Lionblaze"], "ThunderClan", "Warrior", "Living", "Tom", "golden", "Muscular golden tabby tom with amber eyes.", { parents: ["leafpool", "crowfeather"], fosterParents: ["squirrelflight", "brambleclaw"] }),
    c("jayfeather", ["Jaykit", "Jaypaw", "Jayfeather"], "ThunderClan", "Medicine Cat", "Living", "Tom", "gray", "Gray tabby tom with blind blue eyes.", { parents: ["leafpool", "crowfeather"], fosterParents: ["squirrelflight", "brambleclaw"], mentors: ["leafpool"] }),
    c("hollyleaf", ["Hollykit", "Hollypaw", "Hollyleaf"], "ThunderClan", "Warrior", "StarClan", "She-cat", "black", "Sleek black she-cat with green eyes.", { parents: ["leafpool", "crowfeather"], fosterParents: ["squirrelflight", "brambleclaw"] }),
    c("sparkpelt", ["Sparkkit", "Sparkpaw", "Sparkpelt"], "ThunderClan", "Warrior", "StarClan", "She-cat", "darkGinger", "Orange tabby she-cat.", { parents: ["brambleclaw", "squirrelflight"], mates: ["larksong"] }),
    c("alderheart", ["Alderkit", "Alderpaw", "Alderheart"], "ThunderClan", "Medicine Cat", "Living", "Tom", "darkGinger", "Dark ginger tom with amber eyes.", { parents: ["brambleclaw", "squirrelflight"], mentors: ["jayfeather"] }),
    c("larksong", ["Larkkit", "Larkpaw", "Larksong"], "ThunderClan", "Warrior", "StarClan", "Tom", "black", "Black tom."),
    c("dovewing", ["Dovekit", "Dovepaw", "Dovewing"], "ThunderClan", "Warrior", "Living", "She-cat", "silver", "Pale gray she-cat with blue eyes.", { parents: ["whitewing", "birchfall"] }),
    c("ivypool", ["Ivykit", "Ivypaw", "Ivypool"], "ThunderClan", "Warrior", "Living", "She-cat", "silver", "Silver-and-white tabby she-cat with blue eyes.", { parents: ["whitewing", "birchfall"] }),
    c("flamepaw", ["Flamekit", "Flamepaw"], "ThunderClan", "Apprentice", "Living", "Tom", "darkGinger", "Dark ginger tom, medicine cat apprentice.", { parents: ["sparkpelt", "larksong"], mentors: ["alderheart"] }),
  ];
}

export function canonTree(id: string): Tree {
  return { id, name: "Firestar's Lineage", cats: canonCats(), updatedAt: Date.now() };
}
