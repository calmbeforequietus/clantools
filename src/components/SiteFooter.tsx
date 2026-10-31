import { Link, useRouterState } from '@tanstack/react-router';

export function SiteFooter() {
  const pathname=useRouterState({select:state=>state.location.pathname});
  if(pathname.endsWith('/lineage'))return null;
  return <footer className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border px-6 py-5 text-xs text-muted-foreground sm:justify-between">
    <span>© DJ Maddox 2026</span>
    <nav aria-label="Site information" className="flex flex-wrap justify-center gap-5">
      <Link to="/about" className="hover:text-foreground">About</Link>
      <Link to="/devlog" className="hover:text-foreground">Devlog</Link>
      <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
      <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
    </nav>
  </footer>;
}