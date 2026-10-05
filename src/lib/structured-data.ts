import { isExternal, projects, type Project } from "@/constants/projects";
import { services } from "@/constants/services";
import { skillCategories } from "@/constants/skills";
import { absoluteUrl, siteConfig } from "./site";

const home = absoluteUrl("/");
const id = (fragment: string) => `${home}#${fragment}`;
const ref = (fragment: string) => ({ "@id": id(fragment) });

export const projectPath = (project: Project) => `/work/${project.slug}`;

/** The homepage graph: the site, the profile page, the person and the work. */
export const homeJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": id("website"),
      url: home,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: ref("person"),
    },
    {
      "@type": "ProfilePage",
      "@id": id("profile"),
      url: home,
      name: siteConfig.headline,
      description: siteConfig.description,
      inLanguage: "en",
      dateModified: siteConfig.updated,
      isPartOf: ref("website"),
      mainEntity: ref("person"),
    },
    {
      "@type": "Person",
      "@id": id("person"),
      name: siteConfig.name,
      url: home,
      image: absoluteUrl(siteConfig.portrait),
      jobTitle: siteConfig.role,
      description: siteConfig.description,
      address: {
        "@type": "PostalAddress",
        addressCountry: siteConfig.country.code,
      },
      sameAs: siteConfig.socials.map((social) => social.href),
      knowsAbout: [
        "Web development",
        "Mobile app development",
        "UI/UX design",
        ...skillCategories.flatMap((category) => category.skills),
      ],
    },
    ...services.map((service) => ({
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: ref("person"),
      areaServed: [{ "@type": "Country", name: siteConfig.country.name }],
    })),
    {
      "@type": "ItemList",
      "@id": id("work"),
      name: "Selected work",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: absoluteUrl(projectPath(project)),
      })),
    },
  ],
});

/** One project page: where it sits in the site, and the work itself. */
export const projectJsonLd = (project: Project) => {
  const url = absoluteUrl(projectPath(project));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: home },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: absoluteUrl("/#projects"),
          },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
      {
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        name: project.title,
        description: project.description,
        url,
        image: absoluteUrl(project.src),
        creator: ref("person"),
        keywords: project.stack.join(", "),
        inLanguage: "en",
        ...(isExternal(project.href) && { sameAs: project.href }),
      },
    ],
  };
};
