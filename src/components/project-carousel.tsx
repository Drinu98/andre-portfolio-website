"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { ProjectImage } from "@/constants/projects";

const INTERVAL = 4000;

/** Cross-fades through a project's screenshots, one every few seconds. */
export const ProjectCarousel = ({ images }: { images: ProjectImage[] }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % images.length),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [paused, images.length]);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="carousel__slides">
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={1200}
            height={857}
            sizes="(min-width: 960px) 46vw, 100vw"
            priority={index === 0}
            aria-hidden={index !== active}
            data-active={index === active || undefined}
          />
        ))}
      </div>
      <div className="carousel__dots">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show screenshot ${index + 1} of ${images.length}`}
            aria-current={index === active || undefined}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
};
