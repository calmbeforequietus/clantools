# Clantools feedback batch (32 items)

## Themes and colors
- Monochrome now keeps cat art in color. A new "Monochrome (full)" option makes everything gray, cats included.
- New lineage line colors for the default theme, built for strong contrast (modeled on how readable Night and red-green safe are). Each other theme gets matching line colors.
- Dead cat names become a lighter gray-blue.
- Lines get slightly thicker and all match. Foster and mentor lines keep their current style.

## Clan pages
- Remove "< The Clans". Clicking "Clantools" takes you home, and Settings goes back to the top right.
- Move the member count down so it sits closer to the Clan name.
- The crest bounces on hover, like it does on the main page.
- The Lineage and "Add cat" buttons change color more clearly on hover.
- "Arrange sections" becomes "Add / Arrange sections". While it's on, you can add new sections with a + button, mark a section "half width" so two sit side by side (Allegiances always stays full width), and finish with "Done editing".
- Optional Clan motto, shown on the main page and the Clan page.
- Allegiances: remove the rank filter. Add an "Add cat" form for name, rank and basic info, so you can place the cat in a lineage later.
- New "Back up this Clan" button at the bottom of the page. It saves the Clan's info and its lineages.
- New Clans get a web address based on their name (e.g. /clan/lightclan). I'll also look for anything that only works for ThunderClan and fix it.
- File upload fields only say "Choose File", with the text sitting a little lower in the field.

## Profiles (based on your sketch)
- Clicking a cat on a Clan page opens their profile in the middle of the screen and keeps you on the Clan page. The profile has a "View in lineage" button next to Edit.
- New layout: a big cat picture on the left. On the right, the icon next to the Clan crest, then the name, then "Clan – Position". Below that sit the Lore, Family and Info boxes.
- The profile opens in view mode, and you click "Edit profile" to change anything.
- New full-body sitting cat drawing that uses the same coat, eye and marking choices as the icon. Uploading your own image still works.

## Lineage page
- Parent lines get a closer look so they stay short and direct. Mentor lines stay as they are.
- The tree is more compact, with cats closer together.
- Parentage and Mates share one toggle.
- Foster lines are drawn once per foster parent pair, like a real family line, instead of once per cat.
- Ctrl+Z undoes your last 10 changes, and Ctrl+Shift+Z or Ctrl+Y redoes them.
- Picking a cat from somewhere else (for example Allegiances) moves the view to that cat and focuses them every time, not just the first time.
- "Spirit realm" is renamed "Afterlives", with room to add other beliefs later.
- StarClan cats get 5–7 stars in fixed spots that stay clear of the eyes and face.
- The Dark Forest shadow moves to the top third of the icon and is softer.

## Main page and site
- Main page description changes to "Cat clan lore and family trees."
- Backup bar: new wording ("Your saves are kept only in this browser."), and Restore moves a little left and gets a border to match "Back up everything".
- Name ideas use the full canon list of prefixes and suffixes.
- New Devlog page after About: a simple, old-school blog with dated posts. The first post is "Version 1.0" with a plain-language feature list. It gets a footer link.

## Keyboard and accessibility (item 9)
- The answer now: most buttons work with the keyboard, but the tree and some custom controls don't fully.
- Planned fixes: a "Skip to content" link, visible focus outlines everywhere, and tree cats you can reach with Tab. On the tree, arrow keys pan, +/- zoom, and Enter opens a cat. Lines you can click also work by keyboard.
- I'll check labels, headings and contrast across all themes, then tell you what passes and what doesn't.

## Technical details
- Settings gain `mono-full`. Plain `mono` stops desaturating `--cat-*` art tokens. Edge color tokens are defined per theme.
- ClanPage gains `motto`, `sectionLayout` (half/full) and custom section types. Clan IDs come from the name, with collision suffixes. Existing UUID Clans are left alone, so current links keep working.
- Single-Clan backup reuses the backup wrapper with `kind: 'clan'`. Restoring merges that Clan in and asks you to confirm.
- Undo is a bounded history stack in the lineage page around `setStore` for the active tree.
- Focus on navigation reacts to every change of the `cat` search parameter.
- Layout spacing constants get tightened, with updated layout tests. Foster edges are grouped by foster-parent pair, and the parent path is reviewed.
- The new full-body SVG (`CatBodyArt`) shares `CatIconSettings`.
- Tests: theme parsing, clan slug, clan backup round trip, undo limit, and foster grouping.
