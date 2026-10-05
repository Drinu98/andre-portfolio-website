import React from "react";
import { experience } from "@/constants/experience";
import { focusKey } from "@/lib/stations";
import { SectionHead } from "../section-head";

export const Experience = () => {
  return (
    <section
      id="experience"
      className="section section--flip"
      aria-labelledby="experience-title"
    >
      <div className="wrap">
        <div className="col">
          <SectionHead station="experience" title="Experience">
            Software engineering since 2020: a gaming company’s website, a
            bank’s internal applications, and now client work of my own.
          </SectionHead>

          <div>
            {experience.map((job) => {
              const points = Array.isArray(job.description)
                ? job.description
                : [job.description];
              return (
                <article
                  key={job.company}
                  className="job"
                  data-focus={focusKey.job(job.company)}
                  data-focus-auto
                  data-reveal
                >
                  <div className="job__top">
                    <h3>{job.company}</h3>
                    <span className="mono">
                      {job.startDate} – {job.endDate}
                    </span>
                  </div>
                  <p className="job__role">
                    {job.designation} · {job.location}
                  </p>
                  <ul className="job__points">
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <ul
                    className="tags"
                    aria-label={`${job.company} technologies`}
                  >
                    {job.stack.map((technology) => (
                      <li key={technology} className="tag">
                        {technology}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
