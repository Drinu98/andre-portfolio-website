const withProtocol = (host: string) =>
  host.startsWith("http") ? host : `https://${host}`;

// Canonical URLs, the sitemap and social images are all built from this. Every
// Vercel deployment has its own noindexed VERCEL_URL, so that is the last
// resort: the configured domain wins, then the project's production domain.
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : process.env.VERCEL_URL
      ? withProtocol(process.env.VERCEL_URL)
      : "http://localhost:3000");

export const siteConfig = {
  name: "Andre Galea",
  /** The site name, used as the suffix on every page title. */
  title: "Andre Galea",
  /** The homepage title tag. */
  headline: "Andre Galea — Full-Stack Web & Mobile Developer in Malta",
  role: "Full-Stack Developer",
  description:
    "Freelance full-stack developer in Malta. I design and build websites, web apps and mobile apps with React, Next.js and TypeScript. Get in touch.",
  url: new URL(rawSiteUrl),
  portrait: "/andre.webp",
  country: { name: "Malta", code: "MT" },
  /** When the content last changed. Feeds the sitemap and structured data. */
  updated: "2026-10-02",
  twitterHandle: undefined as string | undefined,
  socials: [{ label: "GitHub", href: "https://github.com/Drinu98" }],
} as const;

export const absoluteUrl = (path: string) =>
  new URL(path, siteConfig.url).toString();
