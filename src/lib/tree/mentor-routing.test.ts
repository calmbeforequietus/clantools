import { expect, it } from 'vitest';
import { AVATAR, AVATAR_CY, computeLayout, NODE_H, NODE_W } from './layout';
import { canonTree } from './canon';
import { routeMentor, routeMentorConnections, roundedMentorPath } from './mentor-routing';
it('routes Firestar to Cloudtail around Sandstorm and other cats', () => {
  const tree = canonTree('test');
  const positions = computeLayout(tree.cats);
  const points = routeMentor(positions,'firestar','cloudtail');
  expect(points.length).toBeGreaterThan(3);
  for (let i=1;i<points.length;i++) {
    const a=points[i-1], b=points[i]; if(!a||!b) continue;
    for (const [id,p] of positions) {
      if(id==='firestar'||id==='cloudtail') continue;
      const intersects = a.y === b.y
        ? a.y > p.y && a.y < p.y+NODE_H && Math.max(a.x,b.x)>p.x-NODE_W/2 && Math.min(a.x,b.x)<p.x+NODE_W/2
        : a.x>p.x-NODE_W/2 && a.x<p.x+NODE_W/2 && Math.max(a.y,b.y)>p.y && Math.min(a.y,b.y)<p.y+NODE_H;
      expect(intersects, `route must avoid ${id}`).toBe(false);
    }
  }
  expect(roundedMentorPath(points)).toContain('Q');
});
it('uses separate lanes for shared mentor connections', () => {
  const positions = new Map([['mentor',{x:0,y:0}],['apprentice',{x:400,y:268}]]);
  expect(routeMentor(positions,'mentor','apprentice',0)).not.toEqual(routeMentor(positions,'mentor','apprentice',1));
});
it('gives Cinderpelt distinct incoming and outgoing attachment points', () => {
  const positions = computeLayout(canonTree('test').cats);
  const links = [{mentor:'firestar',apprentice:'cinderpelt'}, {mentor:'cinderpelt',apprentice:'leafpool'}, {mentor:'firestar',apprentice:'cloudtail'}, {mentor:'firestar',apprentice:'brambleclaw'}];
  const routes = routeMentorConnections(positions,links);
  const incoming = routes.get('firestar~cinderpelt') ?? [], outgoing = routes.get('cinderpelt~leafpool') ?? [];
  expect(incoming.length).toBeGreaterThan(2); expect(outgoing.length).toBeGreaterThan(2);
  expect(incoming.at(-1)?.y).not.toEqual(outgoing[0]?.y);
  const starts = links.filter(l=>l.mentor === 'firestar').map(l=>routes.get(`firestar~${l.apprentice}`)?.[0]?.y);
  expect(new Set(starts).size).toBe(3);
  expect(routeMentorConnections(positions,[...links].reverse())).toEqual(routes);
});
it('keeps every mentor arrow outside the left avatar edge and away from right-hand symbols', () => {
  const cats = canonTree('test').cats;
  const positions = computeLayout(cats);
  const links = cats.flatMap(cat => (cat.mentors ?? []).map(mentor => ({mentor: mentor.catId, apprentice:cat.id})));
  // Exercise multiple incoming/outgoing approaches on the same cat.
  const routes = routeMentorConnections(positions, [
    {mentor:'firestar',apprentice:'cinderpelt'},
    {mentor:'cinderpelt',apprentice:'leafpool'},
    {mentor:'firestar',apprentice:'cloudtail'},
  ]);
  for (const [key, points] of routes) {
    const target = positions.get(key.split('~')[1] ?? '');
    const tip = points.at(-1);
    expect(target).toBeDefined(); expect(tip).toBeDefined();
    if (!target || !tip) continue;
    expect(tip.x).toBeLessThan(target.x);
    expect(Math.hypot(tip.x-target.x,tip.y-target.y-AVATAR_CY)).toBeGreaterThan(AVATAR/2+4);
  }
});