export const NAME_STAGES = ['kit', 'paw', 'warrior', 'star'] as const;
export type NameStage = typeof NAME_STAGES[number];

const HINTS: [RegExp, string[]][] = [
  [/ginger|orange|flame|red/i, ['Flame', 'Fire', 'Russet', 'Ember', 'Fox', 'Rowan']],
  [/black|dark/i, ['Night', 'Raven', 'Crow', 'Shadow', 'Coal', 'Ebony']],
  [/white|pale/i, ['Snow', 'Frost', 'Cloud', 'Swan', 'Lily', 'Ice']],
  [/gr[ae]y|ash|smok/i, ['Ash', 'Storm', 'Smoke', 'Mouse', 'Pebble', 'Dove']],
  [/silver/i, ['Silver', 'Mist', 'Moon', 'Frost']],
  [/brown|chocolate|tabby/i, ['Bramble', 'Hazel', 'Oak', 'Tiger', 'Mud', 'Bark']],
  [/gold|yellow|sand|cream/i, ['Sun', 'Honey', 'Sand', 'Lion', 'Gold', 'Dawn']],
  [/tortoise|calico|patch|dappled/i, ['Dapple', 'Spotted', 'Speckle', 'Leaf', 'Patch']],
  [/blue|ice/i, ['Blue', 'Sky', 'River']],
  [/green/i, ['Fern', 'Moss', 'Ivy', 'Leaf']],
];
/** Canon-style prefixes and suffixes from the Warriors books. */
export const PREFIXES = ['Acorn', 'Adder', 'Alder', 'Amber', 'Apple', 'Ash', 'Aspen', 'Badger', 'Bark', 'Bee', 'Beech', 'Beetle', 'Berry', 'Birch', 'Black', 'Bird', 'Blaze', 'Bloom', 'Blossom', 'Blue', 'Bone', 'Bounce', 'Bracken', 'Bramble', 'Branch', 'Breeze', 'Briar', 'Bright', 'Brindle', 'Bristle', 'Brook', 'Brown', 'Bumble', 'Burnt', 'Buzzard', 'Cedar', 'Cherry', 'Chestnut', 'Cinder', 'Clear', 'Cloud', 'Clover', 'Cold', 'Copper', 'Crooked', 'Crow', 'Cricket', 'Cloudy', 'Dapple', 'Dark', 'Dawn', 'Daisy', 'Dew', 'Dove', 'Dust', 'Eagle', 'Echo', 'Egg', 'Elder', 'Ember', 'Fallen', 'Fallow', 'Fawn', 'Feather', 'Fern', 'Ferret', 'Fin', 'Finch', 'Fire', 'Flame', 'Flax', 'Flint', 'Flower', 'Fog', 'Fox', 'Frog', 'Frost', 'Furze', 'Gold', 'Gorse', 'Gray', 'Hail', 'Half', 'Hare', 'Hawk', 'Hazel', 'Heather', 'Heavy', 'Hickory', 'Holly', 'Honey', 'Hollow', 'Ice', 'Ivy', 'Jagged', 'Jay', 'Juniper', 'Kestrel', 'Kink', 'Lark', 'Larch', 'Leaf', 'Leopard', 'Lichen', 'Light', 'Lily', 'Lion', 'Little', 'Lizard', 'Long', 'Loud', 'Lost', 'Marigold', 'Marsh', 'Meadow', 'Mint', 'Minnow', 'Mist', 'Misty', 'Moon', 'Morning', 'Moss', 'Moth', 'Mouse', 'Mud', 'Mumble', 'Myrtle', 'Needle', 'Nettle', 'Night', 'Oak', 'Oat', 'Olive', 'One', 'Otter', 'Owl', 'Pale', 'Patch', 'Pebble', 'Petal', 'Pine', 'Plum', 'Pod', 'Poppy', 'Puddle', 'Quail', 'Quick', 'Quiet', 'Rabbit', 'Ragged', 'Rain', 'Raven', 'Red', 'Reed', 'Ripple', 'River', 'Robin', 'Rock', 'Rose', 'Rowan', 'Rush', 'Russet', 'Rye', 'Sage', 'Sand', 'Scorch', 'Sedge', 'Seed', 'Shade', 'Shadow', 'Sharp', 'Shell', 'Shimmer', 'Shrew', 'Silver', 'Sky', 'Slate', 'Sleek', 'Small', 'Smoke', 'Snake', 'Snow', 'Soft', 'Song', 'Sorrel', 'Sparrow', 'Speckle', 'Spider', 'Spotted', 'Squirrel', 'Starling', 'Stem', 'Stone', 'Storm', 'Strike', 'Sun', 'Swallow', 'Swan', 'Sweet', 'Swift', 'Tall', 'Tangle', 'Tansy', 'Tawny', 'Thistle', 'Thorn', 'Thrift', 'Thrush', 'Thunder', 'Tiger', 'Tiny', 'Toad', 'Torn', 'Tumble', 'Twig', 'Vine', 'Violet', 'Vole', 'Wasp', 'Wave', 'Weasel', 'Whisker', 'White', 'Whorl', 'Willow', 'Wind', 'Wish', 'Wolf', 'Wren', 'Yarrow', 'Yellow'];
export const SUFFIXES = ['bark', 'bee', 'belly', 'berry', 'blaze', 'bloom', 'blossom', 'branch', 'breeze', 'briar', 'bright', 'brook', 'burr', 'claw', 'cloud', 'creek', 'dapple', 'dawn', 'dew', 'drift', 'dust', 'ear', 'echo', 'eye', 'face', 'fall', 'fang', 'feather', 'fern', 'fire', 'flame', 'flight', 'flower', 'fleck', 'foot', 'frost', 'fur', 'gaze', 'gorse', 'hawk', 'haze', 'heart', 'heather', 'jaw', 'leaf', 'leap', 'light', 'mist', 'moon', 'nose', 'pelt', 'petal', 'pool', 'poppy', 'rain', 'ripple', 'river', 'runner', 'scar', 'sedge', 'shade', 'shadow', 'shell', 'shine', 'sky', 'slip', 'snout', 'song', 'speck', 'splash', 'spot', 'spots', 'stem', 'step', 'stone', 'storm', 'streak', 'stream', 'stripe', 'swoop', 'tail', 'talon', 'throat', 'thorn', 'tooth', 'tuft', 'watcher', 'whisker', 'whisper', 'willow', 'wind', 'wing'];

/** Deterministic for a given random source so tests can pin results. */
export function suggestNames(count: number, stage: NameStage = 'warrior', hint = '', random: () => number = Math.random) {
  const hinted = HINTS.filter(([re]) => re.test(hint)).flatMap(([, list]) => list);
  const pool = [...hinted, ...hinted, ...PREFIXES];
  const out = new Set<string>();
  for (let tries = 0; out.size < count && tries < count * 20; tries++) {
    const prefix = pool[Math.floor(random() * pool.length)] ?? 'Fern';
    const suffix = stage === 'kit' ? 'kit' : stage === 'paw' ? 'paw' : stage === 'star' ? 'star' : SUFFIXES[Math.floor(random() * SUFFIXES.length)] ?? 'tail';
    if (prefix.toLowerCase().endsWith(suffix) || prefix.toLowerCase() === suffix) continue;
    out.add(prefix + suffix);
  }
  return [...out];
}
