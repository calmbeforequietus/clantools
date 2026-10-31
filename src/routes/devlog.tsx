import { createFileRoute, Link } from '@tanstack/react-router';
import { SettingsButton } from '@/components/SettingsButton';
import { Calendar, Tag } from 'lucide-react';

export const Route = createFileRoute('/devlog')({
  head: () => ({
    meta: [
      { title: 'Devlog — Clantools' },
      { name: 'description', content: 'What has changed in Clantools, the Warrior Cats Clan planner.' },
      { property: 'og:title', content: 'Clantools Devlog' },
      { property: 'og:description', content: 'Updates and release logs for the Warrior Cats Clan planner.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Devlog,
});

export function Devlog() {
  return (
    <main className="clan-page w-full min-h-screen">
      <header className="flex items-center justify-between border-b border-border pb-3">
        <Link to="/" className="site-wordmark">Clantools</Link>
        <SettingsButton />
      </header>

      <div className="mx-auto max-w-3xl py-10 sm:py-14">
        <div className="mb-10 border-b border-border pb-8">
          <h1 className="clan-heading text-4xl sm:text-5xl">Devlog</h1>
        </div>

        <article className="rounded-2xl border border-border bg-card p-6 sm:p-9 shadow-sm">
          {/* Post Meta */}
          <div className="border-b border-border pb-5">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Calendar size={14} className="text-primary" />
                October 31, 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag size={14} />
                Version 1.0
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Version 1.0 — Initial Release
            </h2>
          </div>

          {/* Post Content */}
          <div className="mt-6 space-y-5 text-sm sm:text-base leading-relaxed text-foreground">
            <p>
              Clantools is live! I built this because I wanted a dedicated place to plan Warrior Cats stories — somewhere to track family trees, keep character histories, and manage Clan lore without juggling spreadsheets and Discord docs. Here's everything that's in it:
            </p>

            <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
              <h3 className="mb-3 font-display text-base sm:text-lg font-semibold text-foreground">
                Features
              </h3>
              <ul className="space-y-3 pl-5 list-disc text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                <li>
                  <strong className="text-foreground">Interactive Lineage Canvas:</strong> Drag to pan, scroll or pinch to zoom, fit-to-view, and a minimap for big trees. Cats can be repositioned by hand with optional grid snapping.
                </li>
                <li>
                  <strong className="text-foreground">Automatic Layout:</strong> Generations are stacked top-down automatically — parents above kits, mates side by side — so the tree stays readable as you add more cats.
                </li>
                <li>
                  <strong className="text-foreground">Focus & Kinship:</strong> Click any cat to focus them. The rest of the tree dims, and a kinship checker can label every visible cat with their relationship to the focused one.
                </li>
                <li>
                  <strong className="text-foreground">Relationship Lines:</strong> Parentage, mates, foster connections, and mentor-apprentice links each have their own styled curve. Mentor paths are routed around other cats automatically.
                </li>
                <li>
                  <strong className="text-foreground">Role Badges:</strong> Small coloured icons above avatars show rank — gold for Leaders, blue for Deputies, green for Medicine Cats, yellow for Kits, grey for Elders, and so on for Kittypets, Loners, and Rogues.
                </li>
                <li>
                  <strong className="text-foreground">Cat Creator:</strong> Draw a cat from scratch — coat pattern, colours, eye colour, scars, ear shape, accessories. The same art shows on the canvas, in the profile drawer, and in exports.
                </li>
                <li>
                  <strong className="text-foreground">Life Stage Cycling:</strong> Each cat can have a name and appearance for every life stage. Click their portrait in the profile to flip through kit, apprentice, warrior, and so on.
                </li>
                <li>
                  <strong className="text-foreground">Cat Profiles:</strong> A slide-out drawer with name history, biography, rank, status, appearance notes, and a full family panel.
                </li>
                <li>
                  <strong className="text-foreground">Multi-Clan Support:</strong> Create as many Clans as you need, each with its own name, colour, crest, motto, lore sections, and lineages.
                </li>
                <li>
                  <strong className="text-foreground">Allegiances Export:</strong> Generates a formatted allegiances list you can copy as plain text or Discord markdown, filtered by living members or StarClan.
                </li>
                <li>
                  <strong className="text-foreground">Shared Characters:</strong> A cat can appear in multiple lineages. Edit their profile in one place and it updates everywhere.
                </li>
                <li>
                  <strong className="text-foreground">Territory Maps:</strong> Clickable map with custom landmark pins, descriptions, and lore notes.
                </li>
                <li>
                  <strong className="text-foreground">Undo / Redo:</strong> Ctrl+Z and Ctrl+Shift+Z with 10-step history. Typing bursts are coalesced so you're not undoing one letter at a time.
                </li>
                <li>
                  <strong className="text-foreground">Backup & Export:</strong> Save the whole forest as a JSON backup and restore it later, or export individual trees as JSON or high-resolution PNG.
                </li>
                <li>
                  <strong className="text-foreground">Themes & Text Size:</strong> Forest, Night, Leaf-bare, two colourblind-safe palettes, and two monochrome modes. Text size can be bumped up or down.
                </li>
              </ul>
            </div>

            {/* Roadmap Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                Roadmap
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Nothing planned at the moment — have an idea? Feel free to reach out on the <Link to="/about" className="underline underline-offset-2 text-foreground hover:text-primary">About page</Link>.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
