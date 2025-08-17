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
  // Main scrollable container
  const containerRef = useRef(null);

  // Sentinels for infinite scroll detection
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);

  // Stores measured heights for each chunk
  const chunkHeights = useRef({});

  // Indices for a visible chunk window
  const [startChunk, setStartChunk] = useState(0);
  const [endChunk, setEndChunk] = useState(1);

  // Tracks last direction of data growth
  const lastGrowthRef = useRef(null);

  // --- Data change detection ---
  // Used to detect if data was prepended/appended
  const prevFirstIdRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const len = data.length;

    if (len === 0) {
      // Reset everything if no data
      prevFirstIdRef.current = null;
      prevLastIdRef.current = null;
      prevLenRef.current = 0;
      setStartChunk(0);
      setEndChunk(1);
      lastGrowthRef.current = null;
      return;
    }

    // Get first and last verse IDs
    const firstId = data[0]?.uuid;
    const lastId = data[len - 1]?.uuid;

    const prevLen = prevLenRef.current;
    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;

    // Initial load or dataset switch
    const isInitialLoad = prevLen === 0;
    const switchedDataset =
      prevFirst && prevLast && firstId !== prevFirst && lastId !== prevLast;

    if (isInitialLoad || switchedDataset) {
      // Reset the visible window
      const totalChunks = Math.ceil(len / CHUNK_SIZE);
      setStartChunk(0);
      setEndChunk(Math.min(1, totalChunks));
      lastGrowthRef.current = null;
    } else if (len > prevLen) {
      // Data grew: check a direction
      const totalChunks = Math.ceil(len / CHUNK_SIZE);

      if (firstId !== prevFirst) {
        // Data was prepended
        setStartChunk((s) => s + 1);
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        lastGrowthRef.current = "up";
      } else if (lastId !== prevLast) {
        // Data was appended
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        lastGrowthRef.current = "down";
      }
    }

    // Save current state for next effect run
    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
    prevLenRef.current = len;
  }, [data]);

  // --- Virtualization window trimming ---
  useLayoutEffect(() => {
    const visible = endChunk - startChunk;
    if (visible > MAX_VISIBLE_CHUNKS) {
      if (lastGrowthRef.current === "down") {
        // Remove chunk from top if growing down
        setStartChunk((s) => s + 1);
      } else if (lastGrowthRef.current === "up") {
        // Remove chunk from the bottom if growing up
        setEndChunk((e) => Math.max(e - 1, startChunk + 1));
      } else {
        // Default: trim from the top
        setStartChunk((s) => s + 1);
      }
    }
  }, [endChunk, startChunk]);

  // --- Calculate spacer heights for virtualization ---
  const topSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) < startChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  const bottomSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) >= endChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  // --- Slice data for visible window ---
  const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
  const start = startChunk * CHUNK_SIZE;
  const end = Math.min(endChunk * CHUNK_SIZE, data.length);
  const visibleData = data.slice(start, end);

  // --- Measure heights of visible chunks ---
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
          // Measure height of chunk using DOM Range
          const range = document.createRange();
          range.setStartBefore(chunkSpans[0]);
          range.setEndAfter(chunkSpans[chunkSpans.length - 1]);
          const rect = range.getBoundingClientRect();
          chunkHeights.current[chunkIndex] = rect.height;
        }
      }
    }
  }, [visibleData, startChunk, endChunk, start, data.length]);

  // --- Scroll adjustment for prepending ---
  const pendingScrollAdjust = useRef(null);

  // Save scroll position before prepending
  const anchorBeforePrepend = () => {
    const c = containerRef.current;
    if (!c) return null;
    return { prevScrollHeight: c.scrollHeight, prevScrollTop: c.scrollTop };
  };

  // Restore the scroll position after prepending
  const adjustAfterPrepend = (anchor) => {
    const c = containerRef.current;
    if (!c || !anchor) return;
    const delta = c.scrollHeight - anchor.prevScrollHeight;
    c.scrollTop = anchor.prevScrollTop + delta;
  };

  // Apply scroll adjustment after layout
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

      // Check if near bottom of container
      let nearBottom = true;
      if (entry.rootBounds) {
        const distanceFromBottom =
          entry.rootBounds.bottom - entry.boundingClientRect.bottom;
        nearBottom = distanceFromBottom <= 40;
      }

      // Cooldown to prevent rapid firing
      if (fetchNextCooldownRef.current) return;
      fetchNextCooldownRef.current = true;
      setTimeout(() => {
        fetchNextCooldownRef.current = false;
      }, 300);

      const totalChunksNow = Math.ceil(data.length / CHUNK_SIZE);

      // If there are more local chunks, show them
      if (endChunk < totalChunksNow) {
        lastGrowthRef.current = "down";
        setEndChunk((e) => Math.min(e + 1, totalChunksNow));
        return;
      }

      // Otherwise, fetch more data from API
      if (nearBottom && hasNextChunk) {
        const maybePromise = fetchNextChunk();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(() => {
            // Data growth effect will handle window extension
          });
        }
      }
    },
    [isFetchingNextChunk, hasNextChunk, fetchNextChunk, data.length, endChunk],
  );

  // Set up the bottom sentinel observer
  useEffect(() => {
    if (!bottomSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(handleBottomIntersection, {
      root: containerRef.current,
      threshold: 0.05,
      rootMargin: "0px 0px 200px 0px",
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

      // Check if near top of container
      let nearTop = true;
      if (entry.rootBounds) {
        const distanceFromTop =
          entry.boundingClientRect.top - entry.rootBounds.top;
        nearTop = distanceFromTop <= 40;
      }
      if (!nearTop) return;

      // Cooldown to prevent rapid firing
      if (fetchPrevCooldownRef.current) return;
      fetchPrevCooldownRef.current = true;
      setTimeout(() => {
        fetchPrevCooldownRef.current = false;
      }, 300);

      if (startChunk > 0) {
        // Show previous chunk if available locally
        const anchor = anchorBeforePrepend();

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
        // Fetch previous chunk from API
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

  // Set up a top sentinel observer
  useEffect(() => {
    if (!topSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(handleTopIntersection, {
      root: containerRef.current,
      threshold: 0.05,
      rootMargin: "200px 0px 0px 0px",
    });
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [handleTopIntersection]);

  // --- Sentinel visibility logic ---
  const showTopSentinel = hasPreviousChunk || startChunk > 0;
  const showBottomSentinel = hasNextChunk || endChunk < totalChunks;

  // Show "no more verses" message if nothing left to load
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
      {/* Spacer for top virtualization */}
      <div style={{ height: topSpacerHeight }} />

      {/* Top sentinel for infinite scroll up */}
      {showTopSentinel && (
        <div
          ref={topSentinelRef}
          style={{ height: 10, background: "red", marginBottom: 8 }}
        />
      )}

      {/* Render visible verses */}
      {visibleData.map((row, i) => (
        <Ayat key={row.uuid} data={row} index={i} setSpanRef={setSpanRef} />
      ))}

      {/* Bottom sentinel for infinite scroll down */}
      {showBottomSentinel && (
        <div
          ref={bottomSentinelRef}
          style={{ height: 10, background: "blue", marginTop: 8 }}
        />
      )}

      {/* Spacer for bottom virtualization */}
      <div style={{ height: bottomSpacerHeight }} />

      {/* Loading indicator */}
      {(isFetchingNextChunk || isFetchingPreviousChunk) && (
        <div style={{ textAlign: "center", padding: 20 }}>
          Loading more verses...
        </div>
      )}

      {/* No more verses message */}
      {(showNoMoreVerses || (!hasNextChunk && !hasPreviousChunk)) && (
        <div style={{ textAlign: "center", padding: 20 }}>
          No more verses to load
        </div>
      )}
    </div>
  );
};
