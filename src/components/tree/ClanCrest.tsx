import { Cloud, Droplet, Feather, Fish, Flame, Flower2, House, Leaf, Mountain, PawPrint, Snowflake, Sun } from 'lucide-react';
import thunder from '@/assets/thunder.png.asset.json';
import shadow from '@/assets/shadow.png.asset.json';
import star from '@/assets/star.png.asset.json';
import river from '@/assets/river.png.asset.json';
import wind from '@/assets/wind.png.asset.json';
import { CREST_PATHS } from '@/lib/tree/crest-paths';

const images: Record<string, string> = { ThunderClan: thunder.url, ShadowClan: shadow.url, StarClan: star.url, RiverClan: river.url, WindClan: wind.url };
const symbols: Record<string, typeof Leaf> = { SkyClan: Cloud, BloodClan: Droplet, Kittypet: House, Leaf, Feather, Flame, Mountain, Flower: Flower2, Fish, Sun, Snow: Snowflake, Paw: PawPrint };
export function ClanCrest({ crest, className = '' }: { crest: string; className?: string }) {
  const image = images[crest];
  const path = CREST_PATHS[crest];
  if (path) return <svg viewBox="0 0 64 64" className={`clan-symbol ${className}`} aria-hidden><path d={path} fill="currentColor" fillRule="evenodd" /></svg>;
  if (image) return <img src={image} alt="Clan crest" className={className} />;
  if (/^(data:image\/|https?:\/\/)/.test(crest)) return <img src={crest} alt="Clan crest" className={`object-contain ${className}`} />;
  const Icon = symbols[crest] ?? PawPrint;
  if (crest === 'Kittypet') return <Icon className={`clan-symbol ${className}`} aria-hidden />;
  return <svg viewBox="0 0 64 64" className={`clan-symbol ${className}`} aria-hidden><path d="M5 60V3L22 18H42L59 3V60Z" fill="currentColor" /><g transform="translate(18 25) scale(1.17)" className="text-background"><Icon width="24" height="24" strokeWidth={2.2} /></g></svg>;
}