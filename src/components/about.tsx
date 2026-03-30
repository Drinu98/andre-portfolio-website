"use client";
import React from "react";
import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AchievementsPreview } from "./achievements-preview";

export const About = () => {
  return (
    <div className="shadow-section-inset dark:shadow-section-inset-dark my-0 border-y border-neutral-100 px-4 py-6 dark:border-neutral-800">
      <SectionHeading delay={0.1}>About Me</SectionHeading>
      
      <div className="flex flex-col gap-8 py-10 md:flex-row md:items-start">
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: 0.2,
            }}
            viewport={{ once: true }}
          >
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-base">
              I’m a self‑employed full‑stack developer who helps clients take ideas from
              concept to launch. I design the UI/UX, build the frontend and backend, and
              ship reliable systems that are easy to maintain.
            </p>
          </motion.div>

          {/* Mobile: Image appears here, hidden on desktop */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: 0.5,
            }}
            viewport={{ once: true }}
            className="flex justify-center md:hidden"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-lg"></div>
              <div className="relative overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
                <Image
                  src="/andre.webp"
                  alt="Andre Galea"
                  width={200}
                  height={200}
                  className="h-48 w-48 object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: 0.3,
            }}
            viewport={{ once: true }}
          >
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-base">
              I focus on clean architecture, performance, and great user experience - with
              practical deployment workflows so products don’t just look good, they run
              smoothly in production.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: 0.4,
            }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                Based in Malta
              </span>
            </div>
          </motion.div>
          
          <AchievementsPreview />
        </div>

        {/* Desktop: Profile Image */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            delay: 0.5,
          }}
          viewport={{ once: true }}
          className="hidden md:flex md:justify-end"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-lg"></div>
            <div className="relative overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
              <Image
                src="/andre.webp"
                alt="Andre Galea"
                width={200}
                height={200}
                className="h-56 w-56 object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
