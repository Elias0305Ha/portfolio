import type { Project } from "@/types";
import { PROJECTS } from "@/lib/data";
import { SITE } from "@/lib/site";

type JsonLd = Record<string, unknown>;

export function personJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    sameAs: [SITE.github],
    description: SITE.description,
    knowsAbout: [...new Set(PROJECTS.flatMap((project) => project.stack))].sort(),
  };
}

export function projectJsonLd(project: Project): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.pitch,
    abstract: project.description,
    codeRepository: project.repoUrl,
    programmingLanguage: [...project.stack],
    keywords: [...project.tags].join(", "),
    dateCreated: String(project.year),
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    url: SITE.url + "/projects/" + project.id,
  };
}
