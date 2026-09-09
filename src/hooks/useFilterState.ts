"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { AudienceId, FilterState, SortKey } from "@/types";
import { DEFAULT_FILTERS } from "@/types";
import { filtersToHref } from "@/lib/url";

export interface FilterActions {
  readonly setTrack: (track: AudienceId) => void;
  readonly toggleTag: (tag: string) => void;
  readonly removeTag: (tag: string) => void;
  readonly setQuery: (q: string) => void;
  readonly setSort: (sort: SortKey) => void;
  readonly clearFilters: () => void;
}

/**
 * React state is the source of truth so a switch repaints on the same frame,
 * with no navigation and no layout jump. The URL is then brought into line with
 * router.replace, which keeps every view addressable and restorable.
 */
export function useFilterState(
  initial: FilterState,
): readonly [FilterState, FilterActions, boolean] {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>(initial);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sync = useCallback(
    (next: FilterState, debounceMs: number) => {
      if (timer.current !== null) clearTimeout(timer.current);
      const push = () => {
        startTransition(() => {
          router.replace(filtersToHref(next, pathname), { scroll: false });
        });
      };
      if (debounceMs === 0) {
        push();
        return;
      }
      timer.current = setTimeout(push, debounceMs);
    },
    [pathname, router],
  );

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  /**
   * `next` is computed from the current render's state, never inside a setState
   * updater: an updater runs during render, and starting a router transition
   * there is a side effect in the render phase that React 19 rejects.
   */
  const commit = useCallback(
    (next: FilterState, debounceMs = 0) => {
      setFilters(next);
      sync(next, debounceMs);
    },
    [sync],
  );

  const actions: FilterActions = {
    setTrack: useCallback(
      (track: AudienceId) => commit({ ...filters, track }),
      [commit, filters],
    ),
    toggleTag: useCallback(
      (tag: string) => {
        const tags = filters.tags.includes(tag)
          ? filters.tags.filter((item) => item !== tag)
          : [...filters.tags, tag].sort();
        commit({ ...filters, tags });
      },
      [commit, filters],
    ),
    removeTag: useCallback(
      (tag: string) =>
        commit({ ...filters, tags: filters.tags.filter((item) => item !== tag) }),
      [commit, filters],
    ),
    setQuery: useCallback(
      (q: string) => commit({ ...filters, q }, 200),
      [commit, filters],
    ),
    setSort: useCallback(
      (sort: SortKey) => commit({ ...filters, sort }),
      [commit, filters],
    ),
    clearFilters: useCallback(
      () => commit({ ...filters, tags: DEFAULT_FILTERS.tags, q: DEFAULT_FILTERS.q }),
      [commit, filters],
    ),
  };

  return [filters, actions, isPending];
}
