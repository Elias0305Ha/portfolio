"use client";

import { Search, X } from "lucide-react";
import type { FilterState, TagCount } from "@/types";

interface FilterBarProps {
  readonly filters: FilterState;
  readonly tagCounts: readonly TagCount[];
  readonly onToggleTag: (tag: string) => void;
  readonly onRemoveTag: (tag: string) => void;
  readonly onClearQuery: () => void;
  readonly onClearAll: () => void;
  readonly resultCount: number;
}

export function FilterBar({
  filters,
  tagCounts,
  onToggleTag,
  onRemoveTag,
  onClearQuery,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  const active = filters.tags.length > 0 || filters.q.length > 0;

  return (
    <div className="space-y-3">
      <div>
        <h2 id="tag-filter-label" className="sr-only">
          Filter by tag
        </h2>
        <ul aria-labelledby="tag-filter-label" className="flex flex-wrap gap-1.5">
          {tagCounts.map(({ tag, count }) => {
            const on = filters.tags.includes(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggleTag(tag)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs motion-safe:transition motion-safe:duration-150 " +
                    (on
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line text-muted hover:border-accent hover:text-ink")
                  }
                >
                  {tag}
                  <span className={on ? "opacity-80" : "opacity-60"}>{count}</span>
                  {on && <X aria-hidden="true" className="h-3 w-3" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <p aria-live="polite" className="text-muted">
          {resultCount} {resultCount === 1 ? "project" : "projects"}
        </p>

        {active && (
          <>
            <span aria-hidden="true" className="text-line">
              |
            </span>
            {filters.q.length > 0 && (
              <button
                type="button"
                onClick={onClearQuery}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-ink motion-safe:transition motion-safe:duration-150"
              >
                <Search aria-hidden="true" className="h-3 w-3" />
                <span>&ldquo;{filters.q}&rdquo;</span>
                <X aria-hidden="true" className="h-3 w-3" />
                <span className="sr-only">Clear the search term</span>
              </button>
            )}
            {filters.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent-soft motion-safe:transition motion-safe:duration-150"
              >
                {tag}
                <X aria-hidden="true" className="h-3 w-3" />
                <span className="sr-only">Remove the {tag} filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-accent underline underline-offset-4"
            >
              Clear all filters
            </button>
          </>
        )}
      </div>
    </div>
  );
}
