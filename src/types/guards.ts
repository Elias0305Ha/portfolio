import type { Project } from "./project";
import type { TrackConfig, TracksConfig } from "./track";
import { TRACK_IDS, isSortKey, isTrackId } from "./track";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTrackIdArray(value: unknown): value is Project["tracks"] {
  return Array.isArray(value) && value.every(isTrackId);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/**
 * Validates one entry of projects.json. Runs once at module load, so malformed
 * data fails the build instead of hydrating a broken card in front of a recruiter.
 */
export function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.length === 0) return false;
  if (typeof value.title !== "string") return false;
  if (!isTrackIdArray(value.tracks) || value.tracks.length === 0) return false;
  if (!isStringArray(value.tags)) return false;
  if (typeof value.pitch !== "string") return false;
  if (typeof value.description !== "string") return false;
  if (!isStringArray(value.stack)) return false;
  if (typeof value.repoUrl !== "string") return false;
  if (!isNullableString(value.liveUrl)) return false;
  if (!isNullableString(value.embedUrl)) return false;
  if (!isNullableString(value.image)) return false;
  if (typeof value.year !== "number" || !Number.isInteger(value.year)) return false;
  if (!isTrackIdArray(value.highlight)) return false;

  const tracks = value.tracks;
  return value.highlight.every((track) => tracks.includes(track));
}

function isTrackConfig(value: unknown, expectedId: string): value is TrackConfig {
  return (
    isRecord(value) &&
    value.id === expectedId &&
    typeof value.name === "string" &&
    typeof value.tagline === "string" &&
    isSortKey(value.defaultSort)
  );
}

export function isTracksConfig(value: unknown): value is TracksConfig {
  if (!isRecord(value)) return false;
  return TRACK_IDS.every((id) => isTrackConfig(value[id], id));
}
