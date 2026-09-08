import projectsJson from "@/data/projects.json";
import tracksJson from "@/data/tracks.json";
import type { Project, TrackId, TracksConfig } from "@/types";
import { TRACK_IDS, isProject, isTracksConfig } from "@/types";

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function loadProjects(): readonly Project[] {
  const raw: unknown = projectsJson;
  if (!isUnknownArray(raw)) {
    throw new Error("src/data/projects.json must contain an array.");
  }

  const seen = new Set<string>();
  return raw.map((entry, index) => {
    if (!isProject(entry)) {
      throw new Error(
        "src/data/projects.json[" +
          index +
          "] is not a valid Project. Check tracks/highlight values and that highlight is a subset of tracks.",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error("src/data/projects.json has a duplicate id: " + entry.id);
    }
    seen.add(entry.id);
    return entry;
  });
}

function loadTracks(): TracksConfig {
  const raw: unknown = tracksJson;
  if (!isTracksConfig(raw)) {
    throw new Error("src/data/tracks.json is missing a track or has an invalid defaultSort.");
  }
  return raw;
}

/** Validated once at module load, so bad data fails the build, not the browser. */
export const PROJECTS: readonly Project[] = loadProjects();
export const TRACKS: TracksConfig = loadTracks();

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export function projectsInTrack(track: TrackId): readonly Project[] {
  return PROJECTS.filter((project) => project.tracks.includes(track));
}

/** Tracks that actually have at least one project, so the switcher never offers an empty view. */
export const POPULATED_TRACKS: readonly TrackId[] = TRACK_IDS.filter(
  (track) => projectsInTrack(track).length > 0,
);
