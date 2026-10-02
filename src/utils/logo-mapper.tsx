import {
  ReactLogo,
  TailwindLogo,
  NextLogo,
  ThreeJSLogo,
  TypescriptLogo,
  ReduxLogo,
  GraphQLLogo,
  JestLogo,
  CypressLogo,
  VitestLogo,
  JavascriptLogo,
  AzureLogo,
  WebRTCLogo,
  WebpackLogo,
  MongoDBIcon,
  ExpressIcon,
  NodejsIcon,
  HTMLIcon,
  CSSIcon,
  SCSSIcon,
  VueLogo,
  NuxtLogo,
  SquarespaceLogo,
  PostgreSQLLogo,
  PrismaLogo,
  VercelLogo,
  StripeLogo,
  TanStackQueryLogo,
  ReactNativeLogo,
  ExpoLogo,
  PlanetScaleLogo,
  UpstashLogo,
  RedisLogo,
  ShadcnLogo,
  WordPressLogo,
  SentryLogo,
  PusherLogo,
  RailwayLogo,
} from "@/icons/stack";
import { IconCode } from "@tabler/icons-react";
import React from "react";

export const getLogoForTechnology = (technology: string) => {
  const logoMap: Record<string, React.ReactNode> = {
    React: <ReactLogo className="h-4 w-4 shrink-0 dark:text-neutral-200" />,
    "Tailwind CSS": (
      <TailwindLogo className="h-4 w-4 shrink-0 dark:text-neutral-200" />
    ),
    "Next.js": <NextLogo className="h-4 w-4 shrink-0 dark:text-neutral-200" />,
    "Three.js": (
      <ThreeJSLogo className="h-4 w-4 shrink-0 dark:text-neutral-200" />
    ),
    TypeScript: <TypescriptLogo className="h-4 w-4 shrink-0" />,
    Redux: <ReduxLogo className="h-4 w-4 shrink-0" />,
    GraphQL: <GraphQLLogo className="h-4 w-4 shrink-0" />,
    Jest: <JestLogo className="h-4 w-4 shrink-0" />,
    Cypress: <CypressLogo className="h-4 w-4 shrink-0" />,
    Vitest: <VitestLogo className="h-4 w-4 shrink-0" />,
    JavaScript: <JavascriptLogo className="h-4 w-4 shrink-0" />,
    Azure: <AzureLogo className="h-4 w-4 shrink-0" />,
    WebRTC: <WebRTCLogo className="h-4 w-4 shrink-0" />,
    Webpack: <WebpackLogo className="h-4 w-4 shrink-0" />,
    MongoDB: <MongoDBIcon className="h-4 w-4 shrink-0" />,
    Express: <ExpressIcon className="h-4 w-4 shrink-0 dark:text-neutral-200" />,
    NodeJS: <NodejsIcon className="h-4 w-4 shrink-0" />,
    HTML5: <HTMLIcon className="h-4 w-4 shrink-0" />,
    CSS3: <CSSIcon className="h-4 w-4 shrink-0" />,
    SASS: <SCSSIcon className="h-4 w-4 shrink-0" />,
    Vue: <VueLogo className="h-4 w-4 shrink-0" />,
    "Nuxt.js": <NuxtLogo className="h-4 w-4 shrink-0" />,
    Squarespace: <SquarespaceLogo className="h-4 w-4 shrink-0" />,
    PostgresSql: <PostgreSQLLogo className="h-4 w-4 shrink-0" />,
    Prisma: <PrismaLogo className="h-4 w-4 shrink-0" />,
    Vercel: <VercelLogo className="h-4 w-4 shrink-0" />,
    Stripe: <StripeLogo className="h-4 w-4 shrink-0" />,
    "TanStack Query": <TanStackQueryLogo className="h-4 w-4 shrink-0" />,
    "React Native": <ReactNativeLogo className="h-4 w-4 shrink-0" />,
    Expo: <ExpoLogo className="h-4 w-4 shrink-0" />,
    PlanetScale: <PlanetScaleLogo className="h-4 w-4 shrink-0" />,
    Upstash: <UpstashLogo className="h-4 w-4 shrink-0" />,
    Redis: <RedisLogo className="h-4 w-4 shrink-0" />,
    "Shadcn/ui": <ShadcnLogo className="h-4 w-4 shrink-0" />,
    WordPress: <WordPressLogo className="h-4 w-4 shrink-0" />,
    Sentry: <SentryLogo className="h-4 w-4 shrink-0" />,
    Pusher: <PusherLogo className="h-4 w-4 shrink-0" />,
    Railway: <RailwayLogo className="h-4 w-4 shrink-0" />,
  };

  return (
    logoMap[technology] || <IconCode className="h-4 w-4 text-neutral-600" />
  );
};

