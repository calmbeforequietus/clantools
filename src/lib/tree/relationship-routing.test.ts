import { expect,it } from 'vitest';
import { AVATAR,AVATAR_CY,AVATAR_TOP,computeLayout } from './layout';
import { canonCats } from './canon';
import { parentPort,relationshipPath } from './relationship-routing';
it('detours a shared parent junction around a name and role instead of drawing through them',()=>{
  const positions=new Map([['parent',{x:0,y:0}],['child',{x:0,y:280}]]);
  const path=relationshipPath({x:0,y:AVATAR_CY},{x:0,y:280+AVATAR_TOP},positions,['parent','child']);
  expect(path).not.toBe('');
  expect(path).toContain('Q');
  expect(path).toMatch(/-87/);
});
it('keeps Princess outgoing connection attached to her ring with a label-clearing detour',()=>{
  const positions=computeLayout(canonCats());
  const princess=positions.get('princess'),kit=positions.get('cloudtail');
  expect(princess).toBeDefined();expect(kit).toBeDefined();
  if(!princess||!kit) return;
  const start=parentPort(princess);
  expect(Math.hypot(start.x-princess.x,start.y-princess.y-AVATAR_CY)).toBeCloseTo(AVATAR/2);
  const path=relationshipPath(start,{x:kit.x,y:kit.y+AVATAR_TOP},positions,['princess','cloudtail']);
  expect(path).toContain('Q');
  expect(path.endsWith(`${kit.x},${kit.y+AVATAR_TOP}`)).toBe(true);
});