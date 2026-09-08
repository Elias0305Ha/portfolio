import type { TrackId } from "./track";

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly tracks: readonly TrackId[];
  readonly tags: readonly string[];
  readonly pitch: string;
  readonly description: string;
  readonly stack: readonly string[];
  /** null for private or client work, so a card never links to a 404. */
  readonly repoUrl: string | null;
  readonly liveUrl: string | null;
  readonly embedUrl: string | null;
  readonly image: string | null;
  readonly year: number;
  /** Tracks where this project is promoted to the featured row. Must be a subset of tracks. */
  readonly highlight: readonly TrackId[];
}

/**
 * Discriminated union so a card never null-checks at render time. This is what
 * keeps non-null assertions out of the featured-card JSX, and what guarantees
 * we never render a broken frame or an empty grey box.
 */
export type ProjectMedia =
  | { readonly kind: "embed"; readonly src: string; readonly title: string }
  | { readonly kind: "image"; readonly src: string; readonly alt: string }
  | { readonly kind: "text" };

export function resolveMedia(project: Project): ProjectMedia {
  if (project.embedUrl !== null && project.embedUrl.length > 0) {
    return { kind: "embed", src: project.embedUrl, title: project.title + " — live demo" };
  }
  if (project.image !== null && project.image.length > 0) {
    return { kind: "image", src: project.image, alt: project.title + " screenshot" };
  }
  return { kind: "text" };
}
