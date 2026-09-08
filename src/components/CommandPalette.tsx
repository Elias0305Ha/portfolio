"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { ArrowRight, Command, Search } from "lucide-react";
import type { Project, SearchHit } from "@/types";
import { searchProjects } from "@/lib/search";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface PaletteCommand {
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly run: () => void;
}

interface PaletteProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly projects: readonly Project[];
  readonly onOpenProject: (project: Project) => void;
  readonly onFilterByQuery: (query: string) => void;
  readonly commands: readonly PaletteCommand[];
}

/** Show the field that actually matched, so a stack hit explains itself. */
function hintFor(hit: SearchHit): string {
  switch (hit.field) {
    case "tags":
      return hit.project.tags.join(" · ");
    case "stack":
      return hit.project.stack.join(" · ");
    case "title":
    case "pitch":
      return hit.project.pitch;
  }
}

interface Row {
  readonly key: string;
  readonly title: string;
  readonly hint: string;
  readonly group: "Commands" | "Projects";
  readonly run: () => void;
}

const noopSubscribe = () => () => {};

/** Portals need a document; this is the render-safe way to know we have one. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * The dialog only exists while it is open, so every open starts with an empty
 * query and the selection at the top, with no effect resetting state.
 */
function PaletteDialog({
  onClose,
  projects,
  onOpenProject,
  onFilterByQuery,
  commands,
}: Omit<PaletteProps, "open">) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useFocusTrap(dialogRef, true);

  // The page behind a modal must not scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const rows = useMemo<readonly Row[]>(() => {
    const trimmed = query.trim();
    const needle = trimmed.toLowerCase();

    // Turns a palette search into a shareable, URL-backed grid filter.
    const filterRow: Row[] =
      trimmed.length === 0
        ? []
        : [
            {
              key: "command:filter-by-query",
              title: 'Filter the grid by "' + trimmed + '"',
              hint: "Filters",
              group: "Commands",
              run: () => onFilterByQuery(trimmed),
            },
          ];

    const commandRows: Row[] = commands
      .filter(
        (command) =>
          needle.length === 0 ||
          command.title.toLowerCase().includes(needle) ||
          command.hint.toLowerCase().includes(needle),
      )
      .map((command) => ({
        key: "command:" + command.id,
        title: command.title,
        hint: command.hint,
        group: "Commands",
        run: command.run,
      }));

    const projectRows: Row[] = searchProjects(projects, query).map((hit) => ({
      key: "project:" + hit.project.id,
      title: hit.project.title,
      hint: hintFor(hit),
      group: "Projects",
      run: () => onOpenProject(hit.project),
    }));

    return [...filterRow, ...commandRows, ...projectRows];
  }, [commands, onFilterByQuery, onOpenProject, projects, query]);

  // Derived, not stored: a shrinking result list can never strand the selection.
  const activeIndex = index >= rows.length ? 0 : index;
  const activeRow = rows[activeIndex];

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (rows.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setIndex((activeIndex + 1) % rows.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setIndex((activeIndex - 1 + rows.length) % rows.length);
          break;
        case "Home":
          event.preventDefault();
          setIndex(0);
          break;
        case "End":
          event.preventDefault();
          setIndex(rows.length - 1);
          break;
        case "Enter": {
          event.preventDefault();
          const row = rows[activeIndex];
          if (row !== undefined) {
            row.run();
            onClose();
          }
          break;
        }
        default:
          break;
      }
    },
    [activeIndex, onClose, rows],
  );

  useEffect(() => {
    const list = listRef.current;
    if (list === null || activeRow === undefined) return;
    const option = list.querySelector<HTMLElement>(
      "#" + CSS.escape("palette-" + activeRow.key),
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [activeRow]);

  let lastGroup: Row["group"] | null = null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search projects and run commands"
        onKeyDown={onKeyDown}
        className="absolute inset-0 flex flex-col bg-surface sm:inset-auto sm:left-1/2 sm:top-24 sm:max-h-[70vh] sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:rounded-xl sm:border sm:border-line"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
          <label htmlFor="palette-input" className="sr-only">
            Search projects and commands
          </label>
          <input
            id="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={
              activeRow === undefined ? undefined : "palette-" + activeRow.key
            }
            autoComplete="off"
            spellCheck={false}
            placeholder="Search projects, stack, tags…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-2 py-1 text-xs text-muted"
          >
            Esc
          </button>
        </div>

        <ul
          ref={listRef}
          id="palette-list"
          role="listbox"
          aria-label="Results"
          className="flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {rows.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted">
              Nothing matches &ldquo;{query}&rdquo;.
            </li>
          )}
          {rows.map((row, rowIndex) => {
            const header = row.group !== lastGroup ? row.group : null;
            lastGroup = row.group;
            const selected = rowIndex === activeIndex;
            return (
              <li key={row.key}>
                {header !== null && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted">
                    {header}
                  </p>
                )}
                <div
                  id={"palette-" + row.key}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setIndex(rowIndex)}
                  onClick={() => {
                    row.run();
                    onClose();
                  }}
                  className={
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 " +
                    (selected ? "bg-accent-soft" : "")
                  }
                >
                  {row.group === "Commands" ? (
                    <Command aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
                  ) : (
                    <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{row.title}</span>
                    <span className="block truncate text-xs text-muted">{row.hint}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function CommandPalette({ open, ...rest }: PaletteProps) {
  const isClient = useIsClient();
  if (!isClient || !open) return null;
  return createPortal(<PaletteDialog {...rest} />, document.body);
}
