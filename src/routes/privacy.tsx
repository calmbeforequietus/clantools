import { createFileRoute, Link } from '@tanstack/react-router';
import { InformationPage } from '@/components/InformationPage';

export const Route=createFileRoute('/privacy')({
  head:()=>({meta:[{title:'Privacy Policy — Clantools'},{name:'description',content:'How Clantools keeps Clan and family-tree saves locally in your browser.'},{property:'og:title',content:'Privacy Policy — Clantools'},{property:'og:description',content:'Local browser saves, external resources and your choices.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Privacy,
});
function Privacy(){return <InformationPage title="Privacy Policy">
  <p className="text-sm text-muted-foreground">Last updated: October 31, 2026</p>
  <section><h2>Your planner data stays local</h2><p>Clantools stores your Clans, cats, family trees, lore and selected image files in your browser’s local storage. There are no user accounts or shared cloud saves, and the planner does not send these saves to a database. Other visitors do not see your edits simply by opening the site.</p></section>
  <section><h2>Your choices</h2><p>You can remove local saves by clearing this site’s data in your browser settings. A later visit will load the default preset again. Downloads and files you choose to share are under your control; exported tree files can include character information and avatar images. Tree exports do not include all Clan lore or territory maps.</p></section>
  <section><h2>Connections needed to load the site</h2><p>Local saves do not mean the site is completely offline. Hosting services may process ordinary request information, such as your IP address and browser details, and technical error diagnostics. The site loads fonts from Google Fonts. If you use an image from a web address, your browser contacts that image’s host. Those services handle information under their own policies.</p></section>
  <section><h2>Contact and updates</h2><p>If you email the developer, your email service processes that message. This policy may be updated when the site changes. Contact details are on the <Link to="/about">About page</Link>.</p></section>
</InformationPage>;}