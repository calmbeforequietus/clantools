import { describe, expect, it } from 'vitest';
import { catsInBox, movingCatIds, translateCats } from './selection';
import { newCat } from './ops';

describe('multi-cat movement', () => {
  const positions = new Map([['a', { x: 0, y: 0 }], ['b', { x: 200, y: 0 }], ['c', { x: 500, y: 250 }]]);
  it('selects intersecting cats in either box direction', () => {
    expect(catsInBox(positions, { x: -80, y: -10 }, { x: 280, y: 150 })).toEqual(['a', 'b']);
    expect(catsInBox(positions, { x: 280, y: 150 }, { x: -80, y: -10 })).toEqual(['a', 'b']);
    expect(catsInBox(positions, { x: 80, y: 0 }, { x: 120, y: 140 })).toEqual([]);
  });
  it('moves multiple cats by the same delta without moving other cats or mutating the original', () => {
    const next = translateCats(positions, ['a', 'b'], { x: 40, y: -20 });
    expect(next.get('a')).toEqual({ x: 40, y: -20 });
    expect(next.get('b')).toEqual({ x: 240, y: -20 });
    expect(next.get('c')).toEqual({ x: 500, y: 250 });
    expect(positions.get('a')).toEqual({ x: 0, y: 0 });
  });
  it('includes reciprocal and transitive mates once, but not relatives', () => {
    const cats = [newCat({ id: 'a', mates: ['b'] }), newCat({ id: 'b', mates: ['c'] }), newCat({ id: 'c' }), newCat({ id: 'kit', parents: ['a'] })];
    expect([...movingCatIds(cats, ['b', 'a'])].sort()).toEqual(['a', 'b', 'c']);
  });
});