import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Ayat } from "@/components/layout/reading/ui/Ayat.jsx";
import { useSyncWindowWithData } from "@/hooks/reading/reader/useSyncWindowWithData.js";
import { useMeasureVisibleChunks } from "@/hooks/reading/reader/useMeasureVisibleChunks.js";
import { useTopIntersectionHandler } from "@/hooks/reading/reader/useTopIntersectionHandler.js";
import { useBottomIntersectionHandler } from "@/hooks/reading/reader/useBottomIntersectionHandler.js";

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
  useSyncWindowWithData({
    data,
    chunkSize: CHUNK_SIZE,
    setStartChunk,
    setEndChunk,
    lastGrowthRef,
  });

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

  useMeasureVisibleChunks({
    spanRefs,
    chunkHeights,
    startChunk,
    endChunk,
    startIndex: start,
    dataLength: data.length,
    chunkSize: CHUNK_SIZE,
    visibleData,
  });

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

  const bottomHandler = useBottomIntersectionHandler({
    dataLength: data.length,
    endChunk,
    setEndChunk,
    lastGrowthRef,
    chunkSize: CHUNK_SIZE,
    hasNextChunk,
    isFetchingNextChunk,
    fetchNextChunk,
  });

  // Set up the bottom sentinel observer
  useEffect(() => {
    if (!bottomSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(bottomHandler, {
      root: containerRef.current,
      threshold: 0.05,
      rootMargin: "0px 0px 200px 0px",
    });
    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [bottomHandler]);

  // --- Infinite scroll UP (top sentinel) ---
  const fetchPrevCooldownRef = useRef(false);

  const topHandler = useTopIntersectionHandler({
    startChunk,
    setStartChunk,
    setEndChunk,
    lastGrowthRef,
    hasPreviousChunk,
    isFetchingPreviousChunk,
    fetchPreviousChunk,
    anchorBeforePrepend,
    pendingScrollAdjustRef: pendingScrollAdjust,
    maxVisibleChunks: MAX_VISIBLE_CHUNKS,
  });

  // Set up a top sentinel observer
  useEffect(() => {
    if (!topSentinelRef.current || !containerRef.current) return;
    const observer = new window.IntersectionObserver(topHandler, {
      root: containerRef.current,
      threshold: 0.05,
      rootMargin: "200px 0px 0px 0px",
    });
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [topHandler]);

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
