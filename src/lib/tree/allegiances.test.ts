import { describe, expect, it } from 'vitest';
import { allegianceCats } from './clans';
import { newCat } from './ops';
describe('Allegiances status visibility', () => {
  const living = newCat({status:'Living'}), star = newCat({status:'StarClan'}), dark = newCat({status:'Dark Forest'});
  it('includes only living cats by default', () => expect(allegianceCats([living,star,dark])).toEqual([living]));
  it('includes StarClan when switched on without including Dark Forest', () => expect(allegianceCats([living,star,dark],true)).toEqual([living,star]));
});