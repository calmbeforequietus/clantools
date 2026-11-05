// Pelt palettes for the built-in stylized avatar library (image content, not UI colors).
export type Pattern = "solid" | "tabby" | "white" | "tortie";
export interface Pelt {
  label: string;
  base: string;
  mark: string;
  eye: string;
  pattern: Pattern;
}

export const PELTS: Record<string, Pelt> = {
  flame: { label: "Flame ginger", base: "#d9732a", mark: "#a94f17", eye: "#5fae4a", pattern: "solid" },
  gingerWhite: { label: "Ginger & white", base: "#df8a3e", mark: "#b0601f", eye: "#d9a53a", pattern: "white" },
  paleGinger: { label: "Pale ginger", base: "#e7b26e", mark: "#c98c48", eye: "#7cae58", pattern: "tabby" },
  darkGinger: { label: "Dark ginger", base: "#b9541f", mark: "#7f3510", eye: "#5f9e4a", pattern: "solid" },
  golden: { label: "Golden tabby", base: "#e2b347", mark: "#b6862a", eye: "#d79a2c", pattern: "tabby" },
  lightBrownTabby: { label: "Light brown tabby", base: "#b48662", mark: "#7c5638", eye: "#d29a3a", pattern: "tabby" },
  brown: { label: "Brown", base: "#8a5a3a", mark: "#5e3a22", eye: "#9fb04a", pattern: "solid" },
  darkBrownTabby: { label: "Dark brown tabby", base: "#5b3e2b", mark: "#2f1f15", eye: "#e0a136", pattern: "tabby" },
  princess: { label: "Brown & white tabby", base: "#a87a55", mark: "#6c4a30", eye: "#88a85a", pattern: "white" },
  white: { label: "White", base: "#f3eee5", mark: "#d8d0c2", eye: "#5aa0d6", pattern: "solid" },
  whiteGreen: { label: "White, green eyes", base: "#f3eee5", mark: "#d8d0c2", eye: "#69b05a", pattern: "solid" },
  calicoWhite: { label: "White & ginger", base: "#f1ebe1", mark: "#d98a42", eye: "#69a6d4", pattern: "tortie" },
  gray: { label: "Gray tabby", base: "#9a9895", mark: "#6b6a68", eye: "#7fb2d8", pattern: "tabby" },
  darkGray: { label: "Dark gray", base: "#5f6066", mark: "#3e3f44", eye: "#6ea0c8", pattern: "solid" },
  blueGray: { label: "Blue-gray", base: "#7b8a99", mark: "#55616d", eye: "#7fb6dd", pattern: "solid" },
  black: { label: "Black", base: "#2c2826", mark: "#141211", eye: "#69b05a", pattern: "solid" },
  smoky: { label: "Smoky black", base: "#3b3b42", mark: "#202024", eye: "#6fa8d8", pattern: "solid" },
  tortie: { label: "Tortoiseshell", base: "#3a2a22", mark: "#c4682a", eye: "#d9a53a", pattern: "tortie" },
  silver: { label: "Silver tabby", base: "#c8c9cb", mark: "#7c7e82", eye: "#62a4c9", pattern: "tabby" },
  cream: { label: "Cream", base: "#ecd6ae", mark: "#d1b583", eye: "#c99a3c", pattern: "solid" },
  onyx: { label: "Onyx", base: "#101214", mark: "#0b0c0e", eye: "#69b05a", pattern: "solid" },
  sable: { label: "Sable", base: "#362113", mark: "#25160d", eye: "#e0a136", pattern: "solid" },
  pewter: { label: "Pewter tabby", base: "#535c66", mark: "#383f45", eye: "#7fb2d8", pattern: "tabby" },
  taupe: { label: "Taupe", base: "#94827a", mark: "#655853", eye: "#88a85a", pattern: "tabby" },
  dun: { label: "Dun", base: "#776e58", mark: "#514b3c", eye: "#d29a3a", pattern: "solid" },
  chinchilla: { label: "Chinchilla", base: "#d2d8df", mark: "#8f9398", eye: "#62a4c9", pattern: "tabby" },
  pearl: { label: "Pearl", base: "#c7b3a6", mark: "#877a71", eye: "#5aa0d6", pattern: "solid" },
  apricot: { label: "Apricot", base: "#f6b88f", mark: "#a77d61", eye: "#69a6d4", pattern: "solid" },
  chestnut: { label: "Chestnut", base: "#814200", mark: "#582d06", eye: "#9fb04a", pattern: "solid" },
  russet: { label: "Russet tabby", base: "#893a0e", mark: "#5d270a", eye: "#d9a53a", pattern: "tabby" },
  marmalade: { label: "Marmalade", base: "#ea7e00", mark: "#9f5606", eye: "#5fae4a", pattern: "tabby" },
};
