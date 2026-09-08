"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Density } from "@/types";

export const THEME_KEY = "portfolio:theme";
export const DENSITY_KEY = "portfolio:density";

export type Theme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function isDensity(value: unknown): value is Density {
  return value === "grid" || value === "list";
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing or blocked storage: the preference just will not persist.
  }
}

/**
 * The inline boot script already applied both preferences to <html> before the
 * first paint, so the document element is the source of truth and React
 * subscribes to it rather than re-deciding it. That is what keeps the first
 * paint free of a wrong-theme flash and of a density reflow.
 */
function subscribeToAttribute(attribute: string): (onChange: () => void) => () => void {
  return (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attribute],
    });
    return () => observer.disconnect();
  };
}

const subscribeTheme = subscribeToAttribute("class");
const subscribeDensity = subscribeToAttribute("data-density");

function themeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function densitySnapshot(): Density {
  const applied = document.documentElement.dataset.density;
  return isDensity(applied) ? applied : "grid";
}

/** Server render has no document; light and grid match the pre-hydration markup. */
function serverTheme(): Theme {
  return "light";
}

function serverDensity(): Density {
  return "grid";
}

export function useTheme(): readonly [Theme, () => void] {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, serverTheme);

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    write(THEME_KEY, next);
  }, []);

  return [theme, toggle];
}

export function useDensity(): readonly [Density, (density: Density) => void] {
  const density = useSyncExternalStore(subscribeDensity, densitySnapshot, serverDensity);

  const setDensity = useCallback((next: Density) => {
    document.documentElement.dataset.density = next;
    write(DENSITY_KEY, next);
  }, []);

  return [density, setDensity];
}
