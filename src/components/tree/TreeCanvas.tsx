import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { toPng } from "html-to-image";
import { Moon, Sparkles } from "lucide-react";
import { CatAvatar } from "./CatAvatar";
import { buildIndex, type Kinship } from "@/lib/tree/kinship";
import { AVATAR, bounds, NODE_H, NODE_W, type Positions } from "@/lib/tree/layout";
import { CLAN_VAR, catName, type Cat } from "@/lib/tree/types";

export interface CanvasApi {
  fit: () => void;
  zoomBy: (f: number) => void;
  exportPng: (name: string) => Promise<void>;
}
export interface CanvasOptions {
  showMentors: boolean;
  showFoster: boolean;
  hideUnrelated: boolean;
}

const MIN = 0.15, MAX = 2.5;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
const AV_CY = 14 + AVATAR / 2; // avatar center from node top

export function TreeCanvas({
  cats,
  positions,
  focusId,
  kinship,
  options,
  onSelect,
  onZoom,
  apiRef,
  treeKey,
}: {
  cats: Cat[];
  positions: Positions;
  focusId: string | null;
  kinship: Kinship | null;
  options: CanvasOptions;
  onSelect: (id: string | null) => void;
  onZoom: (k: number) => void;
  apiRef: Ref<CanvasApi>;
  treeKey: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const moved = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: typeof view; x: number; y: number; dist?: number } | null>(null);

  useEffect(() => onZoom(view.k), [view.k, onZoom]);

  const b = useMemo(() => bounds(positions), [positions]);

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
    const k = clamp(Math.min(w / bw, (h - 80) / bh, 1.1));
    setView({ k, x: (w - bw * k) / 2 - b.minX * k, y: (h - bh * k) / 2 - b.minY * k + 20 });
  }, [b]);

  useImperativeHandle(apiRef, () => ({
    fit,
    zoomBy: (f) => {
      const el = containerRef.current!;
      zoomAt(el.clientWidth / 2, el.clientHeight / 2, viewRef.current.k * f);
    },
    exportPng: async (name) => {
      const node = worldRef.current;
      if (!node) return;
      const bw = b.maxX - b.minX, bh = b.maxY - b.minY;
      const ratio = Math.min(3, 8000 / Math.max(bw, bh));
      const url = await toPng(node, {
        width: bw,
        height: bh,
        pixelRatio: ratio,
        backgroundColor: getComputedStyle(containerRef.current!).backgroundColor,
        style: { transform: `translate(${-b.minX}px, ${-b.minY}px)`, transformOrigin: "0 0" },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/[^\w-]+/g, "_")}.png`;
      a.click();
    },
  }));

  // Fit when a tree is opened
  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeKey]);

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
    const el = containerRef.current!;
    const rect = el.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    const pts = [...pointers.current.values()];
    moved.current = false;
    if (pts.length === 1) gesture.current = { view: viewRef.current, x: pts[0].x, y: pts[0].y };
    else if (pts.length === 2) {
      const cx = (pts[0].x + pts[1].x) / 2, cy = (pts[0].y + pts[1].y) / 2;
      gesture.current = { view: viewRef.current, x: cx, y: cy, dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) };
    }
    const move = (ev: PointerEvent) => {
      if (!pointers.current.has(ev.pointerId)) return;
      pointers.current.set(ev.pointerId, { x: ev.clientX - rect.left, y: ev.clientY - rect.top });
      const g = gesture.current;
      if (!g) return;
      const ps = [...pointers.current.values()];
      if (ps.length === 1) {
        const dx = ps[0].x - g.x, dy = ps[0].y - g.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
        if (moved.current) setView({ ...g.view, x: g.view.x + dx, y: g.view.y + dy });
      } else if (ps.length >= 2 && g.dist) {
        moved.current = true;
        const cx = (ps[0].x + ps[1].x) / 2, cy = (ps[0].y + ps[1].y) / 2;
        const k = clamp(g.view.k * (Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) / g.dist));
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
        gesture.current = { view: viewRef.current, x: p.x, y: p.y };
      }
    };
    if (pts.length === 1) {
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    }
  };

  const idx = useMemo(() => buildIndex(cats), [cats]);
  const hl = kinship?.highlight;
  const isOn = (id: string) => !hl || hl.has(id);
  const visible = (id: string) => !(options.hideUnrelated && hl && !hl.has(id));

  // Edges
  const edges = useMemo(() => {
    const out: { d: string; kind: "blood" | "mate" | "foster" | "mentor"; on: boolean; key: string }[] = [];
    const seenMate = new Set<string>();
    const curve = (sx: number, sy: number, ex: number, ey: number) => {
      const my = sy + (ey - sy) / 2;
      return `M${sx},${sy} C${sx},${my} ${ex},${my} ${ex},${ey}`;
    };
    for (const c of cats) {
      const cp = positions.get(c.id);
      if (!cp || !visible(c.id)) continue;
      for (const m of idx.mates(c.id)) {
        const k = [c.id, m].sort().join("~");
        const mp = positions.get(m);
        if (seenMate.has(k) || !mp || !visible(m)) continue;
        seenMate.add(k);
        const [l, r] = cp.x < mp.x ? [cp, mp] : [mp, cp];
        const y1 = l.y + AV_CY, y2 = r.y + AV_CY;
        const d = y1 === y2
          ? `M${l.x + AVATAR / 2},${y1} H${r.x - AVATAR / 2}`
          : curve(l.x, l.y + NODE_H, r.x, r.y);
        out.push({ d, kind: "mate", on: isOn(c.id) && isOn(m), key: "m" + k });
      }
      const ps = idx.parents(c.id).filter((p) => positions.has(p) && visible(p));
      const ex = cp.x, ey = cp.y + 6;
      if (ps.length === 2 && idx.mates(ps[0]).includes(ps[1]) && positions.get(ps[0])!.y === positions.get(ps[1])!.y) {
        const a = positions.get(ps[0])!, bb = positions.get(ps[1])!;
        out.push({ d: curve((a.x + bb.x) / 2, a.y + AV_CY, ex, ey), kind: "blood", on: isOn(c.id) && isOn(ps[0]), key: "b" + c.id });
      } else {
        ps.forEach((p) => {
          const pp = positions.get(p)!;
          out.push({ d: curve(pp.x, pp.y + NODE_H - 4, ex, ey), kind: "blood", on: isOn(c.id) && isOn(p), key: "b" + c.id + p });
        });
      }
      if (options.showFoster)
        idx.fosterParents(c.id).forEach((p) => {
          const pp = positions.get(p);
          if (!pp || !visible(p)) return;
          out.push({ d: curve(pp.x + 18, pp.y + NODE_H - 4, ex + 18, ey), kind: "foster", on: isOn(c.id) && isOn(p), key: "f" + c.id + p });
        });
      if (options.showMentors)
        idx.mentors(c.id).forEach((p) => {
          const pp = positions.get(p);
          if (!pp || !visible(p)) return;
          const sx = pp.x + AVATAR / 2 + 4, sy = pp.y + AV_CY;
          const tx = cp.x + AVATAR / 2 + 4, ty = cp.y + AV_CY;
          const bend = 60 + Math.abs(tx - sx) * 0.1;
          out.push({ d: `M${sx},${sy} C${sx + bend},${sy} ${tx + bend},${ty} ${tx},${ty}`, kind: "mentor", on: isOn(c.id) && isOn(p), key: "t" + c.id + p });
        });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats, positions, idx, options, hl]);

  const stroke = { blood: "var(--edge-blood)", mate: "var(--edge-mate)", foster: "var(--edge-foster)", mentor: "var(--edge-mentor)" };
  const dash = { blood: undefined, mate: undefined, foster: "7 5", mentor: "2 5" };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden bg-canvas active:cursor-grabbing"
      style={{
        backgroundImage: "radial-gradient(var(--canvas-dot) 1.2px, transparent 1.2px)",
        backgroundSize: `${24 * view.k}px ${24 * view.k}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
      onPointerDown={onPointerDown}
      onClick={() => !moved.current && onSelect(null)}
    >
      <div
        ref={worldRef}
        className="absolute left-0 top-0"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transformOrigin: "0 0" }}
      >
        <svg
          className="pointer-events-none absolute overflow-visible"
          style={{ left: b.minX, top: b.minY }}
          width={b.maxX - b.minX}
          height={b.maxY - b.minY}
          viewBox={`${b.minX} ${b.minY} ${b.maxX - b.minX} ${b.maxY - b.minY}`}
        >
          {edges.map((e) => (
            <path
              key={e.key}
              d={e.d}
              fill="none"
              stroke={stroke[e.kind]}
              strokeWidth={e.kind === "mate" ? 3 : e.kind === "mentor" ? 2.2 : 2}
              strokeDasharray={dash[e.kind]}
              strokeLinecap="round"
              opacity={hl ? (e.on ? 0.95 : 0.12) : 0.8}
              style={{ transition: "opacity 200ms" }}
            />
          ))}
        </svg>
        {cats.map((c) => {
          const p = positions.get(c.id);
          if (!p || !visible(c.id)) return null;
          const focused = c.id === focusId;
          const tags = kinship?.labels.get(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!moved.current) onSelect(c.id);
              }}
              className="group absolute flex flex-col items-center text-center outline-none"
              style={{
                left: p.x - NODE_W / 2,
                top: p.y,
                width: NODE_W,
                height: NODE_H,
                opacity: isOn(c.id) ? 1 : 0.22,
                transition: "opacity 200ms",
              }}
            >
              {tags && (
                <span className="absolute -top-5 max-w-[170px] truncate rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-float">
                  {tags.slice(0, 2).join(" · ")}
                </span>
              )}
              {focused && (
                <span className="absolute -top-5 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">Focused</span>
              )}
              <div className="relative mt-3.5">
                <div
                  className={`rounded-full p-[3px] transition-transform group-hover:scale-105 ${focused ? "ring-4 ring-primary ring-offset-2 ring-offset-canvas" : ""}`}
                  style={{ background: CLAN_VAR[c.clan], boxShadow: "var(--shadow-float)" }}
                >
                  <CatAvatar avatar={c.avatar} className="border-2 border-card" />
                </div>
                <StatusDot status={c.status} />
              </div>
              <div className="mt-1.5 w-full truncate font-display text-[15px] font-semibold leading-tight text-foreground">{catName(c)}</div>
              <div className="mt-1 flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: CLAN_VAR[c.clan] }} />
                {c.clan} · {c.rank === "None" ? "—" : c.rank}
              </div>
            </button>
          );
        })}
      </div>
      <style>{`.rounded-full > .border-2 { width: ${AVATAR - 6}px; height: ${AVATAR - 6}px; }`}</style>
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
