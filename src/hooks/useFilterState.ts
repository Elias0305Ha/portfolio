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

  const update = useCallback(
    (patch: Partial<FilterState>, debounceMs = 0) => {
      setFilters((current) => {
        const next: FilterState = { ...current, ...patch };
        sync(next, debounceMs);
        return next;
      });
    },
    [sync],
  );

  const actions: FilterActions = {
    setTrack: useCallback((track: AudienceId) => update({ track }), [update]),
    toggleTag: useCallback(
      (tag: string) => {
        setFilters((current) => {
          const has = current.tags.includes(tag);
          const tags = has
            ? current.tags.filter((item) => item !== tag)
            : [...current.tags, tag].sort();
          const next: FilterState = { ...current, tags };
          sync(next, 0);
          return next;
        });
      },
      [sync],
    ),
    removeTag: useCallback(
      (tag: string) => {
        setFilters((current) => {
          const next: FilterState = {
            ...current,
            tags: current.tags.filter((item) => item !== tag),
          };
          sync(next, 0);
          return next;
        });
      },
      [sync],
    ),
    setQuery: useCallback((q: string) => update({ q }, 200), [update]),
    setSort: useCallback((sort: SortKey) => update({ sort }), [update]),
    clearFilters: useCallback(
      () => update({ tags: DEFAULT_FILTERS.tags, q: DEFAULT_FILTERS.q }),
      [update],
    ),
  };

  return [filters, actions, isPending];
}
