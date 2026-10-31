import { toPng } from 'html-to-image';
import { ClipboardCopy, Download, ImageDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { allegiancesText } from '@/lib/tree/allegiances-export';
import type { Cat } from '@/lib/tree/types';

const safe = (s: string) => s.replace(/[^\w-]+/g, '_');

export function AllegiancesExport({ clanName, cats, targetId }: { clanName: string; cats: Cat[]; targetId: string }) {
  const copy = async (md: boolean) => {
    try { await navigator.clipboard.writeText(allegiancesText(clanName, cats, md)); toast.success(md ? 'Copied for Discord / AO3' : 'Copied as plain text'); }
    catch { toast.error("Couldn't copy. Try downloading the text file instead."); }
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([allegiancesText(clanName, cats)], { type: 'text/plain' }));
    a.download = `${safe(clanName)}_allegiances.txt`; a.click(); URL.revokeObjectURL(a.href);
  };
  const image = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    try {
      const url = await toPng(el, { pixelRatio: 2, backgroundColor: getComputedStyle(document.body).backgroundColor, style: { padding: '32px' } });
      const a = document.createElement('a'); a.href = url; a.download = `${safe(clanName)}_allegiances.png`; a.click();
    } catch { toast.error("Couldn't render the image."); }
  };
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={!cats.length}><Share2 />Export</Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => copy(false)}><ClipboardCopy />Copy as plain text</DropdownMenuItem>
      <DropdownMenuItem onClick={() => copy(true)}><ClipboardCopy />Copy for Discord / AO3</DropdownMenuItem>
      <DropdownMenuItem onClick={download}><Download />Download text file</DropdownMenuItem>
      <DropdownMenuItem onClick={image}><ImageDown />Download image</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
