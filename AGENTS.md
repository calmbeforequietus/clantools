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
