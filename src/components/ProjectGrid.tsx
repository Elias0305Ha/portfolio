"use client";

import { useRef } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";
import { useGridNavigation } from "@/hooks/useGridNavigation";

interface GridProps {
  readonly projects: readonly Project[];
  readonly featured?: boolean;
  readonly label: string;
}

export function ProjectGrid({ projects, featured = false, label }: GridProps) {
  const ref = useRef<HTMLUListElement>(null);
  const onKeyDown = useGridNavigation(ref);

  return (
    <ul
      ref={ref}
      onKeyDown={onKeyDown}
      aria-label={label}
      className={featured ? "featured-grid" : "project-grid"}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} featured={featured} />
      ))}
    </ul>
  );
}
