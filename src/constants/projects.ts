export type Project = {
    title: string;
    src: string;
    href: string;
    description: string;
    stack: string[];
}

export const projects: Project[] = [
    {
      title: "FPL Focal",
      src: "/images/projects/fplPage.webp",
      href: "https://fpl.page",
      description:
        "A web application that allows users to view the latest news and updates from the Football Premier League.",
      stack: ["Next.js", "Tailwind CSS", "TypeScript", "PostgresSql", "Prisma", "Vercel"],
    },

    {
      title: "Advanced Telecommunications Systems",
      src: "/images/projects/ats.webp",
      description:
        "An interactive feedback system that provides instant responses to user actions",
      href: "https://telesystems.com.mt",
      stack: ["Squarespace", "HTML5", "CSS3"],
    },
    {
      title: "Fuwamai",
      src: "/images/projects/fuwamai.webp",
      description:
        "A clone of Apple's website that showcases their products and services",
      href: "https://fuwamai.com",
      stack: ["Squarespace", "HTML5", "CSS3"],
    },
    {
      title: "Matthew Bonello",
      src: "/images/projects/matthewBonello.webp",
      description:
        "A website for a local Online Fitness Coach",
      href: "https://www.matthewbonello.com",
    stack: ["Next.js", "Tailwind CSS", "Vercel", "PostgresSql", "Prisma", "TypeScript"],
    },
    {
      title: "Tribe Malta",
      src: "/images/projects/tribe.webp",
      description:
        "A website for a local restaurant in Malta called Tribe",
      href: "https://tribemalta.com",
      stack: ["Next.js", "Tailwind CSS", "Vercel", "PostgresSql", "Prisma", "TypeScript", "Stripe"],
    },
    {
      title: "FoodMedia",
      src: "/images/projects/foodmedia.webp",
      description:
        "A website for a local food media company called FoodMedia",
      href: "https://foodmedia-testing.squarespace.com/",
      stack: ["Squarespace", "HTML5", "CSS3"],
    },
  ];