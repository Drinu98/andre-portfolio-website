"use client";
import { AnimationProps, motion } from "motion/react";
import React from "react";

export const MotionDiv = (
  props: AnimationProps & { children?: React.ReactNode },
) => {
  return <motion.div {...props} />;
};
