import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useTrackVisibleAyat(items = [], containerRef) {
  const queryClient = useQueryClient();
  const lastIdsRef = useRef({ surahId: null, juzId: null });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items.length) return;

    const onScroll = () => {
      const elements = Array.from(container.querySelectorAll("[data-idx]"));

      const topMost = elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            top: rect.top - container.getBoundingClientRect().top,
            idx: parseInt(el.dataset.idx),
          };
        })
        .filter((el) => el.top >= 0)
        .sort((a, b) => a.top - b.top)[0];

      if (!topMost) return;

      const current = items[topMost.idx];
      if (!current) return;

      const { surahId, juzId } = current;
      const last = lastIdsRef.current;

      if (surahId !== last.surahId || juzId !== last.juzId) {
        queryClient.setQueryData(["currentSurahId"], surahId);
        queryClient.setQueryData(["currentJuzId"], juzId);
        lastIdsRef.current = { surahId, juzId };
      }
    };

    container.addEventListener("scroll", onScroll);
    onScroll();

    return () => container.removeEventListener("scroll", onScroll);
  }, [items, containerRef, queryClient]);
}
