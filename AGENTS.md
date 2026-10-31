<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Family-tree logic, Clan roster derivation and relationship validation live in pure modules under src/lib/tree; UI and shared saved-store context live in src/components/tree. Why: keeps genealogy and membership rules testable without the canvas.
- Tree layout is fully automatic (generation by parentage, mates aligned); no manual node positions are stored. Why: trees stay tidy as cats are added.
- Clan pages use nested TanStack routes with an overview index and lineage leaf; ForestProvider preserves and migrates the existing browser-local store. Why: navigation shares edits without discarding previously saved trees.
- A Clan's own saved trees define its roster once created; Clans without trees discover members from existing trees, and matching cat IDs receive profile updates across trees. Why: roster links and edited profiles remain consistent.
- Canon crest vectors are traced from the user-supplied image; original uploaded artwork remains represented by asset pointers. Why: scalable symbols render reliably without external image-mask loading.
- Forest hooks subscribe directly to a browser-scoped external store and self-initialize after hydration; SSR always reads a null snapshot and the provider is an optional initializer. Why: route refreshes cannot lose an ancestor context, duplicate module copies share edits, and server requests never share user data.
- Clan pages persist top-level section order separately from Lore item order; the versioned factory refresh replaces older local forests once, and current-version edits and empty forests are preserved. Why: the commissioned reset must restore canonical defaults without repeatedly erasing subsequent work.
- Clan deletion and lineage transfer are pure store operations; empty saved forests are valid and transfers retain cat affiliations. Why: destructive actions must remove only owned lineages and must not silently reseed deleted data.
- Custom cat avatars store editable settings and render through shared SVG artwork; colors use global cat-art tokens. Why: the creator, profile, stages, canvas and exports share the same saved appearance.
- Mentor routing is a pure obstacle-aware path search with deterministic separated lanes and broad clearance-checked curves; canvas edges carry explicit connected cat IDs and a separate click target. Why: curves avoid cats and selections identify the real endpoints, including both biological parents.
- Canvas avatar geometry uses shared layout constants and nonshrinking top-aligned artwork; mentor arrows approach the left cheek outside the avatar. Why: parentage reaches the visible ring and right-hand Clan/status symbols cannot obscure arrowheads.
- Non-mentor edges retain direct generational cubic curves and straight same-row mate links; single-parent/foster links use only a short local departure bend and names have canvas-colored backplates. Why: readability must not replace recognizable family connections with long global detours.
- Information pages use separate content routes and a shared reading layout; the root footer stays outside the full-screen lineage canvas. Why: legal and About links remain accessible without covering tree controls.
- Shared character reuse keeps cat IDs, unions known relationship options and imports only selected one-hop links into the destination; profile edits remain shared and relationships remain lineage-local. Why: overlapping lineages must not silently import an entire family or overwrite each other’s connections.
- New-character name matching compares trimmed case-insensitive name histories across the forest; combining remaps local links to the chosen existing ID and preserves selected relationship scope. Why: identical names can mean shared identity or genuinely separate characters, never an automatic merge.
- Lineage navigation validates tree and cat search parameters and profile membership links include both. Why: a shared character opens in the requested lineage, including after refresh.
- Site display settings (theme, text size) live in src/lib/settings.ts, persist in their own localStorage key and are applied to <html> data attributes by an inline pre-paint script; themes only override CSS tokens. Why: every page, including the canvas, themes consistently without hydration flashes.
- Full backups wrap the whole forest store with an app/kind marker and restoring replaces it after confirmation; single-tree JSON stays separate. Why: users can move everything between browsers without mixing up file types.
- Kinship checks, Allegiances text export and name suggestions are pure modules under src/lib/tree. Why: their outputs are testable without UI.
