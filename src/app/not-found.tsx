import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/constants/projects";
import { stations } from "@/lib/stations";
import { projectPath } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="col">
          <header className="section-head">
            <p className="mono section-head__meta">
              <span>
                Error <b>404</b>
              </span>
              <span>Page not found</span>
              <span>Fig. Missing</span>
            </p>
            <h1>This sheet is missing.</h1>
            <p>
              The page you were looking for has moved or never existed.
              Everything on the site is one click from here.
            </p>
          </header>

          <div className="actions">
            <a className="button" href="/">
              Back to the homepage{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>

          <h2 className="mono">Sections</h2>
          <ul className="tags">
            {stations
              .filter((station) => station.id !== "home")
              .map((station) => (
                <li key={station.id}>
                  <a className="tag" href={`/#${station.id}`}>
                    {station.nav}
                  </a>
                </li>
              ))}
          </ul>

          <h2 className="mono">Projects</h2>
          <ul className="tags">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link className="tag" href={projectPath(project)}>
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
