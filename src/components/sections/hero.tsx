import React from "react";
import { focusKey, stackLayers } from "@/lib/stations";
import { siteConfig } from "@/lib/site";

const roles = [
  "Software Engineer",
  "Design Engineer",
  "Full Stack Engineer",
  "Front-end Engineer",
];

export const Hero = () => {
  return (
    <section id="home" className="hero" aria-labelledby="home-title">
      <div className="wrap">
        <div className="col" data-col>
          <p className="mono eyebrow" data-reveal>
            <span className="signal" aria-hidden="true" />
            Full-stack developer · Malta
          </p>

          <h1
            id="home-title"
            data-reveal
            style={{ "--d": "80ms" } as React.CSSProperties}
          >
            <span className="mono hero__name">{siteConfig.name}</span>
            <span className="hero__statement">
              Concept to launch, <em>end to end.</em>
            </span>
          </h1>

          <p
            className="hero__lede"
            data-reveal
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            I’m a self‑employed full‑stack developer who designs and builds
            end‑to‑end products, from UI/UX to backend and deployment.
          </p>

          <div
            className="mono hero__role"
            data-reveal
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            <span>Works as</span>
            {/* The first role is repeated so the loop has no visible seam. */}
            <ul>
              {[...roles, roles[0]].map((role, index) => (
                <li
                  key={index}
                  aria-hidden={index === roles.length || undefined}
                >
                  {role}
                </li>
              ))}
            </ul>
          </div>

          <ul
            className="layers"
            aria-label="The layers of a build"
            data-reveal
            style={{ "--d": "280ms" } as React.CSSProperties}
          >
            {stackLayers.map((layer, index) => (
              <li key={layer.key} data-focus={focusKey.layer(layer.key)}>
                <span className="mono">0{index + 1}</span>
                {layer.title}
              </li>
            ))}
          </ul>

          <div
            className="actions"
            data-reveal
            style={{ "--d": "340ms" } as React.CSSProperties}
          >
            <a className="button" href="#projects">
              See selected work{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a className="link" href="#contact">
              Get in touch{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
