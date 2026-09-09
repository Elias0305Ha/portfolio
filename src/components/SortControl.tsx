"use client";

import type { SortKey } from "@/types";

const OPTIONS: readonly { readonly key: SortKey; readonly label: string }[] = [
  { key: "year-desc", label: "Newest" },
  { key: "year-asc", label: "Oldest" },
  { key: "title-asc", label: "A–Z" },
];

interface SortControlProps {
  readonly value: SortKey;
  readonly onChange: (sort: SortKey) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div role="group" aria-label="Sort projects" className="flex items-center gap-1">
      {OPTIONS.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={
              "rounded-md px-2 py-1 text-xs motion-safe:transition motion-safe:duration-150 " +
              (active ? "bg-accent-soft text-accent" : "text-muted hover:text-ink")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
