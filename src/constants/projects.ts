export type Project = {
  title: string;
  /** The project's page lives at `/work/<slug>`. */
  slug: string;
  /** What kind of thing it is, in a few words. */
  kind: string;
  src: string;
  alt: string;
  /** The live site, or "/" for a system with no public link. */
  href: string;
  description: string;
  /** Paragraphs for the project page. */
  overview: string[];
  highlights: string[];
  stack: string[];
};

export const projects: Project[] = [
  {
    title: "Serva",
    slug: "serva",
    kind: "Restaurant platform",
    src: "/images/projects/serva.webp",
    alt: "Screenshot of Serva, an all-in-one ordering and reservations platform for restaurants",
    href: "https://serva.mt",
    description:
      "An all-in-one platform for restaurants: QR table ordering, table reservations, loyalty programmes and a Kitchen Display System, built and launched end to end.",
    overview: [
      "Serva is an all-in-one system for restaurants. Guests order from a QR code at the table, book tables and collect loyalty rewards, while the kitchen works from a Kitchen Display System.",
      "I designed and built Serva end to end: the UI/UX and product design, the Next.js frontend, the PostgreSQL and Prisma backend, and the deployment and monitoring around it.",
    ],
    highlights: [
      "QR ordering from the table",
      "Table reservations",
      "Loyalty programmes",
      "Kitchen Display System",
      "Payments through Stripe",
      "Real-time updates with Pusher",
    ],
    stack: [
      "Next.js",
      "Tailwind CSS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Vercel",
      "Stripe",
      "Pusher",
      "Upstash",
      "Railway",
      "Sentry",
      "Vitest",
    ],
  },
  {
    title: "FPL Focal",
    slug: "fpl-focal",
    kind: "Fantasy Premier League dashboard",
    src: "/images/projects/fplPage.webp",
    alt: "Screenshot of FPL Focal, a Fantasy Premier League dashboard at fpl.page",
    href: "https://fpl.page",
    description:
      "A companion dashboard for Fantasy Premier League managers at fpl.page, bringing a wide range of data and information together with real-time updates.",
    overview: [
      "FPL Focal, at fpl.page, is a dashboard built to supplement Fantasy Premier League. It gathers a wide range of useful data and information in one place and updates in real time.",
      "It is a full-stack Next.js and TypeScript app with a PostgreSQL database behind Prisma, deployed on Vercel.",
    ],
    highlights: [
      "A wide range of Fantasy Premier League data in one dashboard",
      "Updates in real time",
      "Full-stack Next.js app on PostgreSQL and Prisma",
    ],
    stack: [
      "Next.js",
      "Tailwind CSS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Vercel",
    ],
  },
  {
    title: "Fuwamai Digital Management System",
    slug: "fuwamai-management-system",
    kind: "Franchise management system",
    src: "/images/projects/fuwamaiLogo.webp",
    alt: "Fuwamai logo",
    href: "/",
    description:
      "A custom web platform that runs the day-to-day operations of a multi-outlet restaurant and bakery franchise in Malta: staff, food safety, kitchen and head office in one tablet-first app.",
    overview: [
      "Fuwamai's Digital Management System is a custom web platform that runs the day-to-day operations of a multi-outlet restaurant and bakery franchise in Malta. It replaces paper forms and spreadsheets with one tablet-first app used by head office, outlet managers and staff.",
      "It covers staff management, food safety and compliance, kitchen operations and franchise oversight, with seven role-based access levels scoped by outlet. The system is private to the business, so there is no public link.",
    ],
    highlights: [
      "Staff management: employee profiles, contracts, rosters, punch clock and leave with balances and approvals",
      "Food safety and compliance: temperature logs, cleaning and opening/closing checklists, and incident and near-miss reports",
      "Kitchen operations: recipes, prep lists, stock takes, wastage tracking and supplier ordering",
      "Franchise and head office: franchisee management, a marketing calendar, and task boards with OKRs and KPIs",
      "Security: seven role-based access levels scoped by outlet, two-factor sign-in and a full audit log",
      "AI-powered voice search",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "NextAuth",
      "Claude AI",
    ],
  },
  {
    title: "Advanced Telecommunications Systems",
    slug: "advanced-telecommunications-systems",
    kind: "Company website",
    src: "/images/projects/ats.webp",
    alt: "Screenshot of the Advanced Telecommunications Systems website",
    href: "https://telesystems.com.mt",
    description:
      "The company website for Advanced Telecommunications Systems, a telecommunications company in Malta, built on Squarespace with custom HTML and CSS.",
    overview: [
      "The company website for Advanced Telecommunications Systems, a telecommunications company based in Malta.",
      "It is built on Squarespace, with custom HTML and CSS where the platform's own blocks were not enough.",
    ],
    highlights: ["Squarespace build", "Custom HTML and CSS"],
    stack: ["Squarespace", "HTML5", "CSS3"],
  },
  {
    title: "Fuwamai",
    slug: "fuwamai",
    kind: "Bakery website and online ordering",
    src: "/images/projects/fuwamai.webp",
    alt: "Screenshot of the website for Fuwamai, a Japanese soufflé pancake bakery in Malta",
    href: "https://fuwamai.com",
    description:
      "The website for Fuwamai, Malta's first Japanese soufflé pancake bakery, rebuilt in Next.js with a full menu and online ordering for pickup and delivery.",
    overview: [
      "The public website for Fuwamai, Malta's first Japanese soufflé pancake bakery, with outlets in St Julian's and Valletta. It presents the brand, the full menu and the franchise offer, and lets customers order online for pickup or delivery.",
      "The site started on Squarespace and is now a custom Next.js build deployed on Vercel. I also built the bakery's internal management system.",
    ],
    highlights: [
      "Online ordering for pickup and delivery",
      "Full menu across pancakes, sandos, bakery, coffee and drinks",
      "Customer accounts with Google and email sign-in",
      "Franchise page for prospective franchisees",
      "Customer survey and contact form",
    ],
    stack: [
      "Next.js",
      "React",
      "NextAuth",
      "Resend",
      "Cloudflare R2",
      "Vercel",
    ],
  },
  {
    title: "Matthew Bonello",
    slug: "matthew-bonello",
    kind: "Fitness coach website",
    src: "/images/projects/matthewbonello.webp",
    alt: "Screenshot of the website for Malta-based fitness coach Matthew Bonello",
    href: "https://www.matthewbonello.com",
    description:
      "A custom Next.js website for Malta-based fitness coach Matthew Bonello, backed by PostgreSQL and Prisma and deployed on Vercel.",
    overview: [
      "The website for Matthew Bonello, a fitness coach based in Malta.",
      "It is a custom build rather than a template: a Next.js and TypeScript frontend styled with Tailwind CSS, a PostgreSQL database behind Prisma, and deployment on Vercel.",
    ],
    highlights: [
      "Custom Next.js build",
      "PostgreSQL database behind Prisma",
      "Deployed on Vercel",
    ],
    stack: [
      "Next.js",
      "Tailwind CSS",
      "Vercel",
      "PostgreSQL",
      "Prisma",
      "TypeScript",
    ],
  },
  {
    title: "Tribe Malta",
    slug: "tribe-malta",
    kind: "Restaurant website",
    src: "/images/projects/tribe.webp",
    alt: "Screenshot of the website for Tribe, a restaurant in Malta",
    href: "https://tribemalta.com",
    description:
      "The website for Tribe, a restaurant in Malta, with Stripe payments and a CMS for managing the site's content.",
    overview: [
      "The website for Tribe, a restaurant in Malta.",
      "It takes payments through a Stripe integration and includes a CMS for managing the website. It is built with Next.js and TypeScript on PostgreSQL and Prisma, deployed on Vercel.",
    ],
    highlights: [
      "Stripe integration for payments",
      "CMS for managing the website",
      "Custom Next.js build on PostgreSQL and Prisma",
    ],
    stack: [
      "Next.js",
      "Tailwind CSS",
      "Vercel",
      "PostgreSQL",
      "Prisma",
      "TypeScript",
      "Stripe",
    ],
  },
  {
    title: "FoodMedia",
    slug: "foodmedia",
    kind: "Company website",
    src: "/images/projects/foodmedia.webp",
    alt: "Screenshot of the website for FoodMedia, a food media company in Malta",
    href: "https://foodmedia.mt",
    description:
      "The website for FoodMedia, a food media company in Malta, showcasing its products and services. Built on Squarespace.",
    overview: [
      "The website for FoodMedia, a food media company in Malta. It showcases the company's products and services.",
      "It is built on Squarespace, with custom HTML and CSS on top.",
    ],
    highlights: [
      "Showcases products and services",
      "Squarespace build",
      "Custom HTML and CSS",
    ],
    stack: ["Squarespace", "HTML5", "CSS3"],
  },
];

export const isExternal = (href: string) => /^https?:\/\//.test(href);
export const hostOf = (href: string) =>
  new URL(href).host.replace(/^www\./, "");
