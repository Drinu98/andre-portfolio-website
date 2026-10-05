import Image from "next/image";
import React from "react";
import { achievements } from "@/constants/achievements";
import { services } from "@/constants/services";
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
          <SectionHead
            station="about"
            title="A freelance developer based in Malta"
          />

          <div className="about" data-reveal>
            <figure className="portrait">
              <Image
                src="/andre.webp"
                alt={`Portrait of ${siteConfig.name}, full-stack developer based in Malta`}
                width={296}
                height={370}
                sizes="148px"
              />
              <figcaption className="mono">Plate 01 · Portrait</figcaption>
            </figure>

            <div className="about__copy">
              <p>
                I’m a freelance full-stack developer based in Malta, and I help
                clients take ideas from concept to launch. I design the UI/UX,
                build the frontend and backend, and ship reliable systems that
                are easy to maintain.
              </p>
              <p>
                I work with businesses in Malta and remotely with clients
                worldwide. I focus on clean architecture, performance, and
                great user experience, with practical deployment workflows so
                products don’t just look good, they run smoothly in production.
              </p>
              <p className="place" data-focus={focusKey.place("malta")}>
                <span className="signal" aria-hidden="true" />
                Based in Malta
                <span className="mono">35.91°N 14.48°E</span>
              </p>
            </div>
          </div>

          <div className="entries" data-reveal>
            <h3 className="mono">What I can build for you</h3>
            <ol>
              {services.map((service, index) => (
                <li key={service.title}>
                  <span className="mono">0{index + 1}</span>
                  <div>
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="entries" data-reveal>
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
