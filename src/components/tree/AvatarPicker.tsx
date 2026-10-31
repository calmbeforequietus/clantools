import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PELTS } from "@/lib/tree/pelts";
import { CLANS, type Avatar } from "@/lib/tree/types";
import { CatAvatar, ClanBadge, PeltFace } from "./CatAvatar";
import { CatIconCreator } from './CatIconCreator';
import { DEFAULT_CAT_ICON } from '@/lib/tree/cat-icon';

export function AvatarPicker({ value, onChange }: { value: Avatar; onChange: (a: Avatar) => void }) {
  const [url, setUrl] = useState("");
  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { toast.error("Please choose an image under 1.5 MB."); return; }
    const r = new FileReader();
    r.onload = () => onChange({ kind: "image", src: String(r.result) });
    r.readAsDataURL(f);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" type="button" className="group relative h-auto rounded-full p-0 ring-2 ring-border transition hover:ring-primary" aria-label="Change avatar">
          <CatAvatar avatar={value} className="h-20 w-20" />
          <span className="absolute inset-x-0 bottom-0 rounded-b-full bg-foreground/60 py-0.5 text-[10px] font-semibold text-background opacity-0 transition group-hover:opacity-100">
            Change
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[80dvh] w-[22rem] overflow-y-auto" align="start">
        <Tabs defaultValue={value.kind === 'custom' ? 'creator' : 'pelts'}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="creator">Create</TabsTrigger>
            <TabsTrigger value="pelts">Pelts</TabsTrigger>
            <TabsTrigger value="clans">Badges</TabsTrigger>
            <TabsTrigger value="custom">Image</TabsTrigger>
          </TabsList>
          <TabsContent value="creator"><CatIconCreator value={value.kind === 'custom' ? value.settings : DEFAULT_CAT_ICON} onChange={settings => onChange({ kind: 'custom', settings })} /></TabsContent>
          <TabsContent value="pelts" className="grid grid-cols-5 gap-2 pt-2">
            {Object.entries(PELTS).map(([k, p]) => (
              <button key={k} type="button" title={p.label} onClick={() => onChange({ kind: "pelt", pelt: k })}
                className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-primary">
                <PeltFace pelt={k} />
              </button>
            ))}
          </TabsContent>
          <TabsContent value="clans" className="grid grid-cols-5 gap-2 pt-2">
            {CLANS.map((c) => (
              <button key={c} type="button" title={c} onClick={() => onChange({ kind: "clan", clan: c })}
                className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-primary">
                <ClanBadge clan={c} size={20} />
              </button>
            ))}
          </TabsContent>
          <TabsContent value="custom" className="space-y-3 pt-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-muted">
              <Upload size={16} /> Upload an image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <div className="flex gap-2">
              <Input placeholder="https://… image link" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Button size="sm" disabled={!url.trim()} onClick={() => onChange({ kind: "image", src: url.trim() })}>Use</Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
