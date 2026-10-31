import { useRef, useState } from 'react';
import { DatabaseBackup, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { makeBackup, parseBackup, type Store } from '@/lib/tree/ops';
import { useForest } from './ForestProvider';

export function BackupControls() {
  const { store, setStore } = useForest();
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Store | null>(null);
  const download = () => {
    if (!store) return;
    const blob = new Blob([JSON.stringify(makeBackup(store), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clantools-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    toast.success('Backup downloaded');
  };
  const read = async (f?: File) => {
    if (!f) return;
    try {
      const s = parseBackup(JSON.parse(await f.text()));
      if (!s) throw new Error();
      setPending(s);
    } catch { toast.error("That file isn't a Clantools backup."); }
  };
  return <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
    <span>Your saves live only in this browser.</span>
    <Button variant="outline" size="sm" onClick={download}><DatabaseBackup />Back up everything</Button>
    <Button variant="ghost" size="sm" onClick={() => file.current?.click()}><FileUp />Restore backup</Button>
    <input ref={file} type="file" accept="application/json,.json" className="hidden" aria-label="Backup file" onChange={e => { read(e.target.files?.[0]); e.target.value = ''; }} />
    {pending && <Dialog open onOpenChange={v => !v && setPending(null)}><DialogContent>
      <DialogHeader><DialogTitle>Replace everything with this backup?</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">This backup has {pending.clans.length} Clan{pending.clans.length === 1 ? '' : 's'} and {pending.trees.length} lineage{pending.trees.length === 1 ? '' : 's'}. All Clans, lineages, lore and maps currently saved in this browser will be replaced and cannot be recovered unless you back them up first.</p>
      <DialogFooter><Button variant="outline" onClick={() => setPending(null)}>Cancel</Button><Button variant="destructive" onClick={() => { setStore(pending); setPending(null); toast.success('Backup restored'); }}>Replace and restore</Button></DialogFooter>
    </DialogContent></Dialog>}
  </div>;
}
