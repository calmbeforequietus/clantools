import { AVATAR, NODE_H, NODE_W, type Positions } from './layout';
export interface Point { x: number; y: number }
export function routeMentor(positions: Positions, mentor: string, apprentice: string, lane = 0): Point[] {
  const source = positions.get(mentor), target = positions.get(apprentice);
  if (!source || !target) return [];
  const pad = 16 + lane * 6;
  const cy = 14 + AVATAR / 2;
  const start = { x: source.x + NODE_W / 2 + pad, y: source.y + cy };
  const end = { x: target.x + NODE_W / 2 + pad, y: target.y + cy };
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
      const nk = key(nx,ny), cost = (costs.get(k) ?? 0)+Math.abs(bx-ax)+Math.abs(by-ay);
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
  return [{x:source.x+AVATAR/2+4,y:start.y}, ...reduced, {x:target.x+AVATAR/2+4,y:end.y}];
}
export function roundedMentorPath(points: Point[]) {
  const start = points[0];
  if (!start) return '';
  let path = `M${start.x},${start.y}`;
  for (let i=1;i<points.length;i++) {
    const p = points[i], before = points[i-1], after = points[i+1];
    if (!p || !before) continue;
    if (!after) { path += ` L${p.x},${p.y}`; continue; }
    const a = Math.hypot(p.x-before.x,p.y-before.y), b = Math.hypot(after.x-p.x,after.y-p.y), radius = Math.min(12,a/2,b/2);
    if (!a || !b) continue;
    path += ` L${p.x+(before.x-p.x)*radius/a},${p.y+(before.y-p.y)*radius/a} Q${p.x},${p.y} ${p.x+(after.x-p.x)*radius/b},${p.y+(after.y-p.y)*radius/b}`;
  }
  return path;
}