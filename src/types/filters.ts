import type { Project } from "./project";
import type { AudienceId, SortKey } from "./track";

export type Density = "grid" | "list";

/** Everything here is serialized to, and restored from, the URL. */
export interface FilterState {
  readonly track: AudienceId;
  readonly tags: readonly string[];
  readonly q: string;
  readonly sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  track: "all",
  tags: [],
  q: "",
  sort: "year-desc",
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
