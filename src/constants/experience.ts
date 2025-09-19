export type Experience = {
    company: string;
    designation: string;
    logo: string;
    description: string;
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
    description: "Worked on various projects for clients, including a web application for a local business and a mobile application for a local restaurant.",
    startDate: "November 2024",
    endDate: "Present", 
    location: "Worldwide",
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL","Tailwind CSS", "HTML5", "CSS3", "Next.js", "Prisma", "Vercel"]
  },
  {
    company: "BOV",
    designation: "Software Engineer",
    logo: "/images/logos/bov.png",
    description: "Led the development of key features for Google Cloud Platform's web console while improving performance metrics by 35%.",
    startDate: "August 2021",
    endDate: "November 2024",
    location: "St.Venera, Malta",
    stack: ["React", "TypeScript", "Redux", "GraphQL", "Jest", "Cypress"]
  },
  {
    company: "O Gaming",
    designation: "Junior Tech Specialist",
    logo: "/images/logos/airbnb-logo.png",
    description: "Developed and maintained core components of Airbnb's booking platform.",
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