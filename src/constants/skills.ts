export type SkillCategory = {
  key: string;
  title: string;
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    title: "Frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Shadcn/ui",
      "HTML5",
      "CSS3",
      "React Native",
      "Expo",
    ],
  },
  {
    key: "backend",
    title: "Backend",
    skills: [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "PlanetScale",
      "Redis",
    ],
  },
  {
    key: "tools",
    title: "Tools & Platforms",
    skills: [
      "Vercel",
      "Railway",
      "Stripe",
      "Upstash",
      "Sentry",
      "Pusher",
      "Cypress",
      "Vitest",
    ],
  },
  {
    key: "cms",
    title: "CMS & Website Builders",
    skills: ["Squarespace", "WordPress"],
  },
];

export const skillCount = skillCategories.reduce(
  (total, category) => total + category.skills.length,
  0,
);
