export type Project = {
    title: string;
    src: string;
    href: string;
    description: string;
    stack: string[];
}

export const projects: Project[] = [
    
  {
    title: "Serva",
    src: "/images/projects/serva.webp",
    href: "https://serva.mt",
    description:
      "An all in one system for restaurants that features QR ordering, table reservations, loyalty programs, Kitchen Display System, and more.",
    stack: ["Next.js", "Tailwind CSS", "TypeScript", "PostgresSql", "Prisma", "Vercel", "Stripe", "Pusher", "Upstash", "Railway", "Sentry", "Vitest"],
  },
  {
      title: "FPL Focal",
      src: "/images/projects/fplPage.webp",
      href: "https://fpl.page",
      description:
        "The fpl.page app is a dashboard built to supplement Fantasy Premier League, containing a wide range of useful data and information, with updates in real time.",
      stack: ["Next.js", "Tailwind CSS", "TypeScript", "PostgresSql", "Prisma", "Vercel"],
  },
  {
    title: "Fuwamai Management System",
    src: "/images/projects/fuwamaiLogo.webp",
    href: "/",
    description:
      "A full stack management system for Fuwamai with important features such as cleaning schedules and temperature sheets",
    stack: ["Next.js", "Tailwind CSS", "TypeScript", "PostgresSql", "Prisma", "Vercel"],
  },
  {
      title: "Advanced Telecommunications Systems",
      src: "/images/projects/ats.webp",
      description:
        "A website for a local telecommunications company called Advanced Telecommunications Systems",
      href: "https://telesystems.com.mt",
      stack: ["Squarespace", "HTML5", "CSS3"],
  },
  {
      title: "Fuwamai",
      src: "/images/projects/fuwamai.webp",
      description:
        "A website for a local Japanese Souffle bakery called Fuwamai",
      href: "https://fuwamai.com",
      stack: ["Squarespace", "HTML5", "CSS3"],
  },
  {
      title: "Matthew Bonello",
      src: "/images/projects/matthewBonello.webp",
      description:
        "A website for a local Fitness Coach called Matthew Bonello",
      href: "https://www.matthewbonello.com",
    stack: ["Next.js", "Tailwind CSS", "Vercel", "PostgresSql", "Prisma", "TypeScript"],
  },
  {
      title: "Tribe Malta",
      src: "/images/projects/tribe.webp",
      description:
        "A website for a local restaurant in Malta called Tribe with Stripe integration for payments and a CMS for managing the website",
      href: "https://tribemalta.com",
      stack: ["Next.js", "Tailwind CSS", "Vercel", "PostgresSql", "Prisma", "TypeScript", "Stripe"],
  },
  {
      title: "FoodMedia",
      src: "/images/projects/foodmedia.webp",
      description:
        "A website for a local food media company called FoodMedia that showcases their products and services",
      href: "https://foodmedia.mt",
      stack: ["Squarespace", "HTML5", "CSS3"],
  },
];