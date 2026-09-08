"use client";

import { useCallback, type KeyboardEvent, type RefObject } from "react";

function cardsIn(container: HTMLElement): readonly HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-card]")];
}

/**
 * Columns are measured from the rendered rows rather than assumed from a
 * breakpoint, so arrow keys stay correct at any width and in list density.
 */
function columnCount(cards: readonly HTMLElement[]): number {
  const first = cards[0];
  if (first === undefined) return 1;
  const top = first.offsetTop;
  let columns = 0;
  for (const card of cards) {
    if (card.offsetTop !== top) break;
    columns += 1;
  }
  return Math.max(1, columns);
}

export function useGridNavigation(
  containerRef: RefObject<HTMLElement | null>,
): (event: KeyboardEvent<HTMLElement>) => void {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const container = containerRef.current;
      if (container === null) return;

      const cards = cardsIn(container);
      if (cards.length === 0) return;

      const active = document.activeElement;
      const index = cards.findIndex((card) => card === active);
      if (index === -1) return;

      const columns = columnCount(cards);
      let next = index;

      switch (event.key) {
        case "ArrowRight":
          next = Math.min(cards.length - 1, index + 1);
          break;
        case "ArrowLeft":
          next = Math.max(0, index - 1);
          break;
        case "ArrowDown":
          next = Math.min(cards.length - 1, index + columns);
          break;
        case "ArrowUp":
          next = Math.max(0, index - columns);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = cards.length - 1;
          break;
        default:
          return;
      }

      if (next === index) {
        event.preventDefault();
        return;
      }
      const target = cards[next];
      if (target === undefined) return;
      event.preventDefault();
      target.focus();
    },
    [containerRef],
  );
}
