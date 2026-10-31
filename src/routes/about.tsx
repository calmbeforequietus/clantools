import { createFileRoute } from '@tanstack/react-router';
import { InformationPage } from '@/components/InformationPage';

export const Route=createFileRoute('/about')({
  head:()=>({meta:[{title:'About DJ Maddox — Clantools'},{name:'description',content:'Meet DJ Maddox, the freelance web developer behind Clantools.'},{property:'og:title',content:'About DJ Maddox — Clantools'},{property:'og:description',content:'Small projects, made for fun by freelance web developer DJ Maddox.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:About,
});
function About(){return <InformationPage title="About">
  <section><h2>Hi, I’m DJ Maddox.</h2><p>I’m a freelance web developer who likes creating things for fun. Clantools is one of those projects: a Warrior Cats Clan planner for building family trees and keeping track of characters, Clan lore and territories.</p></section>
  <section><h2>Get in touch</h2><p>For project ideas or freelance enquiries: <a className="break-all" href="mailto:calmbeforequietus@gmail.com">calmbeforequietus@gmail.com</a></p></section>
  <section><h2>Support the project</h2><p>You can <a className="underline hover:text-foreground font-medium" href="https://ko-fi.com/djmorgg" target="_blank" rel="noopener noreferrer">buy me a coffee on Ko-fi</a> to support the website and future updates. Any tips or donations are greatly appreciated!</p></section>
</InformationPage>;}