import { useEffect, useRef, useState } from "react";
import { Chunk } from "@/components/layout/reading/ui/Chunk.jsx";

/**
 * QuranReader
 * Infinite-scroll Quran reader with virtualized rendering
 * and dynamic chunk height calculation.
 */
export const QuranReader = ({ chunks, fetchNextChunk }) => {
  const containerRef = useRef(null);
  const bottomSentinelRef = useRef(null);

  const CHUNK_SIZE = 50;
  const MAX_VISIBLE_CHUNKS = 3;

  const [startChunkIndex, setStartChunkIndex] = useState(0);
  const [renderedChunkIndex, setRenderedChunkIndex] = useState(1);

  const chunkHeightsRef = useRef({}); // { index: height }
  const isFetchingRef = useRef(false);

  // Spacer for removed chunks above
  const topSpacerHeight = Object.entries(chunkHeightsRef.current)
    .filter(([index]) => Number(index) < startChunkIndex)
    .reduce((acc, [, height]) => acc + height, 0);

  // Increase rendered chunk index when new data is available
  useEffect(() => {
    const expectedEnd = renderedChunkIndex * CHUNK_SIZE;
    if (chunks.length >= expectedEnd) {
      setRenderedChunkIndex((prev) => prev + 1);
    }
  }, [chunks]);

  // Virtualization: drop top chunk if more than MAX_VISIBLE_CHUNKS
  useEffect(() => {
    if (renderedChunkIndex - startChunkIndex > MAX_VISIBLE_CHUNKS) {
      const container = containerRef.current;
      const prevScrollTop = container.scrollTop;
      const prevScrollHeight = container.scrollHeight;
      const heightRemoved = chunkHeightsRef.current[startChunkIndex] || 0;

      setStartChunkIndex((prev) => prev + 1);

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const heightDiff = newScrollHeight - prevScrollHeight;
        container.scrollTop = prevScrollTop - heightDiff + heightRemoved;
      });
    }
  }, [renderedChunkIndex]);

  // Intersection observer to fetch next chunk
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            entry.target === bottomSentinelRef.current &&
            !isFetchingRef.current
          ) {
            const nextChunkStart = renderedChunkIndex * CHUNK_SIZE;

            if (chunks.length <= nextChunkStart) {
              isFetchingRef.current = true;
              fetchNextChunk().finally(() => {
                isFetchingRef.current = false;
              });
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    const timeout = setTimeout(() => {
      if (bottomSentinelRef.current) {
        observer.observe(bottomSentinelRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [chunks, fetchNextChunk, renderedChunkIndex]);

  const start = startChunkIndex * CHUNK_SIZE;
  const end = renderedChunkIndex * CHUNK_SIZE;
  const visibleChunks = chunks.slice(start, end);

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
      {/* Spacer for removed top chunks */}
      <div style={{ height: topSpacerHeight }} />

      {/* Render visible ayahs */}
      {visibleChunks.map((chunk, i) => {
        const globalIndex = startChunkIndex + i;
        return (
          <Chunk
            key={chunk.uuid}
            chunk={chunk}
            index={globalIndex}
            onMeasure={(index, height) => {
              chunkHeightsRef.current[index] = height;
            }}
          />
        );
      })}

      {/* Scroll sentinel to load more */}
      <div
        ref={bottomSentinelRef}
        style={{
          height: "1px",
          marginTop: "100px",
          display: "block",
          background: "transparent",
        }}
      />
    </div>
  );
};
