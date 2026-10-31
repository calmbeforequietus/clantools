# Clantools

Build an interactive Warrior Cats family tree web application with the following features:

1. Interactive Infinite Canvas:
   - Pan and zoom canvas (drag to pan, mousewheel/pinch zoom, zoom controls, fit-to-view button).
   - Top-down generational tree layout with nodes representing cats.
   - Nodes display a circular avatar icon above the cat's name, their Clan badge/color pill, and status indicator.
   - Smooth curved/orthogonal connection lines indicating relationships (biological parentage, mates, adoptive/foster, mentor/apprentice).

2. Focus Mode & Kinship Engine:
   - Clicking a cat focuses them, highlights their ancestors and descendants, and dims or hides unrelated branches to manage large family lines cleanly.
   - Automatic relationship calculator: when a cat is focused, dynamically calculate and display exact relationship tags relative to them (e.g., Mother, Father, Half-Sibling, Maternal Grandmother, Mate, Former Mentor).

3. Cat Profile & Dossier (Slide-over drawer):
   - Detailed cat profile with:
     - Current name and name history timeline (e.g., Rusty -> Firepaw -> Fireheart -> Firestar).
     - Clan/Affiliation (ThunderClan, ShadowClan, WindClan, RiverClan, SkyClan, StarClan, Dark Forest, Loner/Rogue, Kittypet).
     - Rank (Leader, Deputy, Medicine Cat, Warrior, Apprentice, Kit, Elder, Queen).
     - Status (Living, StarClan, Place of No Stars / Dark Forest).
     - Gender and pelt/eye appearance description.
     - Avatar selector: upload local image, paste image URL, or pick from a built-in library of stylized cat icons and Clan badges.
     - Relationship manager to easily add/edit parents, mates, kits, foster parents, mentors, and apprentices. Flexible connection handling.

4. Tree Switching & Canon Preset:
   - Pre-loaded canon example: Firestar's lineage (Jake, Nutmeg, Firestar, Princess, Cloudtail, Sandstorm, Squirrelflight, Leafpool, Lionblaze, Jayfeather, Hollyleaf, Sparkpelt, Flamepaw, etc.) showcasing multiple generations, mates, and mentorships.
   - Tree Switcher dropdown: lets users create new blank trees, switch between trees, rename, and duplicate trees.
   - Data management: auto-saves to localStorage, with JSON export/import and high-resolution PNG image download for sharing.

5. Design & Aesthetic:
   - Minimal modern tool UI with warm earthy tones, light browns, soft ambers/oranges, and subtle Clan accent colors. Clean typography and intuitive floating toolbars.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clantools.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da8df486-9a8c-4e57-bb12-8b15e0aca8e6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
