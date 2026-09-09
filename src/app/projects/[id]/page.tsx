import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Code2 } from "lucide-react";
import { PROJECTS, TRACKS, getProject } from "@/lib/data";
import { projectJsonLd } from "@/lib/jsonld";
import { ProjectMedia } from "@/components/ProjectMedia";

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export function generateStaticParams(): { id: string }[] {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (project === undefined) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.pitch,
    openGraph: { title: project.title, description: project.pitch },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (project === undefined) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }}
      />

      <Link
        href="/"
        className="no-print inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent motion-safe:transition-colors motion-safe:duration-150"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All projects
      </Link>

      <article className="mt-6 space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
          <p className="text-base leading-relaxed text-ink/90">{project.pitch}</p>
          <p className="text-xs text-muted">
            {project.year} ·{" "}
            {project.tracks.map((track) => TRACKS[track].name).join(" · ")}
          </p>
        </header>

        <ProjectMedia project={project} />

        <p className="leading-relaxed text-muted">{project.description}</p>

        <section aria-labelledby="stack-heading" className="space-y-2">
          <h2 id="stack-heading" className="text-sm font-medium uppercase tracking-wide text-muted">
            Stack
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line px-2.5 py-1 text-xs text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-muted">
          Filed under{" "}
          {project.tags.map((tag, index) => (
            <span key={tag}>
              {index > 0 && " · "}
              <Link
                href={"/?tags=" + encodeURIComponent(tag)}
                className="underline decoration-line underline-offset-4 hover:text-accent motion-safe:transition-colors motion-safe:duration-150"
              >
                {tag}
              </Link>
            </span>
          ))}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {project.repoUrl === null ? (
            <p className="text-sm text-muted">
              Source is private; this was built for a client.
            </p>
          ) : (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:border-accent motion-safe:transition motion-safe:duration-150"
            >
              <Code2 aria-hidden="true" className="h-4 w-4" />
              Source
            </a>
          )}
          {project.liveUrl !== null && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-ink motion-safe:transition motion-safe:duration-150"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Live
            </a>
          )}
        </div>
      </article>
    </main>
  );
}
