import { createContext, type Context, type Dispatch, type SetStateAction } from 'react';
import type { Store } from '@/lib/tree/ops';

export type ForestContextValue = { store: Store | null; setStore: Dispatch<SetStateAction<Store | null>> };

// Keep the context identity when Vite updates the provider independently from
// route chunks. A mounted provider and refreshed consumer must use one context.
const cached: Context<ForestContextValue | null> | undefined = import.meta.hot?.data?.['forestContext'];
export const ForestContext = cached ?? createContext<ForestContextValue | null>(null);
if (import.meta.hot?.data) import.meta.hot.data['forestContext'] = ForestContext;