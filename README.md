# Portfolio

A three-audience portfolio. A visitor picks Data, AI/ML or Engineering and the
page swaps its tagline, featured set, archive and tag ordering to match. Every
view has its own URL, so a recruiter can be sent straight to the right one.

## Commands

```bash
npm run dev        # local development
npm run check      # typecheck + lint + build, the full gate
```

`next build` no longer runs ESLint in Next 16, so `npm run lint` is a separate step.

## The data contract

`src/data/projects.json` is the single source of truth. It is validated at module
load by `src/types/guards.ts`, so a malformed entry fails the build rather than
rendering a broken card.

| Field | Notes |
| --- | --- |
| `tracks[]` | `"data"` / `"ai"` / `"engineering"`. A project can be in several. |
| `highlight[]` | Tracks where this project is featured. Must be a subset of `tracks`. |
| `embedUrl` | Renders a lazy 16:9 iframe with a skeleton. |
| `image` | Used only when `embedUrl` is null. |
| Both null | Renders a clean text-only card. Never a grey box. |

`src/data/tracks.json` holds each track's display name, header tagline and
`defaultSort`. The default sort applies whenever the URL has no explicit `?sort`.

## URL parameters

| Param | Values |
| --- | --- |
| `track` | `data`, `ai`, `engineering`, or omitted for all |
| `tags` | comma-separated; a project must carry **every** listed tag |
| `q` | free text over title, pitch, description, tags and stack |
| `sort` | `year-desc`, `year-asc`, `title-asc`; omitted means the track default |

Only non-default values are written, so each distinct view has exactly one address.

## Still to do

- `TAGLINE_TODO` in `src/data/tracks.json` — three lines of copy, one per track.
- The Data track has only three projects; institutional data work is not yet represented.
- `NEXT_PUBLIC_SITE_URL` should be set at build time once the domain exists.
