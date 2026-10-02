import { About } from "@/components/about";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/container";
import { Experiences } from "@/components/experiences";
import { Flipper } from "@/components/flipper";
import { Heading } from "@/components/heading";
import { Projects } from "@/components/projects";
import { Scales } from "@/components/scales";
import { SectionHeading } from "@/components/section-heading";
import { Skills } from "@/components/skills";
import { Stage } from "@/components/stage";
import { Subheading } from "@/components/subheading";
import { experience } from "@/constants/experience";
import { projects } from "@/constants/projects";
import { siteConfig } from "@/lib/site";
import { focusKey, stackLayers } from "@/lib/stations";

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
    <div className="flex min-h-screen items-start justify-start">
      <Container className="min-h-screen px-4 md:px-8 md:pt-20 md:pb-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Scales />
        <section
          id="home"
          className="grid items-center gap-6 pt-6 pb-6 md:grid-cols-[1fr_21rem] md:pt-2"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Heading>Andre Galea</Heading>
              <Flipper />
            </div>
            <Subheading>
              I’m a self‑employed full‑stack developer who designs and builds
              end‑to‑end products - from UI/UX to backend and deployment.
            </Subheading>

            {/* Each chip lights one slab of the stack in the stage. */}
            <ul className="flex flex-wrap gap-2 px-4 pt-5">
              {stackLayers.map((layer) => (
                <li
                  key={layer.key}
                  data-focus={focusKey.layer(layer.key)}
                  className="text-secondary cursor-default rounded-md px-2 py-0.5 text-sm shadow-[var(--shadow-aceternity)] transition-colors hover:text-blue-500 data-[lit]:text-blue-500"
                >
                  {layer.title}
                </li>
              ))}
            </ul>

            <div className="mb-4 px-4 pt-5">
              <a
                href="#contact"
                className="inline-block rounded-md border border-neutral-200 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-700 shadow-[0px_4px_8px_0px_var(--color-neutral-200)_inset] transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0px_4px_8px_0px_var(--color-neutral-700)_inset] hover:dark:bg-neutral-700"
              >
                Get in Touch
              </a>
            </div>
          </div>

          <Stage
            station="home"
            hint="Drag to turn"
            className="mx-4 h-72 md:mx-0 md:h-[21rem]"
          />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="skills">
          <Skills />
        </section>

        <section id="projects">
          <Projects projects={projects} />
        </section>

        <section id="experience">
          <Experiences experiences={experience} />
        </section>

        <section id="contact">
          <div className="my-4 px-4 py-6">
            <SectionHeading delay={0.2}>Get in touch</SectionHeading>
            <Subheading>
              I&apos;m currently looking for new opportunities. Whether you have
              a question or want to say hi, I&apos;d love to hear from you.
            </Subheading>
            <div className="grid items-center gap-6 md:grid-cols-[1fr_17rem]">
              <ContactForm />
              <Stage station="contact" className="h-64 md:h-72" />
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
