"use client";
import React from "react";
import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { StackItem } from "./stack-item";
import { LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import { getLargeLogoForTechnology } from "@/utils/logo-mapper";

type SkillCategory = {
  title: string;
  skills: string[];
  delay?: number;
};

const SkillItem = ({ technology, className }: { technology: string; className?: string }) => {
  return (
    <motion.div
      layout
      whileHover="animate"
      whileTap="animate"
      initial="initial"
      className={cn(
        "flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-4 py-4 text-sm mr-2 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
    >
      <motion.span
        variants={{
          animate: { paddingRight: 4 },
        }}
        transition={{
          type: "spring",
        }}
        className="mr-0 px-0"
      >
        {getLargeLogoForTechnology(technology)}
      </motion.span>
      <motion.span
        variants={{
          initial: { width: 0 },
          animate: { width: "auto" },
          exit: { width: 0 },
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.5,
        }}
        className="overflow-hidden whitespace-nowrap text-neutral-500 dark:text-neutral-200"
      >
        {technology}
      </motion.span>
    </motion.div>
  );
};

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Shadcn/ui", "HTML5", "CSS3", "React Native", "Expo"],
    delay: 0.1,
  },
  {
    title: "Backend",
    skills: ["NodeJS", "Express", "PostgresSql", "Prisma", "PlanetScale", "Redis"],
    delay: 0.2,
  },
  {
    title: "Tools & Platforms",
    skills: ["Vercel", "Stripe", "Upstash", "Cypress"],
    delay: 0.3,
  },
  {
    title: "CMS & Website Builders",
    skills: ["Squarespace"],
    delay: 0.4,
  },
];

export const Skills = () => {
  return (
    <div className="shadow-section-inset dark:shadow-section-inset-dark my-0 border-y border-neutral-100 px-4 py-6 dark:border-neutral-800">
      <SectionHeading delay={0.1}>Skills & Technologies</SectionHeading>
      
      <div className="space-y-8 py-10">
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: category.delay,
            }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 md:text-base">
              {category.title}
            </h3>
            
            <div className="flex flex-wrap gap-3">
              <LayoutGroup>
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      delay: category.delay! + skillIndex * 0.05,
                    }}
                    viewport={{ once: true }}
                  >
                    <SkillItem
                      technology={skill}
                      className="hover:scale-110 transition-transform duration-200"
                    />
                  </motion.div>
                ))}
              </LayoutGroup>
            </div>
          </motion.div>
        ))}
        
      </div>
    </div>
  );
};
