import { AVATAR, AVATAR_CY, NODE_H, NODE_W, type Positions } from './layout';
import type { Point } from './mentor-routing';

// Preserve the original generational curves: no global grid detours.
export function relationshipPath(start: Point, end: Point, _positions: Positions, _endpoints: string[]): string {
  const mid = start.y + (end.y - start.y) / 2;
  return `M${start.x},${start.y} C${start.x},${mid} ${end.x},${mid} ${end.x},${end.y}`;
}
export function parentPort(p: Point): Point {
  return { x: p.x - 24, y: p.y + AVATAR_CY + Math.sqrt((AVATAR / 2) ** 2 - 24 ** 2) };
}
export function parentRelationshipPath(parent: Point, end: Point): string {
  // Short, direct generational curve from the lower-left of the parent's ring.
  // Names carry canvas backplates, so no side detour is needed.
  const start = parentPort(parent);
  const mid = start.y + Math.max(30, (end.y - start.y) / 2);
  return `M${start.x},${start.y} C${start.x},${mid} ${end.x},${mid} ${end.x},${end.y}`;
}
