import { Cloud, Droplet, Feather, Footprints, House, Moon, Sparkles, TreePine, Waves, Wind, Zap } from "lucide-react";
import { ClanCrest } from "./ClanCrest";
import { CustomCatFace } from './CustomCatFace';
import { PELTS } from "@/lib/tree/pelts";
import { CLAN_VAR, type Avatar, type Clan } from "@/lib/tree/types";

export const CLAN_ICON: Record<Clan, typeof Zap> = {
  ThunderClan: Zap,
  ShadowClan: Moon,
  WindClan: Wind,
  RiverClan: Waves,
  SkyClan: Cloud,
  StarClan: Sparkles,
  "Dark Forest": TreePine,
  "Loner/Rogue": Footprints,
  Kittypet: House,
  BloodClan: Droplet,
};

export function PeltFace({ pelt }: { pelt: string }) {
  const p = PELTS[pelt] ?? PELTS["gray"];
  if (!p) return null;
  return (
    <svg viewBox="0 0 64 64" className="h-full! w-full!">
      <rect width="64" height="64" fill="var(--muted)" />
      <path d="M12 34 L16 9 L30 22 Z" fill={p.base} stroke="#1a1412" strokeWidth="0.8" strokeOpacity="0.25" />
      <path d="M52 34 L48 9 L34 22 Z" fill={p.base} stroke="#1a1412" strokeWidth="0.8" strokeOpacity="0.25" />
      <path d="M16 28 L18 14 L26 22 Z" fill={p.mark} opacity="0.55" />
      <path d="M48 28 L46 14 L38 22 Z" fill={p.mark} opacity="0.55" />
      <ellipse cx="32" cy="38" rx="21" ry="19" fill={p.base} stroke="#1a1412" strokeWidth="0.8" strokeOpacity="0.25" />
      {p.pattern === "tabby" && (
        <g stroke={p.mark} strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M32 21 V28" />
          <path d="M26 22 L28 28" />
          <path d="M38 22 L36 28" />
          <path d="M12 38 H18" />
          <path d="M13 44 H19" />
          <path d="M52 38 H46" />
          <path d="M51 44 H45" />
        </g>
      )}
      {p.pattern === "tortie" && (
        <>
          <path d="M14 34 Q20 22 30 24 Q26 34 18 44 Z" fill={p.mark} />
          <path d="M44 46 Q50 40 52 34 Q48 50 40 54 Z" fill={p.mark} />
        </>
      )}
      {p.pattern === "white" && <ellipse cx="32" cy="48" rx="11" ry="8" fill="#f4efe6" />}
      <ellipse cx="24" cy="36" rx="4" ry="4.6" fill={p.eye} />
      <ellipse cx="40" cy="36" rx="4" ry="4.6" fill={p.eye} />
      <ellipse cx="24" cy="36" rx="1.3" ry="3.4" fill="#1a1412" />
      <ellipse cx="40" cy="36" rx="1.3" ry="3.4" fill="#1a1412" />
      <path d="M29.5 44 L34.5 44 L32 47 Z" fill="#d98e8a" />
      <path d="M32 47 Q29 50 26 49 M32 47 Q35 50 38 49" stroke="#1a1412" strokeOpacity="0.45" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function ClanBadge({ clan, size = 28 }: { clan: Clan; size?: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center text-primary-foreground" style={{ background: CLAN_VAR[clan] }}>
      <ClanCrest crest={clan} className="h-3/4 w-3/4" />
    </div>
  );
}

export function CatAvatar({ avatar, className = "" }: { avatar: Avatar; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-full ${className}`}>
      {avatar.kind === 'custom' && <CustomCatFace settings={avatar.settings} />}
      {avatar.kind === "pelt" && <PeltFace pelt={avatar.pelt} />}
      {avatar.kind === "clan" && <ClanBadge clan={avatar.clan} />}
      {avatar.kind === "image" && (
        <img src={avatar.src} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" draggable={false} />
      )}
    </div>
  );
}
