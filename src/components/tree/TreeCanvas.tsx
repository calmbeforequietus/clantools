import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { toPng } from "html-to-image";
import { Baby, BoxSelect, Compass, Feather, Hand, House, Leaf, Moon, Shield, Skull, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClanCrest } from "./ClanCrest";
import { CatAvatar } from "./CatAvatar";
import { buildIndex, type Kinship } from "@/lib/tree/kinship";
import { routeMentorConnections, roundedMentorPath } from '@/lib/tree/mentor-routing';
import { parentRelationshipPath, relationshipPath } from '@/lib/tree/relationship-routing';
import { AVATAR, AVATAR_CY, AVATAR_TOP, bounds, GAP_X, GAP_Y, NODE_H, NODE_W, type Positions } from "@/lib/tree/layout";
import { CLAN_VAR, catName, type Cat, type ClanPage } from "@/lib/tree/types";
import { catsInBox, movingCatIds, translateCats, type Point } from '@/lib/tree/selection';

export interface CanvasApi {
  fit: () => void;
  zoomBy: (f: number) => void;
  exportPng: (name: string) => Promise<void>;
}
export interface CanvasOptions {
  showParents: boolean;
  showMates: boolean;
  showEras: boolean;
  showMentors: boolean;
  showFoster: boolean;
  hideUnrelated: boolean;
  spiritRealm?: boolean;
  /** Snaps manual drags to the layout lattice (cat columns × generation rows). */
  snapToGrid?: boolean;
}

const MIN = 0.15, MAX = 2.5;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
const AV_CY = AVATAR_CY;

