import { createFileRoute } from '@tanstack/react-router';
import { InformationPage } from '@/components/InformationPage';

export const Route=createFileRoute('/about')({
  head:()=>({meta:[{title:'About DJ Maddox — Clantools'},{name:'description',content:'Meet DJ Maddox, the freelance web developer behind Clantools.'},{property:'og:title',content:'About DJ Maddox — Clantools'},{property:'og:description',content:'Small projects, made for fun by freelance web developer DJ Maddox.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:About,
});
function About(){return <InformationPage title="About">
  <section><h2>Hi, I’m DJ Maddox.</h2><p>I’m a freelance web developer who likes creating things for fun. Clantools is one of those projects: a Warrior Cats Clan planner for building family trees and keeping track of characters, Clan lore and territories.</p></section>
  <section><h2>Get in touch</h2><p>For project ideas or freelance enquiries: <a href="mailto:hello@example.com">hello@example.com</a></p><p className="text-sm text-muted-foreground">Placeholder email — a real contact address is coming soon.</p></section>
  <section><h2>A fan-made project</h2><p>Clantools is an unofficial fan project, not affiliated with or endorsed by the Warrior Cats creators or publishers.</p></section>
</InformationPage>;}