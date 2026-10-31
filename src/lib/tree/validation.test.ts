import { describe, expect, it } from 'vitest';
import { canonCats } from './canon';
import { checkRelation } from './validation';
import { computeLayout, GAP_X, NODE_W } from './layout';
import { loadStore } from './ops';

describe('connection safeguards', () => {
 const cats = canonCats();
 it('blocks duplicate mates even when stored on only one partner', () => { expect(checkRelation(cats, 'sandstorm', 'mates', 'firestar')?.blocked).toBe(true); });
 it('blocks a cat becoming its own ancestor', () => { expect(checkRelation(cats, 'firestar', 'parents', 'flamepaw')?.blocked).toBe(true); });
 it('blocks self connections', () => { expect(checkRelation(cats, 'firestar', 'mentors', 'firestar')?.blocked).toBe(true); });
 it('warns when siblings become mates and identifies common ancestors', () => { const issue = checkRelation(cats, 'squirrelflight', 'mates', 'leafpool'); expect(issue?.blocked).toBe(false); expect(issue?.message).toContain('Firestar'); expect(issue?.message).toContain('Sandstorm'); });
 it('warns when joining two ancestral branches', () => { expect(checkRelation(cats, 'cloudtail', 'mates', 'leafpool')).toMatchObject({ blocked: false }); });
 it('keeps Squirrelflight and Bramblestar adjacent', () => { const p = computeLayout(cats); const a = p.get('brambleclaw'), b = p.get('squirrelflight'); expect(a?.y).toBe(b?.y); expect(Math.abs((a?.x ?? 0) - (b?.x ?? 0))).toBe(NODE_W+GAP_X); });
 it('keeps nodes separated within every generation', () => { const p = [...computeLayout(cats).values()]; for (let i=0; i<p.length; i++) for (let j=i+1; j<p.length; j++) { const a=p[i], b=p[j]; if (a && b && a.y === b.y) expect(Math.abs(a.x-b.x)).toBeGreaterThanOrEqual(NODE_W+GAP_X); } });
 it('migrates existing saved trees without dropping cats', () => { const t = { id: 'old', name: 'Saved tree', cats, updatedAt: 0 }; localStorage.setItem('warrior-cats-trees-v1', JSON.stringify({ trees: [t], activeId: 'old' })); const s = loadStore(); expect(s.trees[0]?.cats).toHaveLength(26); expect(s.trees[0]?.clanId).toBe('thunderclan'); expect(s.clans).toHaveLength(7); localStorage.clear(); });
});
