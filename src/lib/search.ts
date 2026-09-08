import type { Project, SearchHit } from "@/types";

/**
 * Subsequence fuzzy match. Returns null when the needle does not appear at all,
 * otherwise a score where a tight, early, word-boundary match ranks highest.
 * Written out rather than pulled in so the palette has no dependency.
 */
function fuzzyScore(haystack: string, needle: string): number | null {
  if (needle.length === 0) return 0;
  const text = haystack.toLowerCase();
  const query = needle.toLowerCase();

  const exact = text.indexOf(query);
  if (exact !== -1) {
    const boundary = exact === 0 || /[\s\-/_.]/.test(text.charAt(exact - 1));
    return 1000 - exact + (boundary ? 250 : 0) + query.length * 4;
  }

  let score = 0;
  let cursor = 0;
  let previous = -1;
  for (const char of query) {
    const found = text.indexOf(char, cursor);
    if (found === -1) return null;
    if (previous !== -1 && found === previous + 1) score += 12;
    if (found === 0 || /[\s\-/_.]/.test(text.charAt(found - 1))) score += 8;
    score += Math.max(0, 6 - (found - cursor));
    previous = found;
    cursor = found + 1;
  }
  return score;
}

interface Field {
  readonly name: SearchHit["field"];
  readonly text: string;
  readonly weight: number;
}

function fieldsOf(project: Project): readonly Field[] {
  return [
    { name: "title", text: project.title, weight: 3 },
    { name: "tags", text: project.tags.join(" "), weight: 2 },
    { name: "stack", text: project.stack.join(" "), weight: 2 },
    { name: "pitch", text: project.pitch, weight: 1 },
  ];
}

export function scoreProject(project: Project, query: string): SearchHit | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) return { project, score: 0, field: "title" };

  let best: SearchHit | null = null;
  for (const field of fieldsOf(project)) {
    const raw = fuzzyScore(field.text, trimmed);
    if (raw === null) continue;
    const score = raw * field.weight;
    if (best === null || score > best.score) {
      best = { project, score, field: field.name };
    }
  }
  return best;
}

/**
 * Grid filtering is a stricter test than palette ranking. A subsequence match
 * is useful when results are ranked and you can see them, but as a filter it
 * silently keeps projects that merely contain the letters in order — "voice"
 * would match "veni-vici". The grid gets a plain substring match instead.
 */
export function matchesQuery(project: Project, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;
  const haystack = [
    project.title,
    project.pitch,
    project.description,
    project.tags.join(" "),
    project.stack.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function searchProjects(
  projects: readonly Project[],
  query: string,
): readonly SearchHit[] {
  const hits: SearchHit[] = [];
  for (const project of projects) {
    const hit = scoreProject(project, query);
    if (hit !== null) hits.push(hit);
  }
  return hits.sort(
    (a, b) => b.score - a.score || a.project.title.localeCompare(b.project.title),
  );
}
