import { AVATAR, NODE_H, NODE_W, type Positions } from './layout';
export interface Point { x: number; y: number }
interface RoutingOptions { sourceOffset?: number; targetOffset?: number; occupied?: Point[][] }
export function routeMentor(positions: Positions, mentor: string, apprentice: string, lane = 0, options: RoutingOptions = {}): Point[] {
  const source = positions.get(mentor), target = positions.get(apprentice);
  if (!source || !target) return [];
  const pad = 16 + lane * 6;
  const cy = 14 + AVATAR / 2;
  const sourceOffset = options.sourceOffset ?? -12, targetOffset = options.targetOffset ?? 12;
  const start = { x: source.x + NODE_W / 2 + pad, y: source.y + cy + sourceOffset };
  const end = { x: target.x + NODE_W / 2 + pad, y: target.y + cy + targetOffset };
  const rects = [...positions.values()].map(p => ({ left: p.x - NODE_W / 2 - 10, right: p.x + NODE_W / 2 + 10, top: p.y - 10, bottom: p.y + NODE_H + 10 }));
  const xs = [...new Set([start.x, end.x, ...rects.flatMap(r => [r.left - pad, r.right + pad])])].sort((a,b) => a-b);
  const ys = [...new Set([start.y, end.y, ...rects.flatMap(r => [r.top - pad, r.bottom + pad])])].sort((a,b) => a-b);
  const clear = (a: Point, b: Point) => !rects.some(r => a.y === b.y
    ? a.y > r.top && a.y < r.bottom && Math.max(a.x,b.x) > r.left && Math.min(a.x,b.x) < r.right
    : a.x > r.left && a.x < r.right && Math.max(a.y,b.y) > r.top && Math.min(a.y,b.y) < r.bottom);
  const key = (x: number, y: number) => `${x}:${y}`;
  const sx = xs.indexOf(start.x), sy = ys.indexOf(start.y), ex = xs.indexOf(end.x), ey = ys.indexOf(end.y);
  const origin = key(sx,sy), goal = key(ex,ey);
  const costs = new Map([[origin, 0]]), previous = new Map<string,string>();
  const open = [{ x: sx, y: sy, score: 0 }];
  const visited = new Set<string>();
  while (open.length) {
    open.sort((a,b) => b.score-a.score);
    const current = open.pop();
    if (!current) break;
    const k = key(current.x,current.y);
    if (visited.has(k)) continue;
    if (k === goal) break;
    visited.add(k);
    const ax = xs[current.x], ay = ys[current.y];
    if (ax === undefined || ay === undefined) continue;
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      if (dx === undefined || dy === undefined) continue;
      const nx = current.x+dx, ny = current.y+dy, bx = xs[nx], by = ys[ny];
      if (bx === undefined || by === undefined || !clear({x:ax,y:ay},{x:bx,y:by})) continue;
      const shared = (options.occupied ?? []).some(points => points.some((p,i) => {
        const q = points[i+1]; if (!q) return false;
        return ay === by && p.y === q.y && ay === p.y
          ? Math.min(Math.max(ax,bx),Math.max(p.x,q.x)) > Math.max(Math.min(ax,bx),Math.min(p.x,q.x))
          : ax === bx && p.x === q.x && ax === p.x && Math.min(Math.max(ay,by),Math.max(p.y,q.y)) > Math.max(Math.min(ay,by),Math.min(p.y,q.y));
      }));
      const prior = previous.get(k)?.split(':').map(Number);
      const turn = prior && (prior[0] === current.x ? nx !== current.x : ny !== current.y);
      const nk = key(nx,ny), cost = (costs.get(k) ?? 0)+Math.abs(bx-ax)+Math.abs(by-ay)+(shared ? 10000 : 0)+(turn ? 60 : 0);
      if (cost >= (costs.get(nk) ?? Infinity)) continue;
      costs.set(nk,cost); previous.set(nk,k);
      open.push({x:nx,y:ny,score:cost+Math.abs(bx-end.x)+Math.abs(by-end.y)});
    }
  }
  if (!costs.has(goal)) return [];
  const points: Point[] = [];
  let cursor: string | undefined = goal;
  while (cursor) {
    const [x,y] = cursor.split(':').map(Number), px = xs[x ?? -1], py = ys[y ?? -1];
    if (px !== undefined && py !== undefined) points.unshift({x:px,y:py});
    cursor = previous.get(cursor);
  }
  const reduced = points.filter((p,i) => !points[i-1] || !points[i+1] || !(points[i-1]?.x === p.x && points[i+1]?.x === p.x || points[i-1]?.y === p.y && points[i+1]?.y === p.y));
  const portX = (offset: number) => Math.sqrt(Math.max(0, (AVATAR/2+4)**2-offset**2));
  return [{x:source.x+portX(sourceOffset),y:start.y}, ...reduced, {x:target.x+portX(targetOffset),y:end.y}];
}
export function routeMentorConnections(positions: Positions, links: { mentor: string; apprentice: string }[]) {
  const sorted = [...links].sort((a,b) => `${a.mentor}~${a.apprentice}`.localeCompare(`${b.mentor}~${b.apprentice}`));
  const incident = (cat: string) => sorted.filter(l => l.mentor === cat || l.apprentice === cat);
  const offset = (cat: string, link: typeof sorted[number]) => {
    const related = incident(cat), i = related.indexOf(link);
    if (related.length === 1) return link.mentor === cat ? -12 : 12;
    const value = -26 + i * 52/(related.length-1);
    return Math.abs(value) < 6 ? 6 : value;
  };
  const routes = new Map<string,Point[]>(), occupied: Point[][] = [];
  sorted.forEach((link,lane) => {
    const points = routeMentor(positions,link.mentor,link.apprentice,lane,{
      sourceOffset: offset(link.mentor,link), targetOffset: offset(link.apprentice,link), occupied,
    });
    routes.set(`${link.mentor}~${link.apprentice}`,points); occupied.push(points);
  });
  return routes;
}
export function roundedMentorPath(points: Point[], positions: Positions = new Map()) {
  const start = points[0];
  if (!start) return '';
  let path = `M${start.x},${start.y}`;
  for (let i=1;i<points.length;i++) {
    const p = points[i], before = points[i-1], after = points[i+1];
    if (!p || !before) continue;
    if (!after) { path += ` L${p.x},${p.y}`; continue; }
    const a = Math.hypot(p.x-before.x,p.y-before.y), b = Math.hypot(after.x-p.x,after.y-p.y);
    if (!a || !b) continue;
    let radius = Math.min(120,a/2,b/2);
    // Wide quadratic bends soften each detour, but never cut through a cat.
    const unsafe = (r: number) => {
      const from = { x:p.x+(before.x-p.x)*r/a, y:p.y+(before.y-p.y)*r/a };
      const to = { x:p.x+(after.x-p.x)*r/b, y:p.y+(after.y-p.y)*r/b };
      for (let j=0;j<=24;j++) {
        const t=j/24, u=1-t, x=u*u*from.x+2*u*t*p.x+t*t*to.x, y=u*u*from.y+2*u*t*p.y+t*t*to.y;
        if ([...positions.values()].some(node => x>node.x-NODE_W/2-6 && x<node.x+NODE_W/2+6 && y>node.y-6 && y<node.y+NODE_H+6)) return true;
      }
      return false;
    };
    while (radius>8 && unsafe(radius)) radius/=2;
    path += ` L${p.x+(before.x-p.x)*radius/a},${p.y+(before.y-p.y)*radius/a} Q${p.x},${p.y} ${p.x+(after.x-p.x)*radius/b},${p.y+(after.y-p.y)*radius/b}`;
  }
  return path;
}