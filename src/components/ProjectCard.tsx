"use client";

import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import type { Project } from "@/types";
import { ProjectMedia } from "@/components/ProjectMedia";

function TagList({ tags }: { tags: readonly string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

interface CardProps {
  readonly project: Project;
  readonly featured?: boolean;
}

export function ProjectCard({ project, featured = false }: CardProps) {
  return (
    <li>
      <article className="group relative flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-4 motion-safe:transition motion-safe:duration-150 hover:border-accent focus-within:border-accent">
        {featured && <ProjectMedia project={project} />}

        <div className="project-card-body flex flex-col gap-1">
          <h3 className="text-base font-semibold leading-snug">
            {/* The whole card is the hit area; the link stays the accessible name. */}
            <Link
              href={"/projects/" + project.id}
              data-card
              className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
            >
              {project.title}
            </Link>
          </h3>
          <p className="text-xs text-muted">{project.year}</p>
        </div>

        <p className="text-sm leading-relaxed text-ink/90">{project.pitch}</p>

        {featured && (
          <p className="project-card-description text-sm leading-relaxed text-muted">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <TagList tags={project.tags} />
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Code2 aria-hidden="true" className="h-3.5 w-3.5" />
              {project.stack.slice(0, 3).join(" · ")}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="ml-auto h-4 w-4 opacity-0 motion-safe:transition-opacity motion-safe:duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </div>
        </div>
      </article>
    </li>
  );
}
