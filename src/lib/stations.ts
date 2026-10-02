import { projects } from "@/constants/projects";
import { skillCategories, skillCount } from "@/constants/skills";

/**
 * A station is a page section paired with one arrangement of the sculpture.
 * The same blocks are reused for every station; only their positions change.
 */
export const stations = [
  {
    id: "home",
    figure: "Assembly",
    caption: "Four layers, one stack.",
  },
  {
    id: "about",
    figure: "Island",
    caption: "Malta, in blocks.",
  },
  {
    id: "skills",
    figure: "Orbits",
    caption: `${skillCount} tools, ${skillCategories.length} rings.`,
  },
  {
    id: "projects",
    figure: "Skyline",
    caption: `${projects.length} builds, sized by stack.`,
  },
  {
    id: "experience",
    figure: "Helix",
    caption: "2020 to now.",
  },
  {
    id: "contact",
    figure: "Signal",
    caption: "Ripples on send.",
  },
] as const;

export type StationId = (typeof stations)[number]["id"];

export const stackLayers = [
  { key: "ui", title: "UI/UX" },
  { key: "frontend", title: "Frontend" },
  { key: "backend", title: "Backend" },
  { key: "deploy", title: "Deployment" },
] as const;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Focus keys link a DOM element (`data-focus`) to a group of blocks. */
export const focusKey = {
  layer: (key: string) => `layer:${key}`,
  place: (key: string) => `place:${key}`,
  skill: (key: string) => `skill:${key}`,
  project: (title: string) => `project:${slugify(title)}`,
  job: (company: string) => `job:${slugify(company)}`,
};
