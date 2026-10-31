import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ForestProvider, useForest } from './ForestProvider';
import { TreeCanvas } from './TreeCanvas';
import { canonCats } from '@/lib/tree/canon';
import { AVATAR, AVATAR_CY, AVATAR_TOP, computeLayout } from '@/lib/tree/layout';

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
it('connects Princess parentage to the top of her avatar, not above it', () => {
  const cats = canonCats(), positions = computeLayout(cats);
  render(<TreeCanvas cats={cats} positions={positions} focusId={null} kinship={null}
    options={{showParents:true,showMates:true,showFoster:false,showMentors:false,showEras:false,hideUnrelated:false}}
    onSelect={vi.fn()} onZoom={vi.fn()} apiRef={{current:null}} treeKey="princess-parentage" />);
  const princess = positions.get('princess');
  expect(princess).toBeDefined();
  if (!princess) return;
  const path = screen.getByRole('button',{name:'Parentage connection: Jake and Nutmeg and Princess'}).getAttribute('d');
  expect(path?.endsWith(`${princess.x},${princess.y+AVATAR_TOP}`)).toBe(true);
});
it('starts Princess’s outgoing parentage at her avatar instead of below her role symbol', () => {
  const cats = canonCats(), positions = computeLayout(cats);
  render(<TreeCanvas cats={cats} positions={positions} focusId={null} kinship={null}
    options={{showParents:true,showMates:true,showFoster:true,showMentors:false,showEras:false,hideUnrelated:false}}
    onSelect={vi.fn()} onZoom={vi.fn()} apiRef={{current:null}} treeKey="princess-outgoing" />);
  const princess = positions.get('princess');
  expect(princess).toBeDefined();
  if (!princess) return;
  const path = screen.getByRole('button',{name:'Parentage connection: Princess and Cloudtail'}).getAttribute('d') ?? '';
  const start = /^M([^,]+),([^ ]+)/.exec(path);
  expect(start).not.toBeNull();
  const dx = Number(start?.[1])-princess.x;
  const dy = Number(start?.[2])-princess.y-AVATAR_CY;
  expect(Math.hypot(dx,dy)).toBeCloseTo(AVATAR/2);
  expect(dx).toBeLessThan(0);
});