export function TreeCanvas({
  clan,
  cats,
  positions,
  focusId,
  kinship,
  options,
  onSelect,
  onMoveCats,
  onZoom,
  apiRef,
  treeKey,
  panKey = 0,
  highlightIds,
}: {
  clan?: ClanPage | undefined;
  cats: Cat[];
  positions: Positions;
  focusId: string | null;
  kinship: Kinship | null;
  options: CanvasOptions;
  onSelect: (id: string | null) => void;
  /** Commits the complete group in one saved edit. */
  onMoveCats?: (positions: Positions) => void;
  onZoom: (k: number) => void;
  apiRef: Ref<CanvasApi>;
  treeKey: string;
  panKey?: number;
  highlightIds?: Set<string> | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [selectedEdge, setSelectedEdge] = useState<{ key: string; ids: string[] } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null);
  useEffect(() => { setSelectedEdge(null); setDragPos(null); setSelectedCats(new Set()); setSelectionBox(null); }, [treeKey]);
  useEffect(() => { setSelectedCats(ids => new Set([...ids].filter(id => cats.some(c => c.id === id)))); }, [cats]);
  const viewRef = useRef(view);
  viewRef.current = view;
  const moved = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: typeof view; x: number; y: number; dist?: number } | null>(null);
  // Manual repositioning: dragPos follows the pointer live; the drop commits it via onMoveCat.
  const [dragPos, setDragPos] = useState<Positions | null>(null);
  const dragPosRef = useRef<Positions | null>(null);
  const idx = useMemo(() => buildIndex(cats), [cats]);

  useEffect(() => onZoom(view.k), [view.k, onZoom]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setSize({ w: el.clientWidth, h: el.clientHeight });
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const b = useMemo(() => bounds(positions), [positions]);

  // While dragging, the whole mate-unit follows the pointer live, so edges and the
  // minimap read the live override instead of the committed layout.
  const livePositions = dragPos ?? positions;

  // Grab a cat to reposition it; pan-on-canvas instead of click-select is preserved for taps.
  const startCatDrag = (c: Cat) => (e: React.PointerEvent) => {
    if (!onMoveCats || e.button !== 0) return;
    const el = containerRef.current;
    const base = positions.get(c.id);
    if (!el || !base) return;
    e.stopPropagation();
    if (selectionMode && e.shiftKey) {
      setSelectedCats(ids => { const next = new Set(ids); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); return next; });
      moved.current = true;
      return;
    }
    const selection = selectedCats.has(c.id) ? selectedCats : new Set([c.id]);
    if (selectionMode || selectedCats.size) { setSelectedCats(selection); setSelectedEdge(null); onSelect(null); }
    const movingIds = movingCatIds(cats, selection);
    dragPosRef.current = null;
    const grab = {
      dx: (e.clientX - el.getBoundingClientRect().left - viewRef.current.x) / viewRef.current.k - base.x,
      dy: (e.clientY - el.getBoundingClientRect().top - viewRef.current.y) / viewRef.current.k - base.y,
    };
    const origin = { x: e.clientX, y: e.clientY };
    moved.current = false;
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) > 4) moved.current = true;
      if (!moved.current) return;
      const rect = el.getBoundingClientRect();
      const v = viewRef.current;
      const raw = {
        id: c.id,
        x: (ev.clientX - rect.left - v.x) / v.k - grab.dx,
        y: (ev.clientY - rect.top - v.y) / v.k - grab.dy,
      };
      // Fine-grained grid slots (20px) for flexible customization and clean alignment.
      const pos = options.snapToGrid ? {
        id: c.id,
        x: Math.round(raw.x / 20) * 20,
        y: Math.round(raw.y / 20) * 20,
      } : raw;
      const next = translateCats(positions, movingIds, { x: pos.x - base.x, y: pos.y - base.y });
      dragPosRef.current = next;
      setDragPos(next);
    };
    const up = (event: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const dp = dragPosRef.current;
      dragPosRef.current = null;
      setDragPos(null);
      // Commit outside of state updaters; a bare click (no movement) never commits.
      if (event.type !== 'pointercancel' && moved.current && dp) onMoveCats(new Map([...dp].filter(([id]) => movingIds.has(id))));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const zoomAt = useCallback((px: number, py: number, next: number) => {
    setView((v) => {
      const k2 = clamp(next);
      const r = k2 / v.k;
      return { k: k2, x: px - (px - v.x) * r, y: py - (py - v.y) * r };
    });
  }, []);

  const fit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const bw = b.maxX - b.minX, bh = b.maxY - b.minY;
    const k = clamp(Math.min((w - 230) / bw, (h - 140) / bh, 1.1));
    setView({ k, x: (w - bw * k) / 2 - b.minX * k, y: (h - bh * k) / 2 - b.minY * k + 20 });
  }, [b]);

  useImperativeHandle(apiRef, () => ({
    fit,
    zoomBy: (f) => {
      const el = containerRef.current;
      if (!el) return;
      zoomAt(el.clientWidth / 2, el.clientHeight / 2, viewRef.current.k * f);
    },
    exportPng: async (name) => {
      const node = worldRef.current;
      if (!node || !containerRef.current) return;
      const bw = b.maxX - b.minX, bh = b.maxY - b.minY;
      const ratio = Math.min(3, 8000 / Math.max(bw, bh));
      const url = await toPng(node, {
        width: bw,
        height: bh,
        pixelRatio: ratio,
        backgroundColor: getComputedStyle(containerRef.current).backgroundColor,
        style: { transform: `translate(${-b.minX}px, ${-b.minY}px)`, transformOrigin: "0 0" },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/[^\w-]+/g, "_")}.png`;
      a.click();
    },
  }));

  // Open near the living leader at readable scale; Fit remains a full-tree action.
  useEffect(() => {
    const open = () => {
      const el = containerRef.current;
      const leader = cats.find(c => c.clan === clan?.affiliation && c.rank === 'Leader' && c.status === 'Living');
      const target = positions.get(focusId ?? leader?.id ?? '');
      if (!el || !target) { fit(); return; }
      const k = 0.85;
      setView({ k, x: el.clientWidth / 2 - target.x * k, y: el.clientHeight * 0.43 - (target.y + NODE_H / 2) * k });
    };
    open();
    const r = requestAnimationFrame(open);
    return () => cancelAnimationFrame(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeKey, panKey]);

  // Wheel zoom (non-passive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      if (e.ctrlKey || !e.shiftKey) {
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, viewRef.current.k * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015)));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = containerRef.current;
      if (!el) return;
    if (selectionMode && e.button === 0 && e.pointerType !== 'touch') {
      e.preventDefault();
      const rect = el.getBoundingClientRect(), v = viewRef.current;
      const point = (event: { clientX: number; clientY: number }): Point => ({ x: (event.clientX - rect.left - v.x) / v.k, y: (event.clientY - rect.top - v.y) / v.k });
      const start = point(e), initial = e.shiftKey ? new Set(selectedCats) : new Set<string>();
      moved.current = false;
      setSelectedEdge(null); onSelect(null); setSelectionBox({ start, end: start });
      const move = (event: PointerEvent) => {
        if (event.pointerId !== e.pointerId) return;
        moved.current = true;
        const end = point(event);
        setSelectionBox({ start, end });
        setSelectedCats(new Set([...initial, ...catsInBox(positions, start, end).filter(visible)]));
      };
      const up = (event: PointerEvent) => {
        if (event.pointerId !== e.pointerId) return;
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        setSelectionBox(null);
        if (!moved.current) setSelectedCats(initial);
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      return;
    }
    const rect = el.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    const pts = [...pointers.current.values()];
    moved.current = false;
    const [first, second] = pts;
    if (first && !second) gesture.current = { view: viewRef.current, x: first.x, y: first.y };
    else if (first && second) {
      const cx = (first.x + second.x) / 2, cy = (first.y + second.y) / 2;
      gesture.current = { view: viewRef.current, x: cx, y: cy, dist: Math.hypot(first.x-second.x, first.y-second.y) };
    }
    const move = (ev: PointerEvent) => {
      if (!pointers.current.has(ev.pointerId)) return;
      pointers.current.set(ev.pointerId, { x: ev.clientX - rect.left, y: ev.clientY - rect.top });
      const g = gesture.current;
      if (!g) return;
      const ps = [...pointers.current.values()];
      const [first, second] = ps;
      if (first && !second) {
        const dx = first.x - g.x, dy = first.y - g.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
        if (moved.current) setView({ ...g.view, x: g.view.x + dx, y: g.view.y + dy });
      } else if (first && second && g.dist) {
        moved.current = true;
        const cx = (first.x + second.x) / 2, cy = (first.y + second.y) / 2;
        const k = clamp(g.view.k * (Math.hypot(first.x - second.x, first.y - second.y) / g.dist));
        const r = k / g.view.k;
        setView({ k, x: cx - (g.x - g.view.x) * r, y: cy - (g.y - g.view.y) * r });
      }
    };
    const up = (ev: PointerEvent) => {
      pointers.current.delete(ev.pointerId);
      if (pointers.current.size === 0) {
        gesture.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      } else {
        const p = [...pointers.current.values()][0];
        if (!p) return;
        gesture.current = { view: viewRef.current, x: p.x, y: p.y };
      }
    };
    if (pts.length === 1) {
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    }
  };

  const hl = selectedEdge ? new Set(selectedEdge.ids) : highlightIds ?? kinship?.highlight;
  const isOn = (id: string) => !hl || hl.has(id);
  const visible = (id: string) => !(options.hideUnrelated && hl && !hl.has(id));

  // Edges
  const edges = useMemo(() => {
    const positions = livePositions;
    const out: { d: string; kind: "blood" | "mate" | "foster" | "mentor"; on: boolean; key: string; ids: string[] }[] = [];
    const seenMate = new Set<string>();
    const mentorRoutes = options.showMentors ? routeMentorConnections(positions, cats.flatMap(c => visible(c.id) ? idx.mentors(c.id).filter(visible).map(p => ({ mentor:p, apprentice:c.id })) : [])) : new Map();
    const curve = (sx: number, sy: number, ex: number, ey: number, ids: string[]) => relationshipPath({x:sx,y:sy},{x:ex,y:ey},positions,ids);
    for (const c of cats) {
      const cp = positions.get(c.id);
      if (!cp || !visible(c.id)) continue;
      for (const m of options.showMates ? idx.mates(c.id) : []) {
        const k = [c.id, m].sort().join("~");
        const mp = positions.get(m);
        if (seenMate.has(k) || !mp || !visible(m)) continue;
        seenMate.add(k);
        const [l, r] = cp.x < mp.x ? [cp, mp] : [mp, cp];
        const y1 = l.y + AV_CY, y2 = r.y + AV_CY;
        const d = y1 === y2 ? `M${l.x + AVATAR / 2},${y1} H${r.x - AVATAR / 2}` : curve(l.x + AVATAR / 2, y1, r.x - AVATAR / 2, y2, [c.id,m]);
        out.push({ d, kind: "mate", on: isOn(c.id) && isOn(m), key: "m" + k, ids: [c.id,m] });
      }
      const ps = (options.showParents ? idx.parents(c.id) : []).filter((p) => positions.has(p) && visible(p));
      const ex = cp.x, ey = cp.y + AVATAR_TOP;
      const [pa, pb] = ps;
      const a = pa ? positions.get(pa) : undefined, bb = pb ? positions.get(pb) : undefined;
      if (ps.length === 2 && pa && pb && a && bb && idx.mates(pa).includes(pb)) {
        out.push({ d: curve((a.x + bb.x) / 2, (a.y + bb.y) / 2 + AV_CY, ex, ey, [pa,pb,c.id]), kind: "blood", on: isOn(c.id) && isOn(pa), key: "b" + c.id, ids: [pa,pb,c.id] });
      } else {
        ps.forEach((p) => {
          const pp = positions.get(p);
          if (!pp) return;
          out.push({ d: parentRelationshipPath(pp, {x:ex,y:ey}), kind: "blood", on: isOn(c.id) && isOn(p), key: "b" + c.id + p, ids: [p,c.id] });
        });
      }
      const fps = (options.showFoster ? idx.fosterParents(c.id) : []).filter(p => positions.has(p) && visible(p));
      const [fa, fb] = fps, fpa = fa ? positions.get(fa) : undefined, fpb = fb ? positions.get(fb) : undefined;
      const fosterY = cp.y + AV_CY - Math.sqrt((AVATAR / 2) ** 2 - 18 ** 2);
      // A foster couple raises a kit together: one family line from the pair, like parentage.
      if (fps.length === 2 && fa && fb && fpa && fpb && idx.mates(fa).includes(fb)) {
        out.push({ d: curve((fpa.x + fpb.x) / 2, (fpa.y + fpb.y) / 2 + AV_CY, ex - 18, fosterY, [fa, fb, c.id]), kind: "foster", on: isOn(c.id) && isOn(fa), key: "f" + c.id, ids: [fa, fb, c.id] });
      } else if (options.showFoster)
        fps.forEach((p) => {
          const pp = positions.get(p);
          if (!pp) return;
          out.push({ d: parentRelationshipPath(pp, {x:ex-18,y:fosterY}), kind: "foster", on: isOn(c.id) && isOn(p), key: "f" + c.id + p, ids: [p,c.id] });
        });
      if (options.showMentors)
        idx.mentors(c.id).forEach((p) => {
          const pp = positions.get(p);
          if (!pp || !visible(p)) return;
          const d = roundedMentorPath(mentorRoutes.get(`${p}~${c.id}`) ?? [], positions);
          out.push({ d, kind: "mentor", on: isOn(c.id) && isOn(p), key: "t" + c.id + p, ids: [p,c.id] });
        });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats, livePositions, idx, options, hl]);

  const stroke = { blood: "var(--edge-blood)", mate: "var(--edge-mate)", foster: "var(--edge-foster)", mentor: "var(--edge-mentor)" };
  const dash = { blood: undefined, mate: undefined, foster: "7 5", mentor: "2 5" };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${selectionMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'} touch-none select-none overflow-hidden bg-canvas`}
      style={{
        backgroundImage: "radial-gradient(var(--canvas-dot) 1.2px, transparent 1.2px)",
        backgroundSize: `${24 * view.k}px ${24 * view.k}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
      onPointerDown={onPointerDown}
      tabIndex={0}
      role="application"
      aria-label="Family tree. Arrow keys move the view, plus and minus zoom, Tab moves between cats."
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        const step = 80, el = containerRef.current;
        if (e.key === 'ArrowLeft') setView(v => ({ ...v, x: v.x + step }));
        else if (e.key === 'ArrowRight') setView(v => ({ ...v, x: v.x - step }));
        else if (e.key === 'ArrowUp') setView(v => ({ ...v, y: v.y + step }));
        else if (e.key === 'ArrowDown') setView(v => ({ ...v, y: v.y - step }));
        else if ((e.key === '+' || e.key === '=') && el) zoomAt(el.clientWidth / 2, el.clientHeight / 2, viewRef.current.k * 1.2);
        else if (e.key === '-' && el) zoomAt(el.clientWidth / 2, el.clientHeight / 2, viewRef.current.k / 1.2);
        else if (e.key === 'Escape') { setSelectedEdge(null); setSelectedCats(new Set()); setSelectionBox(null); onSelect(null); }
        else return;
        e.preventDefault();
      }}
      onClick={() => { if (!moved.current) { setSelectedEdge(null); setSelectedCats(new Set()); onSelect(null); } }}
    >
      {onMoveCats && <div className="absolute left-3 top-20 z-20 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-float" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <Button size="icon" variant={!selectionMode ? 'secondary' : 'ghost'} aria-label="Pan tool" title="Pan tool" aria-pressed={!selectionMode} onClick={() => setSelectionMode(false)}><Hand size={17} /></Button>
        <Button size="icon" variant={selectionMode ? 'secondary' : 'ghost'} aria-label="Box selection tool" title="Box selection — Shift adds cats" aria-pressed={selectionMode} onClick={() => { setSelectionMode(true); setSelectedEdge(null); onSelect(null); }}><BoxSelect size={17} /></Button>
        {selectedCats.size > 0 && <><span className="px-2 text-xs tabular-nums" role="status">{selectedCats.size} selected</span><Button size="icon" variant="ghost" aria-label="Clear cat selection" title="Clear selection" onClick={() => setSelectedCats(new Set())}><X size={16} /></Button></>}
      </div>}
      {selectedEdge && <div className="absolute left-3 top-20 z-20 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2 shadow-float" onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
        {selectedEdge.ids.map(id => { const cat=idx.byId.get(id); return cat && <Button key={id} variant="ghost" size="sm" onClick={()=>{setSelectedEdge(null);onSelect(id);}}>{catName(cat)}</Button>; })}
        <Button variant="ghost" size="icon" className="size-8" aria-label="Clear relationship highlight" onClick={()=>setSelectedEdge(null)}><X /></Button>
      </div>}
      {size.w > 0 && positions.size > 0 && <Minimap positions={livePositions} cats={cats} b={b} view={view} size={size} onJump={(x, y) => setView(v => ({ ...v, x: size.w / 2 - x * v.k, y: size.h / 2 - y * v.k }))} />}
      <div
        ref={worldRef}
        className="absolute left-0 top-0"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transformOrigin: "0 0" }}
      >
        {selectionBox && <div aria-hidden className="pointer-events-none absolute z-10 border-2 border-primary bg-primary/15" style={{ left: Math.min(selectionBox.start.x, selectionBox.end.x), top: Math.min(selectionBox.start.y, selectionBox.end.y), width: Math.abs(selectionBox.end.x - selectionBox.start.x), height: Math.abs(selectionBox.end.y - selectionBox.start.y) }} />}
        <svg
          className="pointer-events-none absolute overflow-visible"
          style={{ left: b.minX, top: b.minY }}
          width={b.maxX - b.minX}
          height={b.maxY - b.minY}
          viewBox={`${b.minX} ${b.minY} ${b.maxX - b.minX} ${b.maxY - b.minY}`}
        >
          <defs><marker id="mentor-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--edge-mentor)" /></marker></defs>
          {edges.map((e) => (
            <g key={e.key}>
            <path
              d={e.d}
              fill="none"
              stroke={stroke[e.kind]}
              strokeWidth={e.kind === 'blood' || e.kind === 'mate' ? 2.75 : 2}
              strokeDasharray={dash[e.kind]}
              markerEnd={e.kind === "mentor" ? "url(#mentor-arrow)" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={selectedEdge ? (selectedEdge.key === e.key ? 1 : 0.12) : hl ? (e.on ? 0.95 : 0.1) : e.kind === "mentor" ? 0.9 : e.kind === "foster" ? 0.45 : 0.85}
              style={{ transition: "opacity 200ms" }}
            />
            <path d={e.d} fill="none" stroke="transparent" strokeWidth={18} className="pointer-events-auto cursor-pointer outline-none" style={{pointerEvents:'stroke'}}
              role="button" tabIndex={0} aria-label={`${e.kind === 'mentor' ? 'Mentor' : e.kind === 'mate' ? 'Mates' : e.kind === 'foster' ? 'Foster' : 'Parentage'} connection: ${e.ids.map(id=>{const cat=idx.byId.get(id);return cat ? catName(cat) : 'Unknown cat';}).join(' and ')}`}
              aria-pressed={selectedEdge?.key === e.key}
              onPointerDown={event=>event.stopPropagation()}
              onClick={event=>{event.stopPropagation();onSelect(null);setSelectedEdge({key:e.key,ids:e.ids});}}
              onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(null);setSelectedEdge({key:e.key,ids:e.ids});}}}
            />
            </g>
          ))}
        </svg>
        {cats.map((c) => {
          const p = livePositions.get(c.id);
          if (!p || !visible(c.id)) return null;
          const focused = selectedEdge ? selectedEdge.ids.includes(c.id) : c.id === focusId;
          const tags = selectedEdge ? undefined : kinship?.labels.get(c.id);
          const tiara = getCatTiara(c);
          return (
            <Button variant="ghost"
              key={c.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!moved.current && !selectionMode && !selectedCats.size) { setSelectedEdge(null); onSelect(c.id); }
              }}
              aria-label={`View ${catName(c)}`}
              data-relationship-highlighted={selectedEdge?.ids.includes(c.id) ?? false}
              data-cat-selected={selectedCats.has(c.id)}
              onPointerDown={onMoveCats ? startCatDrag(c) : undefined}
              className={`group absolute flex flex-col !justify-start gap-0 rounded-md p-0 items-center whitespace-normal text-center hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring ${onMoveCats ? "cursor-move" : ""} ${selectedCats.has(c.id) ? 'ring-2 ring-primary bg-primary/10' : ''}`}
              style={{
                left: p.x - NODE_W / 2,
                top: p.y,
                width: NODE_W,
                height: NODE_H,
                opacity: selectedCats.has(c.id) || isOn(c.id) ? 1 : 0.22,
                transition: "opacity 200ms",
              }}
            >
              {tags && (
                <span className="absolute -top-5 max-w-[170px] truncate rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-float">
                  {tags.slice(0, 2).join(" · ")}
                </span>
              )}
              {focused && !selectedEdge && (
                <span className="absolute -top-5 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">Focused</span>
              )}
              <div className={`relative mt-3.5 shrink-0 ${options.spiritRealm && c.status === "StarClan" ? "spirit-starclan" : options.spiritRealm && c.status === "Dark Forest" ? "spirit-darkforest" : ""}`}>
                <div
                  className={`rounded-full p-[3px] transition-transform group-hover:scale-105 ${focused ? "ring-4 ring-primary ring-offset-2 ring-offset-canvas" : ""}`}
                  style={{ background: c.gender === "She-cat" ? "var(--gender-she)" : c.gender === "Tom" ? "var(--gender-tom)" : "var(--gender-other)", boxShadow: "var(--shadow-float)" }}
                >
                  <CatAvatar avatar={c.avatar} className="h-[62px] w-[62px] border-2 border-card" />
                </div>
                {options.spiritRealm && c.status === "Dark Forest" && <span className="spirit-shadow" aria-hidden />}
                {options.spiritRealm && c.status === "StarClan" && starsFor(c.id).map((st, i) => <svg key={i} className="spirit-star" aria-hidden viewBox="0 0 10 10" width={st.size} height={st.size} style={{ left: st.x - st.size / 2, top: st.y - st.size / 2, opacity: st.o }}><path d={st.glyph === "✦" ? "M5 0L6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" : "M5 1L5.8 4.2 9 5 5.8 5.8 5 9 4.2 5.8 1 5 4.2 4.2Z"} fill="currentColor" /></svg>)}
                {tiara && (
                  <span
                    title={tiara.label}
                    aria-label={tiara.label}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-card shadow-md transition-transform group-hover:scale-110"
                    style={{
                      color: tiara.color,
                      borderColor: `color-mix(in oklab, ${tiara.color} 40%, var(--border))`,
                      backgroundColor: `color-mix(in oklab, ${tiara.color} 12%, var(--card))`,
                    }}
                  >
                    <tiara.icon size={16} className={`shrink-0 stroke-[2.4] ${tiara.fill ? "fill-current" : ""}`} />
                  </span>
                )}
                <StatusDot status={c.status} />
              </div>
              <div className={`mt-1.5 w-full shrink-0 truncate font-display text-[15px] font-semibold leading-tight ${c.status === 'Living' ? 'text-foreground' : 'deceased-name'}`}><span className="bg-canvas px-1">{catName(c)}</span></div>
              {clan && c.clan !== clan.affiliation && !['Kittypet', 'Loner', 'Rogue'].includes(c.clan) && <span title={c.clan} className="absolute -top-1 right-4 flex h-9 w-9 items-center justify-center" style={{ color: CLAN_VAR[c.clan] ?? clan.color }}><ClanCrest crest={c.clan} className="h-9 w-9" /></span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Cat["status"] }) {
  const bg = status === "Living" ? "var(--status-living)" : status === "StarClan" ? "var(--status-starclan)" : "var(--status-darkforest)";
  return (
    <span
      title={status}
      className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-primary-foreground"
      style={{ background: bg }}
    >
      {status === "StarClan" && <Sparkles size={10} />}
      {status === "Dark Forest" && <Moon size={10} />}
    </span>
  );
}

interface CatTiara {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  color: string;
  fill?: boolean;
}

function getCatTiara(c: Cat): CatTiara | null {
  if (c.rank === 'Leader') return { icon: Star, label: 'Leader', color: 'var(--tiara-leader)', fill: true };
  if (c.rank === 'Deputy') return { icon: Shield, label: 'Deputy', color: 'var(--tiara-deputy)' };
  if (c.rank === 'Medicine Cat') return { icon: Leaf, label: 'Medicine Cat', color: 'var(--tiara-medcat)', fill: true };
  if (c.rank === 'Kit') return { icon: Baby, label: 'Kit', color: 'var(--tiara-kit)' };
  if (c.rank === 'Elder') return { icon: Feather, label: 'Elder', color: 'var(--tiara-elder)' };
  if (c.clan === 'Kittypet') return { icon: House, label: 'Kittypet', color: 'var(--tiara-kittypet)' };
  if (c.clan === 'Loner') return { icon: Compass, label: 'Loner', color: 'var(--tiara-loner)' };
  if (c.clan === 'Rogue') return { icon: Skull, label: 'Rogue', color: 'var(--tiara-rogue)' };
  return null;
}

function Minimap({ positions, cats, b, view, size, onJump }: { positions: Positions; cats: Cat[]; b: ReturnType<typeof bounds>; view: { x: number; y: number; k: number }; size: { w: number; h: number }; onJump: (x: number, y: number) => void }) {
  const W = 180, H = 120, bw = b.maxX - b.minX, bh = b.maxY - b.minY;
  const s = Math.min(W / bw, H / bh), ox = (W - bw * s) / 2, oy = (H - bh * s) / 2;
  const toMap = (x: number, y: number) => [ox + (x - b.minX) * s, oy + (y - b.minY) * s] as const;
  const [vx, vy] = toMap(-view.x / view.k, -view.y / view.k);
  const jump = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onJump((e.clientX - r.left - ox) / s + b.minX, (e.clientY - r.top - oy) / s + b.minY);
  };
  return <div className="absolute bottom-16 left-3 z-20 hidden rounded-xl border border-border bg-card/95 p-1.5 shadow-float backdrop-blur sm:block" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
    <svg width={W} height={H} role="img" aria-label="Tree overview. Click to jump." className="cursor-pointer" onPointerDown={e => { jump(e); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (e.buttons) jump(e); }}>
      {cats.map(c => { const p = positions.get(c.id); if (!p) return null; const [x, y] = toMap(p.x, p.y + AVATAR_CY);
        return <circle key={c.id} cx={x} cy={y} r={2.2} fill={c.gender === 'She-cat' ? 'var(--gender-she)' : c.gender === 'Tom' ? 'var(--gender-tom)' : 'var(--gender-other)'} />; })}
      <rect x={vx} y={vy} width={size.w / view.k * s} height={size.h / view.k * s} fill="var(--primary)" fillOpacity={0.08} stroke="var(--primary)" strokeWidth={1.2} rx={2} />
    </svg>
  </div>;
}

/** Six fixed stars around the rim of a 68px avatar, clear of the eyes and face. */
const STARS = [
  { x: 6, y: 10, size: 12, o: 0.95, glyph: '✦' }, { x: 62, y: 8, size: 10, o: 0.85, glyph: '✧' },
  { x: -2, y: 40, size: 9, o: 0.8, glyph: '✧' }, { x: 70, y: 46, size: 12, o: 0.95, glyph: '✦' },
  { x: 16, y: 66, size: 8, o: 0.75, glyph: '✧' }, { x: 34, y: -6, size: 9, o: 0.85, glyph: '✦' },
];
function starsFor(_id: string) { return STARS; }
