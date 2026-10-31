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

- Family-tree logic (types, canon preset, kinship, layout, edits, localStorage) lives in pure modules under src/lib/tree; UI in src/components/tree. Why: keeps rules testable without the canvas.
- Tree layout is fully automatic (generation by parentage, mates aligned); no manual node positions are stored. Why: trees stay tidy as cats are added.
