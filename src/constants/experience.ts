export type Experience = {
    company: string;
    designation: string;
    logo: string;
    description: string | string[];
    startDate: string;
    endDate: string;
    location: string;
    stack: string[];
    imageClass?: string;
}

export const experience: Experience[] = [
  {
    company: "Self Employed",
    designation: "Full Stack Developer",
    logo: "/images/logos/andreLogo.png",
    description: [
      "Full stack developer building and designing end-to-end systems for clients.",
      "Deliver websites and mobile applications, from UI/UX through backend and deployment.",
    ],
    startDate: "November 2024",
    endDate: "Present", 
    location: "Worldwide",
    stack: ["React", "TypeScript","Tailwind CSS", "Next.js", "Prisma", "Vercel", "Stripe", "Pusher", "Upstash", "Railway", "Sentry", "Vitest"]
  },
  {
    company: "BOV",
    designation: "Software Engineer",
    logo: "/images/logos/bov.png",
    description: [
      "Supported applications crucial to the bank's infrastructure (e.g. Collateral Processing System, Revenue Management).",
      "Maintained and improved a portfolio totaling 11 supported applications.",
      "Coordinated new projects with external companies to set up new applications that are both Customer Facing and for internal use.",
      "Assisted in creating a proper and detailed Knowledge base for the applications supported by our team.",
      "Developed small applications that quicken processes and are User friendly.",
      "Fixed and assisted in production issues that arose throughout."
    ],
    startDate: "August 2021",
    endDate: "November 2024",
    location: "St.Venera, Malta",
    stack: ["React", "TypeScript", "Redux", "GraphQL", "Jest", "Cypress"]
  },
  {
    company: "O Gaming",
    designation: "Junior Tech Specialist",
    logo: "/images/logos/andreLogo.png",
    description: "Developed and maintained features for the O Gaming website. Updated Content throughout the website.",
    startDate: "August 2020",
    endDate: "May 2021",
    location: "Sliema, Malta",
    stack: ["React", "Redux", "Node.js", "Express", "MongoDB", "Styled Components"]
  },
  // {
  //   company: "Shopify",
  //   designation: "Freelance Web Developer",
  //   logo: "/images/logos/shopify-logo.png",
  //   description: "Designed and developed custom Shopify themes for enterprise clients with optimized checkout flows.",
  //   startDate: "March 2019",
  //   endDate: "December 2019",
  //   imageClass: "dark:filter dark:invert",
  //   location: "Remote",
  //   stack: [ "JavaScript", "HTML5", "CSS3", "SCSS", "Shopify API"]
  // },
  // {
  //   company: "Adobe",
  //   designation: "Freelance Frontend Consultant",
  //   logo: "/images/logos/adobe-logo.png",
  //   description: "Consulted on the redesign of Adobe's Creative Cloud web application.",
  //   startDate: "September 2016",
  //   endDate: "November 2016",
  //   location: "Remote",
  //   stack: ["HTML5", "JavaScript", "CSS3"]
  // }
  ];