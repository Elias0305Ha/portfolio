import type { AudienceId, FilterState, SortKey } from "@/types";
import { DEFAULT_FILTERS, isAudienceId, isSortKey } from "@/types";

/** Shape Next.js hands a server page for `searchParams`. */
export type RawSearchParams = Readonly<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseTags(raw: string | undefined): readonly string[] {
  if (raw === undefined) return [];
  const tags = raw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(tags)).sort();
}

function parseParts(
  track: string | undefined,
  tags: string | undefined,
  q: string | undefined,
  sort: string | undefined,
): FilterState {
  const audience: AudienceId = isAudienceId(track) ? track : DEFAULT_FILTERS.track;
  const sortKey: SortKey | null = isSortKey(sort) ? sort : null;
  return {
    track: audience,
    tags: parseTags(tags),
    q: q === undefined ? "" : q.slice(0, 120),
    sort: sortKey,
  };
}

/** Server side: read the filter state straight out of the request URL. */
export function filtersFromRawParams(params: RawSearchParams): FilterState {
  return parseParts(
    firstValue(params.track),
    firstValue(params.tags),
    firstValue(params.q),
    firstValue(params.sort),
  );
}

/** Client side: read the same state back out of `useSearchParams`. */
export function filtersFromSearchParams(params: URLSearchParams): FilterState {
  return parseParts(
    params.get("track") ?? undefined,
    params.get("tags") ?? undefined,
    params.get("q") ?? undefined,
    params.get("sort") ?? undefined,
  );
}

/**
 * Only non-default values are written, so a clean view has a clean URL and
 * every distinct view has exactly one address.
 */
export function filtersToQueryString(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.track !== DEFAULT_FILTERS.track) params.set("track", filters.track);
  if (filters.tags.length > 0) params.set("tags", [...filters.tags].sort().join(","));
  if (filters.q.length > 0) params.set("q", filters.q);
  if (filters.sort !== null) params.set("sort", filters.sort);
  return params.toString();
}

export function filtersToHref(filters: FilterState, pathname: string): string {
  const query = filtersToQueryString(filters);
  return query.length > 0 ? pathname + "?" + query : pathname;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return filters.tags.length > 0 || filters.q.length > 0;
}
