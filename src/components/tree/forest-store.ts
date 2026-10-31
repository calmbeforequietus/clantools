import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { loadStore, saveStore, type Store } from '@/lib/tree/ops';

type ForestStore = { value: Store | null; listeners: Set<() => void> };
type Registry = typeof globalThis & { __warriorForestStore?: ForestStore };

function browserStore(): ForestStore | undefined {
  if (typeof window === 'undefined') return undefined;
  const registry = globalThis as Registry;
  registry.__warriorForestStore ??= { value: null, listeners: new Set() };
  return registry.__warriorForestStore;
}

export const getForestSnapshot = () => browserStore()?.value ?? null;
export const getServerForestSnapshot = () => null;
export function subscribeForest(listener: () => void) {
  const state = browserStore();
  state?.listeners.add(listener);
  return () => { state?.listeners.delete(listener); };
}

export const setForestStore: Dispatch<SetStateAction<Store | null>> = update => {
  const state = browserStore();
  if (!state) return;
  const next = typeof update === 'function' ? update(state.value) : update;
  if (Object.is(next, state.value)) return;
  state.value = next;
  if (next) {
    try { saveStore(next); }
    catch { toast.error('Storage is full. Export your trees and use smaller images.'); }
  }
  state.listeners.forEach(listener => listener());
};

export function initializeForestStore() {
  const state = browserStore();
  if (state && !state.value) setForestStore(loadStore());
}