import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ForestProvider, useForest } from './ForestProvider';
import { TreeCanvas } from './TreeCanvas';
import { canonCats } from '@/lib/tree/canon';
import { computeLayout } from '@/lib/tree/layout';

afterEach(() => { cleanup(); localStorage.clear(); });

it('shares saved state across separately evaluated preview modules', async () => {
  const original = await import('./forest-store');
  original.initializeForestStore();
  const first = original.getForestSnapshot();
  vi.resetModules();
  const refreshed = await import('./forest-store');
  expect(refreshed.getForestSnapshot()).toBe(first);
});

it('loads saved trees without any ancestor provider', async () => {
  function OrphanReader() {
    const { store } = useForest();
    return <p>{store?.trees[0]?.name ?? 'Loading'}</p>;
  }
  render(<OrphanReader />);
  await waitFor(() => expect(screen.getByText("Firestar's Lineage")).toBeInTheDocument());
});

it('keeps the saved store available when provider children update', async () => {
  function Reader({ revision }: { revision: number }) {
    const { store } = useForest();
    return <p>{store ? `${store.clans.length}:${revision}` : 'Loading'}</p>;
  }
  const view = render(<ForestProvider><Reader revision={1} /></ForestProvider>);
  await waitFor(() => expect(screen.getByText('4:1')).toBeInTheDocument());
  view.rerender(<ForestProvider><Reader revision={2} /></ForestProvider>);
  expect(screen.getByText('4:2')).toBeInTheDocument();
});

it('renders a legacy canvas without Clan metadata while eras are enabled', () => {
  const cats = canonCats();
  render(<TreeCanvas cats={cats} positions={computeLayout(cats)} focusId={null} kinship={null}
    options={{ showParents: true, showMates: true, showFoster: false, showMentors: false, showEras: true, hideUnrelated: false }}
    onSelect={vi.fn()} onZoom={vi.fn()} apiRef={{ current: null }} treeKey="legacy" />);
  expect(screen.getByRole('button', { name: 'View Firestar' })).toBeInTheDocument();
});
it('selecting a mentor connection highlights exactly its two cats and can be cleared', () => {
  const cats = canonCats();
  render(<TreeCanvas cats={cats} positions={computeLayout(cats)} focusId={null} kinship={null}
    options={{showParents:true,showMates:true,showFoster:false,showMentors:true,showEras:false,hideUnrelated:false}}
    onSelect={vi.fn()} onZoom={vi.fn()} apiRef={{current:null}} treeKey="selection" />);
  fireEvent.click(screen.getByRole('button',{name:'Mentor connection: Firestar and Cloudtail'}));
  expect(screen.getByRole('button',{name:'View Firestar'})).toHaveAttribute('data-relationship-highlighted','true');
  expect(screen.getByRole('button',{name:'View Cloudtail'})).toHaveAttribute('data-relationship-highlighted','true');
  expect(screen.getByRole('button',{name:'View Sandstorm'})).toHaveAttribute('data-relationship-highlighted','false');
  fireEvent.click(screen.getByRole('button',{name:'Clear relationship highlight'}));
  expect(screen.getByRole('button',{name:'View Firestar'})).toHaveAttribute('data-relationship-highlighted','false');
});