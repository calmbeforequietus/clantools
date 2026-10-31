import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { getForestSnapshot, getServerForestSnapshot, initializeForestStore, setForestStore, subscribeForest } from './forest-store';

export function ForestProvider({ children }: { children: ReactNode }) {
  useEffect(initializeForestStore, []);
  return children;
}
export function useForest() {
  const store = useSyncExternalStore(subscribeForest, getForestSnapshot, getServerForestSnapshot);
  useEffect(initializeForestStore, [store]);
  return { store, setStore: setForestStore };
}