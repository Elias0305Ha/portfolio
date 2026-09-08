"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/types";
import { resolveMedia } from "@/types";

/**
 * Three exhaustive cases, so there is no path that renders an empty frame or a
 * grey box: an embed, an image, or an honest text-only card.
 */
export function ProjectMedia({ project }: { project: Project }) {
  const media = resolveMedia(project);
  const [loaded, setLoaded] = useState(false);

  if (media.kind === "text") return null;

  if (media.kind === "image") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface">
        {!loaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 motion-safe:animate-pulse bg-accent-soft"
          />
        )}
        <iframe
          src={media.src}
          title={media.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className={
            "absolute inset-0 h-full w-full motion-safe:transition-opacity motion-safe:duration-150 " +
            (loaded ? "opacity-100" : "opacity-0")
          }
        />
      </div>
      <a
        href={media.src}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent motion-safe:transition-colors motion-safe:duration-150"
      >
        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        Open full screen
      </a>
    </div>
  );
}
