import { expect,it } from 'vitest';
import { AVATAR,AVATAR_CY,AVATAR_TOP,computeLayout } from './layout';
import { canonCats } from './canon';
import { parentPort,parentRelationshipPath,relationshipPath } from './relationship-routing';
it('preserves the original smooth shared-parent curve without long grid detours',()=>{
  const positions=new Map([['parent',{x:0,y:0}],['child',{x:0,y:280}]]);
  const path=relationshipPath({x:0,y:AVATAR_CY},{x:0,y:280+AVATAR_TOP},positions,['parent','child']);
  expect(path).not.toBe('');
  expect(path).toBe('M0,48 C0,171 0,171 0,294');
});
it('keeps Princess outgoing connection attached to her ring with a label-clearing detour',()=>{
  const positions=computeLayout(canonCats());
  const princess=positions.get('princess'),kit=positions.get('cloudtail');
  expect(princess).toBeDefined();expect(kit).toBeDefined();
  if(!princess||!kit) return;
  const start=parentPort(princess);
  expect(Math.hypot(start.x-princess.x,start.y-princess.y-AVATAR_CY)).toBeCloseTo(AVATAR/2);
  const path=parentRelationshipPath(princess,{x:kit.x,y:kit.y+AVATAR_TOP});
  expect(path.split(' C')).toHaveLength(3);
  expect(path.endsWith(`${kit.x},${kit.y+AVATAR_TOP}`)).toBe(true);
});
it('keeps a foster connection visible by approaching opposite the foreign Clan crest',()=>{
  const positions=computeLayout(canonCats());
  const parent=positions.get('squirrelflight'),kit=positions.get('jayfeather');
  expect(parent).toBeDefined();expect(kit).toBeDefined();
  if(!parent||!kit) return;
  const end={x:kit.x-18,y:kit.y+AVATAR_CY-Math.sqrt((AVATAR/2)**2-18**2)};
  const path=parentRelationshipPath(parent,end);
  expect(path).not.toBe('');
  expect(path.endsWith(`${end.x},${end.y}`)).toBe(true);
});