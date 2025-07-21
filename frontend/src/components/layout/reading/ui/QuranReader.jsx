import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import { Ayat } from "@/components/layout/reading/ui/Ayat.jsx";

const CHUNK_SIZE = 50;
const MAX_VISIBLE_CHUNKS = 3;

export const QuranReader = ({
  data,
  fetchNextChunk,
  hasNextChunk,
  isFetchingNextChunk,
}) => {
  const containerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const chunkHeights = useRef({});
  const [startChunk, setStartChunk] = useState(0); // index of first visible chunk
  const [endChunk, setEndChunk] = useState(1); // index after last visible chunk

  // Calculate top spacer height for virtualization
  const topSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) < startChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  // Calculate bottom spacer height for virtualization
  const bottomSpacerHeight = Object.entries(chunkHeights.current)
    .filter(([idx]) => Number(idx) >= endChunk)
    .reduce((acc, [, h]) => acc + h, 0);

  // When new chunks are fetched, extend visible window only if new data was added
  useEffect(() => {
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
    if (endChunk < totalChunks) {
      setEndChunk(endChunk + 1);
    }
  }, [data, endChunk]);

  // Virtualization: remove top chunk if too many are visible
  useLayoutEffect(() => {
    if (endChunk - startChunk > MAX_VISIBLE_CHUNKS) {
      setStartChunk(startChunk + 1);
    }
  }, [endChunk, startChunk]);

  // Infinite scroll: fetch more when near bottom
  const handleBottomIntersection = useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting || isFetchingNextChunk) return;
      const container = containerRef.current;
      const isScrollable = container.scrollHeight > container.clientHeight;
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        1000;
      const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
      if (!isScrollable || nearBottom) {
        if (endChunk < totalChunks) {
          // More chunks in memory, just extend window
          setEndChunk(endChunk + 1);
        } else if (hasNextChunk) {
          // No more in memory, but API says more
          const prevChunkCount = data.length;
          fetchNextChunk().then((newChunks) => {
            if (data.length + newChunks.length > prevChunkCount) {
              const totalChunks = Math.ceil(
                (data.length + newChunks.length) / CHUNK_SIZE
              );
              if (endChunk < totalChunks) {
                setEndChunk(endChunk + 1);
              }
            }
          });
        }
      }
    },
    [isFetchingNextChunk, hasNextChunk, fetchNextChunk, data.length, endChunk]
  );

  // Bottom sentinel observer
  useEffect(() => {
    if (!bottomSentinelRef.current) return;
    const observer = new window.IntersectionObserver(handleBottomIntersection, {
      root: containerRef.current,
      threshold: 0.1,
      rootMargin: "100px",
    });
    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [handleBottomIntersection, data, hasNextChunk, endChunk]);

  const spanRefs = useRef([]);

  const setSpanRef = (el, index) => {
    spanRefs.current[index] = el;
  };

  // Rendered chunks
  const start = startChunk * CHUNK_SIZE;
  const end = endChunk * CHUNK_SIZE;
  const visibleData = data.slice(start, end);

  // Calculate height for each visible chunk
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
          const chunkHeight = range.getBoundingClientRect().height;
          chunkHeights.current[chunkIndex] = chunkHeight;
        }
      }
    }
  }, [visibleData, startChunk, endChunk, start, data.length]);

  // If no more data and content can't fill viewport, show 'No more verses'
  const showNoMoreVerses =
    !hasNextChunk &&
    containerRef.current &&
    containerRef.current.scrollHeight <= containerRef.current.clientHeight;

  // Sentinel rendering: show if there are hidden chunks or API says more
  const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
  const showBottomSentinel = hasNextChunk || endChunk < totalChunks;

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
      }}>
      <div style={{ height: topSpacerHeight }} />
      {startChunk > 0 && (
        <div ref={topSentinelRef} style={{ height: 10, background: "red" }} />
      )}
      {visibleData.map((data, i) => {
        return (
          <Ayat key={data.uuid} data={data} index={i} setSpanRef={setSpanRef} />
        );
      })}
      {showBottomSentinel && (
        <div
          ref={bottomSentinelRef}
          style={{ height: 10, background: "blue" }}
        />
      )}
      <div style={{ height: bottomSpacerHeight }} />
      {isFetchingNextChunk && (
        <div style={{ textAlign: "center", padding: 20 }}>
          Loading more verses...
        </div>
      )}
      {(showNoMoreVerses || !hasNextChunk) && (
        <div style={{ textAlign: "center", padding: 20 }}>
          No more verses to load
        </div>
      )}
    </div>
  );
};
