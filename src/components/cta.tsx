import React from "react";
import { SectionHeading } from "./section-heading";
import { Subheading } from "./subheading";

export const CTA = () => {
  return (
    <div className="my-4 px-4 py-6">
      <SectionHeading delay={0.2}>Get in touch</SectionHeading>
      <p className="text-secondary max-w-lg pt-4 text-sm md:text-base">
        I'm currently looking for new opportunities. Whether you have a question
        or want to say hi, hit that button.
      </p>
      <div className="relative mt-4 max-w-lg">
        <input
          type="email"
          placeholder="Your email"
          className="w-full rounded-lg bg-white px-4 py-3 pr-[120px] text-sm text-neutral-700 shadow-[var(--shadow-aceternity)] focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:bg-neutral-800 dark:text-neutral-200"
        />
        <a
          href="mailto:tyler@durden.com"
          className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 shadow-[0px_4px_8px_0px_var(--color-neutral-200)_inset] transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0px_4px_8px_0px_var(--color-neutral-700)_inset]"
        >
          Send Enquiry
        </a>
      </div>
    </div>
  );
};
