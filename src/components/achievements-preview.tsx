"use client";
import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { achievements } from "@/constants/achievements";
import { cn } from "@/lib/utils";

export const AchievementsPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  // Get the most recent 3 achievements from the latest 2 years
  const recentAchievements = achievements
    .slice(0, 2) // Get the latest 2 years
    .flatMap(year => year.content)
    .slice(0, 3); // Take the first 3 achievements

  return (
    <div ref={ref} className="mt-6">
      <motion.h3
        initial={{
          filter: "blur(10px)",
          opacity: 0,
        }}
        animate={{
          filter: isInView ? "blur(0px)" : "blur(10px)",
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          delay: 0.1,
        }}
        className="mb-2 w-fit rounded-md px-2 py-0.5 font-bold text-neutral-900 shadow-[var(--shadow-aceternity)] dark:text-neutral-100"
      >
        Recent Achievements
      </motion.h3>
      <div className="flex flex-col gap-4">
        {recentAchievements.map((achievement, idx) => (
          <div key={achievement.title} className="pl-4">
            <Step isInView={isInView} idx={idx}>
              <motion.h3
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  y: isInView ? 0 : -10,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  delay: 0.2 * idx,
                }}
                className="text-neutral-600 dark:text-neutral-400"
              >
                {achievement.title}
              </motion.h3>
            </Step>
            {achievement.description && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  y: isInView ? 0 : -10,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  delay: 0.3 * idx,
                }}
                className="pt-1 pl-6 text-sm text-neutral-400 dark:text-neutral-500"
              >
                {achievement.description}
              </motion.p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Step = ({
  className,
  children,
  isInView,
  idx,
}: {
  className?: string;
  children: React.ReactNode;
  isInView: boolean;
  idx: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10,
      }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : -10,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
        delay: 0.2 * idx,
      }}
      className={cn("flex items-start gap-2", className)}
    >
      <IconCircleCheckFilled className="mt-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
      {children}
    </motion.div>
  );
};
