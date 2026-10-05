import { JsonLd } from "@/components/json-ld";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Toolkit } from "@/components/sections/toolkit";
import { Work } from "@/components/sections/work";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { homeJsonLd } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: siteConfig.headline,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <About />
      <Toolkit />
      <Work />
      <Experience />
      <Contact />
    </>
  );
}
