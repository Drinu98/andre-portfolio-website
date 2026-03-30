import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: siteConfig.url.toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