export const getLargeLogoForTechnology = (technology: string) => {
  const logoMap: Record<string, React.ReactNode> = {
    React: <ReactLogo className="h-6 w-6 shrink-0 dark:text-neutral-200" />,
    "Tailwind CSS": (
      <TailwindLogo className="h-6 w-6 shrink-0 dark:text-neutral-200" />
    ),
    "Next.js": <NextLogo className="h-6 w-6 shrink-0 dark:text-neutral-200" />,
    "Three.js": (
      <ThreeJSLogo className="h-6 w-6 shrink-0 dark:text-neutral-200" />
    ),
    TypeScript: <TypescriptLogo className="h-6 w-6 shrink-0" />,
    Redux: <ReduxLogo className="h-6 w-6 shrink-0" />,
    GraphQL: <GraphQLLogo className="h-6 w-6 shrink-0" />,
    Jest: <JestLogo className="h-6 w-6 shrink-0" />,
    Cypress: <CypressLogo className="h-6 w-6 shrink-0" />,
    Vitest: <VitestLogo className="h-6 w-6 shrink-0" />,
    JavaScript: <JavascriptLogo className="h-6 w-6 shrink-0" />,
    Azure: <AzureLogo className="h-6 w-6 shrink-0" />,
    WebRTC: <WebRTCLogo className="h-6 w-6 shrink-0" />,
    Webpack: <WebpackLogo className="h-6 w-6 shrink-0" />,
    MongoDB: <MongoDBIcon className="h-6 w-6 shrink-0" />,
    Express: <ExpressIcon className="h-6 w-6 shrink-0 dark:text-neutral-200" />,
    NodeJS: <NodejsIcon className="h-6 w-6 shrink-0" />,
    HTML5: <HTMLIcon className="h-6 w-6 shrink-0" />,
    CSS3: <CSSIcon className="h-6 w-6 shrink-0" />,
    SASS: <SCSSIcon className="h-6 w-6 shrink-0" />,
    Vue: <VueLogo className="h-6 w-6 shrink-0" />,
    "Nuxt.js": <NuxtLogo className="h-6 w-6 shrink-0" />,
    Squarespace: <SquarespaceLogo className="h-6 w-6 shrink-0" />,
    PostgresSql: <PostgreSQLLogo className="h-6 w-6 shrink-0" />,
    Prisma: <PrismaLogo className="h-6 w-6 shrink-0" />,
    Vercel: <VercelLogo className="h-6 w-6 shrink-0" />,
    Stripe: <StripeLogo className="h-6 w-6 shrink-0" />,
    "TanStack Query": <TanStackQueryLogo className="h-6 w-6 shrink-0" />,
    "React Native": <ReactNativeLogo className="h-6 w-6 shrink-0" />,
    Expo: <ExpoLogo className="h-6 w-6 shrink-0" />,
    PlanetScale: <PlanetScaleLogo className="h-6 w-6 shrink-0" />,
    Upstash: <UpstashLogo className="h-6 w-6 shrink-0" />,
    Redis: <RedisLogo className="h-6 w-6 shrink-0" />,
    "Shadcn/ui": <ShadcnLogo className="h-6 w-6 shrink-0" />,
    WordPress: <WordPressLogo className="h-6 w-6 shrink-0" />,
    Sentry: <SentryLogo className="h-6 w-6 shrink-0" />,
    Pusher: <PusherLogo className="h-6 w-6 shrink-0" />,
    Railway: <RailwayLogo className="h-6 w-6 shrink-0" />,
  };

  return (
    logoMap[technology] || <IconCode className="h-6 w-6 text-neutral-600" />
  );
};
