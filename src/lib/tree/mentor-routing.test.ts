import { expect, it } from 'vitest';
import { computeLayout, NODE_H, NODE_W } from './layout';
import { canonTree } from './canon';
import { routeMentor, roundedMentorPath } from './mentor-routing';
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