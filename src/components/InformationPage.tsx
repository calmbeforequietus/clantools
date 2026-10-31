import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { SettingsButton } from './SettingsButton';
import type { ReactNode } from 'react';

export function InformationPage({title,children}:{title:string;children:ReactNode}) {
  return <main className="clan-page w-full">
    <header className="flex items-center justify-between border-b border-border pb-3">
      <span className="flex items-center gap-1"><Link to="/" className="site-wordmark">Clantools</Link><SettingsButton /></span>
      <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/>The Clans</Link>
    </header>
    <article className="mx-auto max-w-2xl py-10 sm:py-14">
      <h1 className="clan-heading mb-8">{title}</h1>
      <div className="space-y-7 text-base leading-7 text-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_a]:text-primary [&_a]:underline [&_p+p]:mt-3">{children}</div>
    </article>
  </main>;
}