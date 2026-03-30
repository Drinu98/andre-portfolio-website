const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const siteConfig = {
  name: "Andre Galea",
  title: "Andre Galea",
  description:
    "Self‑employed full‑stack developer building and designing end‑to‑end systems for clients — websites and mobile apps from UI/UX through backend and deployment.",
  url: new URL(rawSiteUrl),
  twitterHandle: undefined as string | undefined,
} as const;

