"use client";
import { useEffect } from "react";

/** Fades in every `[data-reveal]` element the first time it scrolls into view. */
export const RevealObserver = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    for (const el of document.querySelectorAll("[data-reveal]"))
      observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
};
