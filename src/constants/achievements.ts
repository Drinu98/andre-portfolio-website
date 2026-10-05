export interface Achievement {
  title: string;
  description?: string;
}

export interface AchievementYear {
  title: string;
  content: Achievement[];
}

export const achievements: AchievementYear[] = [
  {
    title: "2025",
    content: [
      {
        title: "Launched Serva",
        description:
          "Built and launched Serva end-to-end - from UI/UX and product design through backend and deployment.",
      },
      {
        title: "Built mobile experiences alongside web",
        description:
          "Designed and implemented mobile app flows that match the web product and scale with real usage.",
      },
      {
        title: "Production-ready deployments & monitoring",
        description:
          "Set up CI/CD, performance budgets, and error monitoring so launches stay stable after day one.",
      },
    ],
  },
  {
    title: "2024",
    content: [
      {
        title: "Designed systems, not just screens",
        description:
          "Worked with clients to define requirements, model data, and build maintainable architectures.",
      },
      {
        title: "Improved performance & SEO for client sites",
        description:
          "Optimized Core Web Vitals, metadata, and accessibility to improve discoverability and conversions.",
      },
      {
        title: "Delivered clean handoffs and documentation",
        description:
          "Provided clear project docs and onboarding so teams can confidently run and extend the system.",
      },
    ],
  },
  {
    title: "2020",
    content: [
      {
        title: "Started learning web development",
        description:
          "Began my journey into programming with JavaScript, HTML, and CSS.",
      },
    ],
  },
];
