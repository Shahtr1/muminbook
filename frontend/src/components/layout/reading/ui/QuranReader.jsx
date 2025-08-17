import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Ayat } from "@/components/layout/reading/ui/Ayat.jsx";

const CHUNK_SIZE = 50;
const MAX_VISIBLE_CHUNKS = 3;

export const QuranReader = ({
  data,
  fetchNextChunk,
  fetchPreviousChunk,
  hasNextChunk,
  hasPreviousChunk,
  isFetchingNextChunk,
  isFetchingPreviousChunk,
}) => {
  const containerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);

  // Map chunkIndex -> measured height in px
  const chunkHeights = useRef({});

  // Visible window: [startChunk, endChunk)
  const [startChunk, setStartChunk] = useState(0);
  const [endChunk, setEndChunk] = useState(1);

  // Track which direction we last grew: 'up' | 'down' | null
  const lastGrowthRef = useRef(null);

  // -----------------------------
  // Detect data growth direction
  // -----------------------------
  const prevFirstIdRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const len = data.length;

    if (len === 0) {
      // Hard reset
      prevFirstIdRef.current = null;
      prevLastIdRef.current = null;
      prevLenRef.current = 0;
      setStartChunk(0);
      setEndChunk(1);
      lastGrowthRef.current = null;
      return;
    }

    const firstId = data[0]?.uuid;
    const lastId = data[len - 1]?.uuid;

    const prevLen = prevLenRef.current;
    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;

    // First load or switch to a new dataset
    const isInitialLoad = prevLen === 0;
    const switchedDataset =
      prevFirst && prevLast && firstId !== prevFirst && lastId !== prevLast;

    if (isInitialLoad || switchedDataset) {
      const totalChunks = Math.ceil(len / CHUNK_SIZE);
      setStartChunk(0);
      setEndChunk(Math.min(1, totalChunks));
      lastGrowthRef.current = null;
    } else if (len > prevLen) {
      // Data grew: figure out where
      const totalChunks = Math.ceil(len / CHUNK_SIZE);

      if (firstId !== prevFirst) {
        // PREPEND happened
        setStartChunk((s) => s + 1);
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        lastGrowthRef.current = "up";
      } else if (lastId !== prevLast) {
        // APPEND happened
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        lastGrowthRef.current = "down";
      }
    }

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
    prevLenRef.current = len;
  }, [data]);

  // -----------------------------
  // Direction-aware virtualization trim
  // -----------------------------
  useLayoutEffect(() => {
    const visible = endChunk - startChunk;
    if (visible > MAX_VISIBLE_CHUNKS) {
      if (lastGrowthRef.current === "down") {
        // We grew downward → trim from top
        setStartChunk((s) => s + 1);
      } else if (lastGrowthRef.current === "up") {
        // We grew upward → trim from bottom
        setEndChunk((e) => Math.max(e - 1, startChunk + 1));
      } else {
        // Fallback: trim from top
        setStartChunk((s) => s + 1);
      }
    }
  }, [endChunk, startChunk]);

  // --- Spacer heights ---
  const topSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) < startChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  const bottomSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) >= endChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  // --- Visible range / data slice ---
  const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
  const start = startChunk * CHUNK_SIZE;
  const end = Math.min(endChunk * CHUNK_SIZE, data.length);
  const visibleData = data.slice(start, end);

  // --- Measuring visible chunks ---
  const spanRefs = useRef([]);
  const setSpanRef = (el, index) => {
    spanRefs.current[index] = el;
  };

  useEffect(() => {
    if (spanRefs.current.length === 0) return;
    const validSpans = spanRefs.current.filter(Boolean);
    if (validSpans.length === 0) return;

    for (let chunkIndex = startChunk; chunkIndex < endChunk; chunkIndex++) {
      const chunkStart = chunkIndex * CHUNK_SIZE;
      const chunkEnd = Math.min((chunkIndex + 1) * CHUNK_SIZE, data.length);

      const chunkSpanStart = Math.max(0, chunkStart - start);
      const chunkSpanEnd = Math.min(validSpans.length, chunkEnd - start);

      if (chunkSpanStart < chunkSpanEnd && chunkSpanStart < validSpans.length) {
        const chunkSpans = validSpans.slice(chunkSpanStart, chunkSpanEnd);
        if (chunkSpans.length > 0) {
          const range = document.createRange();
          range.setStartBefore(chunkSpans[0]);
          range.setEndAfter(chunkSpans[chunkSpans.length - 1]);
          const rect = range.getBoundingClientRect();
          const height = rect.height;
          chunkHeights.current[chunkIndex] = height;
        }
      }
    }
  }, [visibleData, startChunk, endChunk, start, data.length]);

  // --- Stable scroll helper when prepending content ---
  const pendingScrollAdjust = useRef(null);

  const anchorBeforePrepend = () => {
    const c = containerRef.current;
    if (!c) return null;
    return { prevScrollHeight: c.scrollHeight, prevScrollTop: c.scrollTop };
  };

  const adjustAfterPrepend = (anchor) => {
    const c = containerRef.current;
    if (!c || !anchor) return;
    const delta = c.scrollHeight - anchor.prevScrollHeight;
    c.scrollTop = anchor.prevScrollTop + delta;
  };

  // Apply the pending scroll adjustment *after* renders that changed content above
  useLayoutEffect(() => {
    if (pendingScrollAdjust.current) {
      adjustAfterPrepend(pendingScrollAdjust.current);
      pendingScrollAdjust.current = null;
    }
  });

  // --- Infinite scroll DOWN (bottom sentinel) ---
  const fetchNextCooldownRef = useRef(false);

  const handleBottomIntersection = useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting || isFetchingNextChunk) return;

      // Entry-based "near bottom" (distance from root bottom to sentinel's bottom)
      // Avoid scrollTop math which is skewed by the bottom spacer.
      let nearBottom = true; // default true if rootBounds missing (Safari quirk)
      if (entry.rootBounds) {
        const distanceFromBottom =
          entry.rootBounds.bottom - entry.boundingClientRect.bottom;
        nearBottom = distanceFromBottom <= 40; // px
      }

      // Apply a short cooldown to prevent rapid refires during layout changes
      if (fetchNextCooldownRef.current) return;
      fetchNextCooldownRef.current = true;
      setTimeout(() => {
        fetchNextCooldownRef.current = false;
      }, 300);

      const totalChunksNow = Math.ceil(data.length / CHUNK_SIZE);

      // If we still have undisplayed local chunks (virtualization), extend window
      if (endChunk < totalChunksNow) {
        lastGrowthRef.current = "down";
        setEndChunk((e) => Math.min(e + 1, totalChunksNow));
        return;
      }

      // Otherwise fetch more from API when we're actually close to the bottom
      if (nearBottom && hasNextChunk) {
        const maybePromise = fetchNextChunk();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(() => {
            // data growth detection effect will set lastGrowthRef to "down" and extend
          });
        }
      }
    },
    [isFetchingNextChunk, hasNextChunk, fetchNextChunk, data.length, endChunk],
  );

  useEffect(() => {
    if (!bottomSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(handleBottomIntersection, {
      root: containerRef.current,
      threshold: 0.05, // a sliver is enough
      rootMargin: "0px 0px 200px 0px", // start a bit before the real bottom
    });
    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [handleBottomIntersection]);

  // --- Infinite scroll UP (top sentinel) ---
  const fetchPrevCooldownRef = useRef(false);

  const handleTopIntersection = useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting || isFetchingPreviousChunk) return;

      // Near-top check based on sentinel’s position within the root viewport
      let nearTop = true; // default true if rootBounds missing
      if (entry.rootBounds) {
        const distanceFromTop =
          entry.boundingClientRect.top - entry.rootBounds.top;
        nearTop = distanceFromTop <= 40; // px
      }
      if (!nearTop) return;

      // Cooldown to avoid rapid refires during layout/scroll adjustment
      if (fetchPrevCooldownRef.current) return;
      fetchPrevCooldownRef.current = true;
      setTimeout(() => {
        fetchPrevCooldownRef.current = false;
      }, 300);

      if (startChunk > 0) {
        const anchor = anchorBeforePrepend();

        // Grow upward and trim bottom if needed (direction-aware)
        setStartChunk((prevStart) => {
          const nextStart = Math.max(0, prevStart - 1);
          lastGrowthRef.current = "up";
          setEndChunk((prevEnd) => {
            const visible = prevEnd - nextStart;
            return visible > MAX_VISIBLE_CHUNKS ? prevEnd - 1 : prevEnd;
          });
          return nextStart;
        });

        pendingScrollAdjust.current = anchor;
      } else if (hasPreviousChunk) {
        // Fetch earlier data from API; after it prepends, keep the viewport anchored
        const anchor = anchorBeforePrepend();
        const maybePromise = fetchPreviousChunk();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(() => {
            pendingScrollAdjust.current = anchor;
            lastGrowthRef.current = "up";
          });
        } else {
          pendingScrollAdjust.current = anchor;
          lastGrowthRef.current = "up";
        }
      }
    },
    [isFetchingPreviousChunk, hasPreviousChunk, fetchPreviousChunk, startChunk],
  );

  useEffect(() => {
    if (!topSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(handleTopIntersection, {
      root: containerRef.current,
      threshold: 0.05, // a sliver is enough
      rootMargin: "200px 0px 0px 0px", // start slightly before the top
    });
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [handleTopIntersection]);

  // --- Sentinels visibility ---
  const showTopSentinel = hasPreviousChunk || startChunk > 0;
  const showBottomSentinel = hasNextChunk || endChunk < totalChunks;

  // If no more data either way and viewport can’t fill, show message
  const showNoMoreVerses =
    !hasNextChunk &&
    containerRef.current &&
    containerRef.current.scrollHeight <= containerRef.current.clientHeight;

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        fontFamily: "ArabicFont",
        direction: "rtl",
        textAlign: "justify",
        fontSize: "30px",
        padding: "24px",
      }}
    >
      {/* TOP spacer */}
      <div style={{ height: topSpacerHeight }} />

      {/* TOP sentinel (only if more above) */}
      {showTopSentinel && (
        <div
          ref={topSentinelRef}
          style={{ height: 10, background: "red", marginBottom: 8 }}
        />
      )}

      {/* Visible verses */}
      {visibleData.map((row, i) => (
        <Ayat key={row.uuid} data={row} index={i} setSpanRef={setSpanRef} />
      ))}

      {/* BOTTOM sentinel (only if more below) */}
      {showBottomSentinel && (
        <div
          ref={bottomSentinelRef}
          style={{ height: 10, background: "blue", marginTop: 8 }}
        />
      )}

      {/* BOTTOM spacer */}
      <div style={{ height: bottomSpacerHeight }} />

      {/* Loading indicators */}
      {(isFetchingNextChunk || isFetchingPreviousChunk) && (
        <div style={{ textAlign: "center", padding: 20 }}>
          Loading more verses...
        </div>
      )}

      {(showNoMoreVerses || (!hasNextChunk && !hasPreviousChunk)) && (
        <div style={{ textAlign: "center", padding: 20 }}>
          No more verses to load
        </div>
      )}
    </div>
  );
};
