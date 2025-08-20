import { useEffect } from "react";

/**
 * Measures DOM height for each visible chunk (using the span refs you already set).
 * Writes results into chunkHeights.current[chunkIndex].
 */
export function useMeasureVisibleChunks({
  spanRefs, // ref array you already have
  chunkHeights, // ref object you already have
  startChunk,
  endChunk,
  startIndex, // "start" from your component (index of first visible item)
  dataLength,
  chunkSize,
  visibleData, // so the effect runs on visible changes
}) {
  useEffect(() => {
    if (!spanRefs.current || spanRefs.current.length === 0) return;
    const validSpans = spanRefs.current.filter(Boolean);
    if (validSpans.length === 0) return;

    for (let chunkIndex = startChunk; chunkIndex < endChunk; chunkIndex++) {
      const chunkStart = chunkIndex * chunkSize;
      const chunkEnd = Math.min((chunkIndex + 1) * chunkSize, dataLength);

      const chunkSpanStart = Math.max(0, chunkStart - startIndex);
      const chunkSpanEnd = Math.min(validSpans.length, chunkEnd - startIndex);

      if (chunkSpanStart < chunkSpanEnd && chunkSpanStart < validSpans.length) {
        const chunkSpans = validSpans.slice(chunkSpanStart, chunkSpanEnd);
        if (chunkSpans.length > 0) {
          const range = document.createRange();
          range.setStartBefore(chunkSpans[0]);
          range.setEndAfter(chunkSpans[chunkSpans.length - 1]);
          const rect = range.getBoundingClientRect();
          chunkHeights.current[chunkIndex] = rect.height;
        }
      }
    }
  }, [
    visibleData,
    startChunk,
    endChunk,
    startIndex,
    dataLength,
    chunkSize,
    spanRefs,
    chunkHeights,
  ]);
}
