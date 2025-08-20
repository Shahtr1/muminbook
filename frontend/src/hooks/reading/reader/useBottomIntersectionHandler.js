import { useCallback, useRef } from "react";

/**
 * Returns a stable IntersectionObserver callback for the BOTTOM sentinel.
 */
export function useBottomIntersectionHandler({
  dataLength,
  endChunk,
  setEndChunk,
  lastGrowthRef,
  chunkSize,
  hasNextChunk,
  isFetchingNextChunk,
  fetchNextChunk,
}) {
  const fetchNextCooldownRef = useRef(false);

  return useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || isFetchingNextChunk) return;

      // Near-bottom check (defensive)
      let nearBottom = true;
      if (entry.rootBounds) {
        const distanceFromBottom =
          entry.rootBounds.bottom - entry.boundingClientRect.bottom;
        nearBottom = distanceFromBottom <= 40;
      }

      // Debounce
      if (fetchNextCooldownRef.current) return;
      fetchNextCooldownRef.current = true;
      setTimeout(() => {
        fetchNextCooldownRef.current = false;
      }, 300);

      const totalChunksNow = Math.ceil(dataLength / chunkSize);

      // If we still have local chunks, just reveal one more
      if (endChunk < totalChunksNow) {
        if (lastGrowthRef) lastGrowthRef.current = "down";
        setEndChunk((e) => Math.min(e + 1, totalChunksNow));
        return;
      }

      // Otherwise ask the API
      if (nearBottom && hasNextChunk) {
        const maybe = fetchNextChunk?.();
        if (maybe && typeof maybe.then === "function") {
          // window extension handled by data sync hook after fetch
          maybe.then(() => {});
        }
      }
    },
    [
      isFetchingNextChunk,
      hasNextChunk,
      fetchNextChunk,
      dataLength,
      endChunk,
      chunkSize,
      setEndChunk,
      lastGrowthRef,
    ],
  );
}
