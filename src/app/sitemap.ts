import type { MetadataRoute } from "next";
import { projects } from "@/constants/projects";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { projectPath } from "@/lib/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  // A real date: search engines ignore a lastmod that always says "now".
  const lastModified = new Date(siteConfig.updated);
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(projectPath(project)),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
