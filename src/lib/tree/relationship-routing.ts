import { AVATAR, AVATAR_CY, NODE_W, type Positions } from './layout';
import type { Point } from './mentor-routing';

export interface Obstacle { left: number; right: number; top: number; bottom: number }
export function relationshipObstacles(positions: Positions, endpoints: string[] = []): Obstacle[] {
  return [...positions].flatMap(([id,p]) => [
    // Name, role, foreign crest, status, and focus/kinship label clearance.
    {left:p.x-NODE_W/2-5,right:p.x+NODE_W/2+5,top:p.y+83,bottom:p.y+132},
    {left:p.x+17,right:p.x+60,top:p.y-8,bottom:p.y+34},
    {left:p.x+19,right:p.x+46,top:p.y+65,bottom:p.y+91},
    {left:p.x-76,right:p.x+76,top:p.y-27,bottom:p.y-3},
    ...(!endpoints.includes(id) ? [{left:p.x-AVATAR/2-5,right:p.x+AVATAR/2+5,top:p.y+10,bottom:p.y+83}] : []),
  ]);
}
export function pointBlocked(p: Point, obstacles: Obstacle[]) {
  return obstacles.some(r=>p.x>r.left && p.x<r.right && p.y>r.top && p.y<r.bottom);
}
const segmentClear = (a: Point,b: Point,obstacles: Obstacle[]) => {
  const steps = Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2);
  for(let i=0;i<=steps;i++) {
    const t=steps ? i/steps : 0;
    if(pointBlocked({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},obstacles)) return false;
  }
  return true;
};
export function relationshipPath(start: Point, end: Point, positions: Positions, endpoints: string[]): string {
  const obstacles = relationshipObstacles(positions,endpoints);
  const mid = (start.y+end.y)/2;
  const c1={x:start.x,y:mid},c2={x:end.x,y:mid};
  const cubicSafe = Array.from({length:201},(_,i)=>{
    const t=i/200,u=1-t;
    return {x:u**3*start.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t**3*end.x,y:u**3*start.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t**3*end.y};
  }).every(p=>!pointBlocked(p,obstacles));
  if(cubicSafe) return `M${start.x},${start.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`;
  const xs=[...new Set([start.x,end.x,...obstacles.flatMap(r=>[r.left-12,r.right+12])])].sort((a,b)=>a-b);
  const ys=[...new Set([start.y,end.y,...obstacles.flatMap(r=>[r.top-12,r.bottom+12])])].sort((a,b)=>a-b);
  const key=(x:number,y:number)=>`${x}:${y}`;
  const origin=key(xs.indexOf(start.x),ys.indexOf(start.y)),goal=key(xs.indexOf(end.x),ys.indexOf(end.y));
  const costs=new Map([[origin,0]]),prev=new Map<string,string>();
  const open=[{x:xs.indexOf(start.x),y:ys.indexOf(start.y),score:0}],visited=new Set<string>();
  while(open.length) {
    open.sort((a,b)=>b.score-a.score);
    const c=open.pop(); if(!c) break;
    const k=key(c.x,c.y); if(visited.has(k)) continue; if(k===goal) break;
    visited.add(k);
    const ax=xs[c.x],ay=ys[c.y]; if(ax===undefined||ay===undefined) continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      if(dx===undefined||dy===undefined) continue;
      const nx=c.x+dx,ny=c.y+dy,bx=xs[nx],by=ys[ny];
      if(bx===undefined||by===undefined||!segmentClear({x:ax,y:ay},{x:bx,y:by},obstacles)) continue;
      const prior=prev.get(k)?.split(':').map(Number);
      const turn=prior && (prior[0]===c.x ? nx!==c.x : ny!==c.y);
      const nk=key(nx,ny),cost=(costs.get(k)??0)+Math.abs(bx-ax)+Math.abs(by-ay)+(turn?100:0);
      if(cost>=(costs.get(nk)??Infinity)) continue;
      costs.set(nk,cost);prev.set(nk,k);
      open.push({x:nx,y:ny,score:cost+Math.abs(bx-end.x)+Math.abs(by-end.y)});
    }
  }
  if(!costs.has(goal)) return '';
  const points:Point[]=[];
  let cursor:string|undefined=goal;
  while(cursor) {
    const [ix,iy]=cursor.split(':').map(Number),x=xs[ix??-1],y=ys[iy??-1];
    if(x!==undefined&&y!==undefined) points.unshift({x,y});
    cursor=prev.get(cursor);
  }
  const reduced=points.filter((p,i)=>!points[i-1]||!points[i+1]||!(points[i-1]?.x===p.x&&points[i+1]?.x===p.x||points[i-1]?.y===p.y&&points[i+1]?.y===p.y));
  let path=`M${start.x},${start.y}`;
  for(let i=1;i<reduced.length;i++) {
    const p=reduced[i],a=reduced[i-1],b=reduced[i+1]; if(!p||!a) continue;
    if(!b) {path+=` L${p.x},${p.y}`;continue;}
    const da=Math.hypot(p.x-a.x,p.y-a.y),db=Math.hypot(b.x-p.x,b.y-p.y);
    let radius=Math.min(120,da/2,db/2);
    const ends=(r:number)=>[{x:p.x+(a.x-p.x)*r/da,y:p.y+(a.y-p.y)*r/da},{x:p.x+(b.x-p.x)*r/db,y:p.y+(b.y-p.y)*r/db}];
    while(radius>0.5) {
      const [from,to]=ends(radius); if(!from||!to) break;
      const safe=Array.from({length:51},(_,j)=>{const t=j/50,u=1-t;return {x:u*u*from.x+2*u*t*p.x+t*t*to.x,y:u*u*from.y+2*u*t*p.y+t*t*to.y};}).every(q=>!pointBlocked(q,obstacles));
      if(safe) break; radius/=2;
    }
    const [from,to]=ends(radius);if(!from||!to) continue;
    path+=` L${from.x},${from.y} Q${p.x},${p.y} ${to.x},${to.y}`;
  }
  return path;
}
export function parentPort(p:Point):Point {
  return {x:p.x-24,y:p.y+AVATAR_CY+Math.sqrt((AVATAR/2)**2-24**2)};
}