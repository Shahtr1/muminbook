import { useCallback, useRef } from "react";

/**
 * Returns a stable IntersectionObserver callback for the TOP sentinel.
 */
export function useTopIntersectionHandler({
  startChunk,
  setStartChunk,
  setEndChunk,
  lastGrowthRef,
  hasPreviousChunk,
  isFetchingPreviousChunk,
  fetchPreviousChunk,
  anchorBeforePrepend, // your helper from the component
  pendingScrollAdjustRef, // the ref that stores the anchor object
  maxVisibleChunks,
}) {
  const fetchPrevCooldownRef = useRef(false);

  return useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || isFetchingPreviousChunk) return;

      // Near-top check
      let nearTop = true;
      if (entry.rootBounds) {
        const distanceFromTop =
          entry.boundingClientRect.top - entry.rootBounds.top;
        nearTop = distanceFromTop <= 40;
      }
      if (!nearTop) return;

      // Debounce
      if (fetchPrevCooldownRef.current) return;
      fetchPrevCooldownRef.current = true;
      setTimeout(() => {
        fetchPrevCooldownRef.current = false;
      }, 300);

      if (startChunk > 0) {
        // We already have previous chunks locally. Reveal one.
        const anchor = anchorBeforePrepend?.();

        setStartChunk((prevStart) => {
          const nextStart = Math.max(0, prevStart - 1);
          if (lastGrowthRef) lastGrowthRef.current = "up";
          setEndChunk((prevEnd) => {
            const visible = prevEnd - nextStart;
            return visible > maxVisibleChunks ? prevEnd - 1 : prevEnd;
          });
          return nextStart;
        });

        if (pendingScrollAdjustRef) pendingScrollAdjustRef.current = anchor;
      } else if (hasPreviousChunk) {
        // Need to fetch more from server
        const anchor = anchorBeforePrepend?.();
        const maybe = fetchPreviousChunk?.();
        if (maybe && typeof maybe.then === "function") {
          maybe.then(() => {
            if (pendingScrollAdjustRef) pendingScrollAdjustRef.current = anchor;
            if (lastGrowthRef) lastGrowthRef.current = "up";
          });
        } else {
          if (pendingScrollAdjustRef) pendingScrollAdjustRef.current = anchor;
          if (lastGrowthRef) lastGrowthRef.current = "up";
        }
      }
    },
    [
      isFetchingPreviousChunk,
      hasPreviousChunk,
      fetchPreviousChunk,
      startChunk,
      setStartChunk,
      setEndChunk,
      lastGrowthRef,
      anchorBeforePrepend,
      pendingScrollAdjustRef,
      maxVisibleChunks,
    ],
  );
}
