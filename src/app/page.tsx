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
import { Subheading } from "@/components/subheading";
import { Testimonials } from "@/components/testimonials";
import { experience } from "@/constants/experience";
import { projects } from "@/constants/projects";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-start">
      <Container className="min-h-screen px-4 md:px-8 md:pt-20 md:pb-10">
        <Scales />
        <div className="flex flex-col sm:flex-row sm:items-center">
          <Heading>Andre Galea</Heading>
          <Flipper />
        </div>
        <Subheading>
          They call me Andre. What the hell kind of a name is Soap? I'm a
          software engineer with an eye for design.
        </Subheading>
        
        <div className="px-4 pt-4 mb-4">
          <a
            href="#contact"
            className="inline-block rounded-md border border-neutral-200 bg-neutral-100 px-6 py-3 text-sm font-medium text-neutral-700 shadow-[0px_4px_8px_0px_var(--color-neutral-200)_inset] transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0px_4px_8px_0px_var(--color-neutral-700)_inset] hover:dark:bg-neutral-700"
          >
            Get in Touch
          </a>
        </div>
        
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
        
        <section id="testimonials">
          <Testimonials />
        </section>
        
        <section id="contact">
          <div className="my-4 px-4 py-6">
            <SectionHeading delay={0.2}>Get in touch</SectionHeading>
            <Subheading>
              I'm currently looking for new opportunities. Whether you have a question
              or want to say hi, I'd love to hear from you.
            </Subheading>
            <ContactForm />
          </div>
        </section>
      </Container>
    </div>
  );
}
