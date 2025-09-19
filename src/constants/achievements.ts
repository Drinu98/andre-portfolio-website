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
        title: "Reached $20K MRR with my VSCode fork.",
        description:
          "Reached the revenue milestone of $20K MRR with my VSCode fork.",
      },
    ],
  },
  {
    title: "2024",
    content: [
      {
        title: "Launched my own developer tools startup",
        description:
          "Founded a company focused on creating innovative tools for software developers.",
      },
      {
        title: "Spoke at React Conference",
        description:
          "Delivered a keynote presentation about modern frontend architecture patterns.",
      },
    ],
  },
  {
    title: "2023",
    content: [
      {
        title: "Contributed to open source",
        description:
          "Became a core contributor to several popular React and Next.js libraries.",
      },
      {
        title: "Published technical book",
        description:
          "Authored 'Advanced Frontend Architecture' which sold over 10,000 copies.",
      },
    ],
  },
  {
    title: "2022",
    content: [
      {
        title: "Led engineering team at tech startup",
        description:
          "Managed a team of 12 engineers building a SaaS platform with over 50,000 users.",
      },
    ],
  },
  {
    title: "2021",
    content: [
      {
        title: "Graduated with Computer Science degree",
        description:
          "Completed my Bachelor's degree with honors and specialization in software engineering.",
      },
      {
        title: "Built my first production application",
        description:
          "Developed and deployed a web application that gained 5,000 monthly active users.",
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
