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
  const start = parentPort(parent);
  const side = parent.x - NODE_W / 2 - 12;
  const below = parent.y + NODE_H;
  const mid = below + (end.y - below) / 2;
  // One short local bend clears the parent's own name/role, then rejoins the
  // original smooth generational curve; never follows a global grid lane.
  return `M${start.x},${start.y} C${side},${start.y + 16} ${side},${below - 24} ${side},${below} C${side},${mid} ${end.x},${mid} ${end.x},${end.y}`;
}
