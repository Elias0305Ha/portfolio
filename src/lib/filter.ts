import type { AudienceId, FilterState, Project, SortKey, TagCount } from "@/types";
import { matchesQuery } from "@/lib/search";
import { TRACKS } from "@/lib/data";

/** An explicit ?sort wins; otherwise the track decides how its work is ordered. */
export function resolveSort(filters: FilterState): SortKey {
  if (filters.sort !== null) return filters.sort;
  return filters.track === "all" ? "year-desc" : TRACKS[filters.track].defaultSort;
}

export function inAudience(project: Project, audience: AudienceId): boolean {
  return audience === "all" || project.tracks.includes(audience);
}

export function sortProjects(projects: readonly Project[], sort: SortKey): readonly Project[] {
  const copy = [...projects];
  switch (sort) {
    case "year-asc":
      return copy.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    case "title-asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "year-desc":
      return copy.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  }
}

/**
 * Featured set for the current audience. On a track, it is that track's
 * `highlight` list; on "all", it is anything highlighted anywhere.
 */
export function featuredFor(
  projects: readonly Project[],
  audience: AudienceId,
): readonly Project[] {
  const featured = projects.filter((project) =>
    audience === "all" ? project.highlight.length > 0 : project.highlight.includes(audience),
  );
  return sortProjects(featured, "year-desc");
}

/** Tags ordered by how often they occur inside the current audience, then alphabetically. */
export function tagCountsFor(projects: readonly Project[], audience: AudienceId): TagCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    if (!inAudience(project, audience)) continue;
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]): TagCount => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** A project must carry every selected tag, not just one of them. */
function matchesTags(project: Project, tags: readonly string[]): boolean {
  if (tags.length === 0) return true;
  const owned = new Set(project.tags.map((tag) => tag.toLowerCase()));
  return tags.every((tag) => owned.has(tag));
}

export interface FilterResult {
  /** The featured row. Empty once the visitor narrows the view themselves. */
  readonly featured: readonly Project[];
  /** The archive grid. */
  readonly results: readonly Project[];
  readonly total: number;
  readonly narrowed: boolean;
}

export function applyFilters(
  projects: readonly Project[],
  filters: FilterState,
): FilterResult {
  const inTrack = projects.filter((project) => inAudience(project, filters.track));
  const matched = inTrack.filter(
    (project) => matchesTags(project, filters.tags) && matchesQuery(project, filters.q),
  );
  const narrowed = filters.tags.length > 0 || filters.q.length > 0;
  const sort = resolveSort(filters);

  if (narrowed) {
    return {
      featured: [],
      results: sortProjects(matched, sort),
      total: matched.length,
      narrowed,
    };
  }

  const featured = featuredFor(matched, filters.track);
  const featuredIds = new Set(featured.map((project) => project.id));
  const rest = matched.filter((project) => !featuredIds.has(project.id));

  return {
    featured,
    results: sortProjects(rest, sort),
    total: matched.length,
    narrowed,
  };
}
