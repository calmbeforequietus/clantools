import { createContext, type Context, type Dispatch, type SetStateAction } from 'react';
import type { Store } from '@/lib/tree/ops';

export type ForestContextValue = { store: Store | null; setStore: Dispatch<SetStateAction<Store | null>> };

const serverContext = createContext<ForestContextValue | null>(null);
type ForestRegistry = typeof globalThis & {
  __warriorForestContext?: Context<ForestContextValue | null>;
};

// Timestamped preview imports may coexist: hot.data belongs to a module URL,
// not the browser. Resolve one context per browser even across module copies.
// Only the context identity is shared; saved state remains in React's provider.
export function getForestContext(): Context<ForestContextValue | null> {
  if (typeof window === 'undefined') return serverContext;
  const registry = globalThis as ForestRegistry;
  registry.__warriorForestContext ??= createContext<ForestContextValue | null>(null);
  return registry.__warriorForestContext;
}