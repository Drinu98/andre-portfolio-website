import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { hostOf, isExternal, projects } from "@/constants/projects";
import { pageMetadata } from "@/lib/metadata";
import { projectJsonLd, projectPath } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = () =>
  projects.map((project) => ({ slug: project.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title} — ${project.kind}`,
    description: project.description,
    path: projectPath(project),
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();

  const project = projects[index];
  const previous = projects[index - 1];
  const next = projects[index + 1];
  const external = isExternal(project.href);

  return (
    <article className="page">
      <JsonLd data={projectJsonLd(project)} />
      <div className="wrap case">
        <div>
          <nav className="mono crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <a href="/#projects">Work</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.title}</span>
          </nav>

          <header className="section-head">
            <p className="mono section-head__meta">
              <span>
                Project <b>{String(index + 1).padStart(2, "0")}</b>
              </span>
              <span>{project.kind}</span>
              <span>{project.stack.length} tools</span>
            </p>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </header>

          <div className="case__copy">
            {project.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2 className="mono">What it includes</h2>
          <ul className="job__points">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          <h2 className="mono">Built with</h2>
          <ul className="tags">
            {project.stack.map((technology) => (
              <li key={technology} className="tag">
                {technology}
              </li>
            ))}
          </ul>

          <div className="actions">
            {external && (
              <a
                className="button"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {hostOf(project.href)}{" "}
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <a className="link" href="/#contact">
              Start a project like this{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        <figure className="case__media">
          <Image
            src={project.src}
            alt={project.alt}
            width={1200}
            height={857}
            sizes="(min-width: 960px) 46vw, 100vw"
            priority
          />
          <figcaption className="mono">
            {external ? hostOf(project.href) : "Internal system"}
          </figcaption>
        </figure>
      </div>

      <nav className="wrap case__more" aria-label="More projects">
        {previous && (
          <Link href={projectPath(previous)}>
            <span className="mono">← Previous</span>
            {previous.title}
          </Link>
        )}
        {next && (
          <Link className="case__next" href={projectPath(next)}>
            <span className="mono">Next →</span>
            {next.title}
          </Link>
        )}
      </nav>
    </article>
  );
}
