"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const SHORTCUTS: readonly { readonly keys: readonly string[]; readonly action: string }[] = [
  { keys: ["1", "2", "3", "4"], action: "Switch audience: All, Data, AI/ML, Engineering" },
  { keys: ["/"], action: "Jump to the search box" },
  { keys: ["Ctrl", "K"], action: "Open the command palette" },
  { keys: ["↑", "↓"], action: "Move through palette results" },
  { keys: ["←", "→", "↑", "↓"], action: "Move between project cards" },
  { keys: ["Enter"], action: "Open the focused project" },
  { keys: ["Esc"], action: "Close the palette, or clear the search box" },
  { keys: ["?"], action: "Show this list" },
];

function Key({ children }: { readonly children: string }) {
  return (
    <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px]">
      {children}
    </kbd>
  );
}

export function ShortcutsDialog({ onClose }: { readonly onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
        className="relative w-full max-w-md rounded-t-xl border border-line bg-surface p-5 sm:rounded-xl"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="shortcuts-title" className="text-base font-semibold">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-2 py-1 text-xs text-muted"
          >
            Esc
          </button>
        </div>

        <dl className="mt-4 space-y-2.5">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.action} className="flex items-baseline justify-between gap-4">
              <dt className="flex shrink-0 gap-1">
                {shortcut.keys.map((key) => (
                  <Key key={key}>{key}</Key>
                ))}
              </dt>
              <dd className="text-right text-sm text-muted">{shortcut.action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
