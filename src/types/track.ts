export const TRACK_IDS = ["data", "ai", "engineering"] as const;
export type TrackId = (typeof TRACK_IDS)[number];

/** What the audience switcher can be set to. "all" is a view, not a track. */
export type AudienceId = TrackId | "all";
export const AUDIENCE_IDS: readonly AudienceId[] = ["all", ...TRACK_IDS];

export const SORT_KEYS = ["year-desc", "year-asc", "title-asc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface TrackConfig {
  readonly id: TrackId;
  readonly name: string;
  readonly tagline: string;
  readonly defaultSort: SortKey;
}

/** Exhaustive: adding a TrackId is a compile error until tracks.json covers it. */
export type TracksConfig = Readonly<Record<TrackId, TrackConfig>>;

export function isTrackId(value: unknown): value is TrackId {
  return typeof value === "string" && TRACK_IDS.some((t) => t === value);
}

export function isAudienceId(value: unknown): value is AudienceId {
  return value === "all" || isTrackId(value);
}

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && SORT_KEYS.some((s) => s === value);
}
