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
const PREFIXES = ['Bright', 'Briar', 'Cinder', 'Dust', 'Fallow', 'Feather', 'Hawk', 'Holly', 'Jay', 'Larch', 'Lark', 'Long', 'Marsh', 'Moth', 'Nettle', 'Owl', 'Pine', 'Quail', 'Rain', 'Reed', 'Rose', 'Rush', 'Sedge', 'Sorrel', 'Spider', 'Swift', 'Thistle', 'Thorn', 'Thrush', 'Wren', 'Willow', 'Yarrow'];
const SUFFIXES = ['claw', 'fur', 'pelt', 'tail', 'heart', 'flight', 'stripe', 'whisker', 'leaf', 'fang', 'foot', 'step', 'song', 'storm', 'frost', 'wing', 'nose', 'ear', 'shade', 'stream', 'blaze', 'shine', 'breeze', 'cloud', 'thorn', 'face', 'eye', 'pool'];

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
