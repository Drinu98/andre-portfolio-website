"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import { getLargeLogoForTechnology } from "@/utils/logo-mapper";
import { skillCategories } from "@/constants/skills";
import { focusKey } from "@/lib/stations";
import { Stage } from "./stage";

const SkillItem = ({
  technology,
  className,
}: {
  technology: string;
  className?: string;
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      layout
      whileHover={!isMobile ? "animate" : undefined}
      whileTap={!isMobile ? "animate" : undefined}
      initial="initial"
      animate={isMobile && isExpanded ? "animate" : "initial"}
      onClick={handleClick}
      className={cn(
        "mr-2 flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-4 py-4 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800",
        isMobile && "cursor-pointer",
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

export const Skills = () => {
  return (
    <div className="shadow-section-inset dark:shadow-section-inset-dark my-0 border-y border-neutral-100 px-4 py-6 dark:border-neutral-800">
      <SectionHeading delay={0.1}>Skills & Technologies</SectionHeading>

      <div className="grid gap-8 py-10 md:grid-cols-[1fr_19rem]">
        <Stage
          station="skills"
          className="h-64 md:sticky md:top-24 md:order-2 md:h-80 md:self-start"
        />
        <div className="space-y-8">
          {skillCategories.map((category, categoryIndex) => {
            const delay = 0.1 * (categoryIndex + 1);
            return (
              <motion.div
                key={category.title}
                data-focus={focusKey.skill(category.key)}
                data-focus-auto
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                  delay,
                }}
                viewport={{ once: true }}
                className="group space-y-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-800 md:text-base dark:text-neutral-200">
                  {category.title}
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100 group-data-[lit]:opacity-100" />
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
                          delay: delay + skillIndex * 0.05,
                        }}
                        viewport={{ once: true }}
                      >
                        <SkillItem
                          technology={skill}
                          className="transition-transform duration-200 hover:scale-110"
                        />
                      </motion.div>
                    ))}
                  </LayoutGroup>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
