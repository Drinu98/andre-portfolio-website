import Image from "next/image";
import Link from "next/link";
import React from "react";
import { hostOf, isExternal, projects } from "@/constants/projects";
import { focusKey } from "@/lib/stations";
import { projectPath } from "@/lib/structured-data";
import { SectionHead } from "../section-head";

export const Work = () => {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="projects" title="Selected work">
            Websites, web apps and internal systems I’ve designed and built,
            most of them for businesses in Malta. Open a project to read how it
            was made.
          </SectionHead>

          <div>
            {projects.map((project, index) => {
              const external = isExternal(project.href);
              return (
                <article
                  key={project.title}
                  className="work"
                  data-focus={focusKey.project(project.title)}
                  data-focus-auto
                  data-reveal
                >
                  <div className="work__media">
                    <Image
                      src={project.src}
                      alt={project.alt}
                      width={392}
                      height={280}
                      sizes="(min-width: 600px) 196px, 100vw"
                    />
                  </div>
                  <div className="work__body">
                    <p className="mono work__top">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{project.stack.length} tools</span>
                    </p>
                    <h3>
                      <Link href={projectPath(project)}>{project.title}</Link>
                    </h3>
                    <p>{project.description}</p>
                    <ul
                      className="tags"
                      aria-label={`${project.title} technologies`}
                    >
                      {project.stack.map((technology) => (
                        <li key={technology} className="tag">
                          {technology}
                        </li>
                      ))}
                    </ul>
                    {external ? (
                      <a
                        className="mono work__visit"
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {hostOf(project.href)}{" "}
                        <span className="arrow" aria-hidden="true">
                          ↗
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <p className="mono work__visit">Internal system</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
