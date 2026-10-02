import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Toolkit } from "@/components/sections/toolkit";
import { Work } from "@/components/sections/work";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url.toString()}#website`,
        url: siteConfig.url.toString(),
        name: siteConfig.title,
        description: siteConfig.description,
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url.toString()}#person`,
        name: siteConfig.name,
        url: siteConfig.url.toString(),
        jobTitle: "Self-employed Full-Stack Developer",
        description: siteConfig.description,
        knowsAbout: [
          "UI/UX Design",
          "Full-stack development",
          "Web development",
          "Mobile applications",
          "Backend systems",
          "Deployment",
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <About />
      <Toolkit />
      <Work />
      <Experience />
      <Contact />
    </>
  );
}
