"use client";

import type { AudienceId } from "@/types";
import { TRACKS } from "@/lib/data";

interface SwitcherProps {
  readonly value: AudienceId;
  readonly options: readonly AudienceId[];
  readonly onChange: (track: AudienceId) => void;
}

function labelFor(audience: AudienceId): string {
  return audience === "all" ? "All" : TRACKS[audience].name;
}

export function AudienceSwitcher({ value, options, onChange }: SwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Choose the work you want to see"
      className="flex w-full flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 sm:w-auto"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={
              "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium motion-safe:transition motion-safe:duration-150 sm:flex-none " +
              (active
                ? "bg-accent text-accent-ink"
                : "text-muted hover:text-ink hover:bg-accent-soft")
            }
          >
            {labelFor(option)}
          </button>
        );
      })}
    </div>
  );
}
