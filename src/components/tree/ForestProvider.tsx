import { useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { loadStore, saveStore, type Store } from '@/lib/tree/ops';

import { getForestContext } from './forest-context';
export function ForestProvider({ children }: { children: ReactNode }) {
  const ForestContext = getForestContext();
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => setStore(loadStore()), []);
  useEffect(() => { if (store) { try { saveStore(store); } catch { toast.error('Storage is full. Export your trees and use smaller images.'); } } }, [store]);
  return <ForestContext.Provider value={{ store, setStore }}>{children}</ForestContext.Provider>;
}
export function useForest() {
  const value = useContext(getForestContext());
  if (!value) throw new Error('Forest provider missing');
  return value;
}