import Image from "next/image";
import React from "react";
import { projects } from "@/constants/projects";
import { focusKey } from "@/lib/stations";
import { SectionHead } from "../section-head";

const isExternal = (href: string) => /^https?:\/\//.test(href);
const hostOf = (href: string) => new URL(href).host.replace(/^www\./, "");

export const Work = () => {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="projects" title="I love building things">
            The reel turns as you read. Hover a project to bring its screen to
            the front.
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
                      alt=""
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
                      {external ? (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.title}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        project.title
                      )}
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
                    <p
                      className="mono work__visit"
                      aria-hidden={external || undefined}
                    >
                      {external ? (
                        <>
                          {hostOf(project.href)}{" "}
                          <span className="arrow">↗</span>
                        </>
                      ) : (
                        "Internal system"
                      )}
                    </p>
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
