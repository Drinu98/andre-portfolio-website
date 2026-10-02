import React from "react";
import { skillCategories } from "@/constants/skills";
import { focusKey } from "@/lib/stations";
import { SectionHead } from "../section-head";

export const Toolkit = () => {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="skills" title="Skills & technologies">
            One ring per discipline. Hover a group and its orbit lights up.
          </SectionHead>

          <div>
            {skillCategories.map((category, index) => (
              <article
                key={category.key}
                className="kit"
                data-focus={focusKey.skill(category.key)}
                data-focus-auto
                data-reveal
              >
                <div className="kit__title">
                  <span className="mono">
                    0{index + 1} ·{" "}
                    {String(category.skills.length).padStart(2, "0")} tools
                  </span>
                  <h3>{category.title}</h3>
                </div>
                <ul className="tags" aria-label={`${category.title} tools`}>
                  {category.skills.map((skill) => (
                    <li key={skill} className="tag">
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
