import Image from "next/image";
import React from "react";
import { achievements } from "@/constants/achievements";
import { focusKey } from "@/lib/stations";
import { siteConfig } from "@/lib/site";
import { SectionHead } from "../section-head";

// The three most recent entries from the latest two years.
const recentAchievements = achievements
  .slice(0, 2)
  .flatMap((year) => year.content)
  .slice(0, 3);

export const About = () => {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="about" title="About me" />

          <div className="about" data-reveal>
            <figure className="portrait">
              <Image
                src="/andre.webp"
                alt={siteConfig.name}
                width={296}
                height={370}
                sizes="148px"
              />
              <figcaption className="mono">Plate 01 · Portrait</figcaption>
            </figure>

            <div className="about__copy">
              <p>
                I’m a self‑employed full‑stack developer who helps clients take
                ideas from concept to launch. I design the UI/UX, build the
                frontend and backend, and ship reliable systems that are easy to
                maintain.
              </p>
              <p>
                I focus on clean architecture, performance, and great user
                experience, with practical deployment workflows so products
                don’t just look good, they run smoothly in production.
              </p>
              <p className="place" data-focus={focusKey.place("malta")}>
                <span className="signal" aria-hidden="true" />
                Based in Malta
                <span className="mono">35.90°N 14.51°E</span>
              </p>
            </div>
          </div>

          <div className="achievements" data-reveal>
            <h3 className="mono">Recent achievements</h3>
            <ol>
              {recentAchievements.map((achievement, index) => (
                <li key={achievement.title}>
                  <span className="mono">0{index + 1}</span>
                  <div>
                    <h4>{achievement.title}</h4>
                    {achievement.description && (
                      <p>{achievement.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
