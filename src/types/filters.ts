import type { Project } from "./project";
import type { AudienceId, SortKey } from "./track";

export type Density = "grid" | "list";

/** Everything here is serialized to, and restored from, the URL. */
export interface FilterState {
  readonly track: AudienceId;
  readonly tags: readonly string[];
  readonly q: string;
  /** null means "whatever this track's defaultSort says". */
  readonly sort: SortKey | null;
}

export const DEFAULT_FILTERS: FilterState = {
  track: "all",
  tags: [],
  q: "",
  sort: null,
};

export interface TagCount {
  readonly tag: string;
  readonly count: number;
}

export interface SearchHit {
  readonly project: Project;
  readonly score: number;
  /** Which field matched, shown as the palette's secondary line. */
  readonly field: "title" | "pitch" | "tags" | "stack";
}
