import { Cloud, Droplet, Feather, Fish, Flame, Flower2, Leaf, Mountain, PawPrint, Snowflake, Sun } from 'lucide-react';
import thunder from '@/assets/thunder.png.asset.json';
import shadow from '@/assets/shadow.png.asset.json';
import star from '@/assets/star.png.asset.json';
import river from '@/assets/river.png.asset.json';
import wind from '@/assets/wind.png.asset.json';

const images: Record<string, string> = { ThunderClan: thunder.url, ShadowClan: shadow.url, StarClan: star.url, RiverClan: river.url, WindClan: wind.url };
const symbols: Record<string, typeof Leaf> = { SkyClan: Cloud, BloodClan: Droplet, Leaf, Feather, Flame, Mountain, Flower: Flower2, Fish, Sun, Snow: Snowflake, Paw: PawPrint };
export function ClanCrest({ crest, className = '' }: { crest: string; className?: string }) {
  const image = images[crest];
  if (image) return <span className={`clan-crest ${className}`} style={{ maskImage: `url("${image}")`, WebkitMaskImage: `url("${image}")` }} aria-hidden />;
  if (/^(data:image\/|https?:\/\/)/.test(crest)) return <img src={crest} alt="Clan crest" className={`object-contain ${className}`} />;
  const Icon = symbols[crest] ?? PawPrint;
  return <span className={`relative inline-flex items-center justify-center ${className}`}><svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" fill="currentColor"><path d="M5 60V3L22 18H42L59 3V60Z" /></svg><Icon className="relative h-1/2 w-1/2 text-card" strokeWidth={2.2} /></span>;
}