"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Keyboard,
  LayoutGrid,
  Link2,
  Moon,
  Rows3,
  Search,
  Sun,
  X,
} from "lucide-react";
import type { AudienceId, FilterState, Project } from "@/types";
import { PROJECTS, TRACKS, POPULATED_TRACKS } from "@/lib/data";
import { SITE } from "@/lib/site";
import { applyFilters, resolveSort, tagCountsFor } from "@/lib/filter";
import { filtersToHref } from "@/lib/url";
import { useFilterState } from "@/hooks/useFilterState";
import { useDensity, useTheme } from "@/hooks/usePreferences";
import { AudienceSwitcher } from "@/components/AudienceSwitcher";
import { FilterBar } from "@/components/FilterBar";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ShortcutsDialog } from "@/components/ShortcutsDialog";
import { CommandPalette, type PaletteCommand } from "@/components/CommandPalette";

const SEARCH_ID = "site-search";

function taglineFor(track: AudienceId): string {
  return track === "all" ? SITE.description : TRACKS[track].tagline;
}

/** True when focus is somewhere that swallows plain-letter shortcuts. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function ToolbarButton({
  label,
  pressed,
  onClick,
  children,
}: {
  readonly label: string;
  readonly pressed?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line motion-safe:transition motion-safe:duration-150 hover:border-accent " +
        (pressed === true ? "bg-accent-soft text-accent" : "text-muted hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

export function PortfolioApp({ initialFilters }: { readonly initialFilters: FilterState }) {
  const router = useRouter();
  const [filters, actions] = useFilterState(initialFilters);
  const [theme, toggleTheme] = useTheme();
  const [density, setDensity] = useDensity();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const audiences: readonly AudienceId[] = useMemo(() => ["all", ...POPULATED_TRACKS], []);

  const { featured, results, total, narrowed } = useMemo(
    () => applyFilters(PROJECTS, filters),
    [filters],
  );
  const tagCounts = useMemo(() => tagCountsFor(PROJECTS, filters.track), [filters.track]);
  const sort = resolveSort(filters);

  const openProject = useCallback(
    (project: Project) => router.push("/projects/" + project.id),
    [router],
  );

  const copyLink = useCallback(() => {
    const href = window.location.origin + filtersToHref(filters, "/");
    void navigator.clipboard.writeText(href).then(() => {
      setCopied(true);
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    });
  }, [filters]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    };
  }, []);

  const setTrack = actions.setTrack;
  const setQuery = actions.setQuery;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTyping(event.target);

      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Escape clears the search box when that is where you are.
      if (event.key === "Escape" && typing) {
        if (document.activeElement === searchRef.current) {
          event.preventDefault();
          setQuery("");
          searchRef.current?.blur();
        }
        return;
      }
      if (typing) return;

      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      const slot = Number.parseInt(event.key, 10);
      if (Number.isInteger(slot) && slot >= 1 && slot <= audiences.length) {
        const audience = audiences[slot - 1];
        if (audience !== undefined) {
          event.preventDefault();
          setTrack(audience);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [audiences, setQuery, setTrack]);

  const commands = useMemo<readonly PaletteCommand[]>(() => {
    const trackCommands: PaletteCommand[] = audiences.map((audience) => ({
      id: "track-" + audience,
      title: audience === "all" ? "Show all work" : "Show " + TRACKS[audience].name + " work",
      hint: "Audience",
      run: () => actions.setTrack(audience),
    }));

    return [
      ...trackCommands,
      {
        id: "theme",
        title: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        hint: "Appearance",
        run: toggleTheme,
      },
      {
        id: "density",
        title: density === "grid" ? "Switch to list view" : "Switch to grid view",
        hint: "Appearance",
        run: () => setDensity(density === "grid" ? "list" : "grid"),
      },
      { id: "copy", title: "Copy a link to this view", hint: "Share", run: copyLink },
      {
        id: "resume",
        title: "Download the resume",
        hint: "PDF",
        run: () => {
          window.location.href = SITE.resume;
        },
      },
      {
        id: "shortcuts",
        title: "Show keyboard shortcuts",
        hint: "Help",
        run: () => setShortcutsOpen(true),
      },
      { id: "clear", title: "Clear all filters", hint: "Filters", run: actions.clearFilters },
    ];
  }, [actions, audiences, copyLink, density, setDensity, theme, toggleTheme]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{SITE.name}</h1>
            {/* Swaps with the audience; the key restarts the fade. */}
            <p
              key={filters.track}
              className="tagline mt-2 max-w-2xl text-sm leading-relaxed text-muted"
            >
              {taglineFor(filters.track)}
            </p>
          </div>
          <div className="no-print flex shrink-0 items-center gap-2">
            <a
              href={SITE.resume}
              download
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-muted hover:border-accent hover:text-ink motion-safe:transition motion-safe:duration-150"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Resume</span>
              <span className="sr-only sm:hidden">Download resume (PDF)</span>
            </a>
            <ToolbarButton
              label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Moon aria-hidden="true" className="h-4 w-4" />
              )}
            </ToolbarButton>
            <ToolbarButton label="Copy a link to this view" onClick={copyLink}>
              {copied ? (
                <Check aria-hidden="true" className="h-4 w-4 text-accent" />
              ) : (
                <Link2 aria-hidden="true" className="h-4 w-4" />
              )}
            </ToolbarButton>
          </div>
        </div>

        <AudienceSwitcher value={filters.track} options={audiences} onChange={actions.setTrack} />

        <div className="no-print flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor={SEARCH_ID} className="sr-only">
              Search projects
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              ref={searchRef}
              id={SEARCH_ID}
              type="search"
              value={filters.q}
              onChange={(event) => actions.setQuery(event.target.value)}
              placeholder="Search projects, stack, tags…"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-16 text-sm outline-none placeholder:text-muted focus:border-accent motion-safe:transition motion-safe:duration-150"
            />
            {filters.q.length > 0 ? (
              <button
                type="button"
                onClick={() => actions.setQuery("")}
                aria-label="Clear the search box"
                className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block"
              >
                /
              </kbd>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton
              label="Grid view"
              pressed={density === "grid"}
              onClick={() => setDensity("grid")}
            >
              <LayoutGrid aria-hidden="true" className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="List view"
              pressed={density === "list"}
              onClick={() => setDensity("list")}
            >
              <Rows3 aria-hidden="true" className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Keyboard shortcuts" onClick={() => setShortcutsOpen(true)}>
              <Keyboard aria-hidden="true" className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        <FilterBar
          filters={filters}
          tagCounts={tagCounts}
          sort={sort}
          onSortChange={actions.setSort}
          onToggleTag={actions.toggleTag}
          onRemoveTag={actions.removeTag}
          onClearAll={actions.clearFilters}
          resultCount={total}
        />
      </header>

      <div id="projects" className="mt-10 space-y-12">
        {featured.length > 0 && (
          <section aria-labelledby="featured-heading" className="space-y-4">
            <h2
              id="featured-heading"
              className="text-sm font-medium uppercase tracking-wide text-muted"
            >
              Featured
            </h2>
            <ProjectGrid projects={featured} featured label="Featured projects" />
          </section>
        )}

        {results.length > 0 && (
          <section aria-labelledby="archive-heading" className="space-y-4">
            <h2
              id="archive-heading"
              className="text-sm font-medium uppercase tracking-wide text-muted"
            >
              {narrowed ? "Results" : "Everything else"}
            </h2>
            <ProjectGrid projects={results} label="All projects" />
          </section>
        )}

        {total === 0 && (
          <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center">
            <p className="text-sm text-ink">No projects match these filters.</p>
            <p className="mt-1 text-sm text-muted">
              Try removing a tag, or clear everything and start again.
            </p>
            <button
              type="button"
              onClick={actions.clearFilters}
              className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink motion-safe:transition motion-safe:duration-150"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={PROJECTS}
        onOpenProject={openProject}
        onFilterByQuery={actions.setQuery}
        commands={commands}
      />

      {shortcutsOpen && <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />}
    </main>
  );
}
