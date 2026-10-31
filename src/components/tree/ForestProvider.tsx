import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { loadStore, saveStore, type Store } from '@/lib/tree/ops';

type ForestContext = { store: Store | null; setStore: React.Dispatch<React.SetStateAction<Store | null>> };
const Context = createContext<ForestContext | null>(null);
export function ForestProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => setStore(loadStore()), []);
  useEffect(() => { if (store) { try { saveStore(store); } catch { toast.error('Storage is full. Export your trees and use smaller images.'); } } }, [store]);
  return <Context.Provider value={{ store, setStore }}>{children}</Context.Provider>;
}
export function useForest() {
  const value = useContext(Context);
  if (!value) throw new Error('Forest provider missing');
  return value;
}