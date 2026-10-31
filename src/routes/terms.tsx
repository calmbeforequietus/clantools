import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { InformationPage } from '@/components/InformationPage';

export const Route=createFileRoute('/terms')({
  head:()=>({meta:[{title:'Terms of Service — Clantools'},{name:'description',content:'Simple terms for using the fan-made Clantools Clan planner.'},{property:'og:title',content:'Terms of Service — Clantools'},{property:'og:description',content:'Using Clantools responsibly, local saves and fan-project ownership.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Terms,
});
function Terms(){return <InformationPage title="Terms of Service">
  <p className="text-sm text-muted-foreground">Last updated: October 31, 2026</p>
  <section><h2>Using Clantools</h2><p>By using Clantools, you agree to these simple terms. This free, unofficial fan-made planner is provided for personal, creative use. Please don’t misuse the site or use content you don’t have permission to use.</p></section>
  <section><h2>Your content and saves</h2><p>Your original content remains yours. Clan and family-tree saves are kept in your browser, not in a shared account. Export a backup of anything important: clearing browser storage, changing devices or site updates can affect your saves. We can’t recover deleted local data.</p></section>
  <section><h2>Ownership</h2><p>The website is © DJ Maddox 2026. Warrior Cats names, characters and associated artwork belong to their respective rights holders. Clantools is not affiliated with or endorsed by them.</p></section>
  <section><h2>No guarantees</h2><p>Clantools is provided “as is,” without guarantees of availability, accuracy or uninterrupted operation. To the extent permitted by law, DJ Maddox is not responsible for losses arising from use of the site. These terms do not limit rights that cannot legally be excluded.</p></section>
  <section><h2>Changes and questions</h2><p>These terms may change as the project develops. Questions? Contact details are on the <Link to="/about">About page</Link>.</p></section>
</InformationPage>;}