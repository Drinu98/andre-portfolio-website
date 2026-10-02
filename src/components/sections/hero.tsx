import React from "react";
import { focusKey, stackLayers } from "@/lib/stations";
import { siteConfig } from "@/lib/site";

const roles = [
  "Software Engineer",
  "Design Engineer",
  "Full Stack Engineer",
  "Front-end Engineer",
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/**
 * On wide screens the hero is laid out like a poster: the sculpture holds the
 * middle of the sheet and the copy sits in the corners around it.
 */
export const Hero = () => {
  return (
    <section id="home" className="hero" aria-labelledby="home-title">
      <div className="wrap hero__grid">
        <h1 id="home-title" className="hero__title">
          <span className="mono hero__name" data-reveal>
            {siteConfig.name} — Full‑stack developer, Malta
          </span>
          <span className="hero__line" data-reveal style={delay(80)}>
            Concept to launch,
          </span>
          <span
            className="hero__line hero__line--end"
            data-reveal
            style={delay(160)}
          >
            end to end.
          </span>
        </h1>

        <div className="hero__intro" data-reveal style={delay(240)}>
          <p className="hero__lede">
            I’m a self‑employed full‑stack developer who designs and builds
            end‑to‑end products, from UI/UX to backend and deployment.
          </p>

          <div className="mono hero__role">
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

          <div className="actions">
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

        {/* A key to the sculpture: each row lights one slab of the stack. */}
        <div className="legend" data-reveal style={delay(320)}>
          <p className="mono">Key · The stack</p>
          <ul className="layers">
            {stackLayers.map((layer, index) => (
              <li key={layer.key} data-focus={focusKey.layer(layer.key)}>
                {layer.title}
                <span className="mono">0{index + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
