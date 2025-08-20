import { useEffect, useRef } from "react";

/**
 * Keeps start/end chunk window in sync when data grows (prepend/append)
 * and on initial load/switch.
 */
export function useSyncWindowWithData({
  data,
  chunkSize,
  setStartChunk,
  setEndChunk,
  lastGrowthRef, // ref you already have in the component
}) {
  const prevFirstIdRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const len = data.length;

    if (len === 0) {
      prevFirstIdRef.current = null;
      prevLastIdRef.current = null;
      prevLenRef.current = 0;
      setStartChunk(0);
      setEndChunk(1);
      if (lastGrowthRef) lastGrowthRef.current = null;
      return;
    }

    const firstId = data[0]?.uuid;
    const lastId = data[len - 1]?.uuid;

    const prevLen = prevLenRef.current;
    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;

    const isInitialLoad = prevLen === 0;
    const switchedDataset =
      prevFirst && prevLast && firstId !== prevFirst && lastId !== prevLast;

    if (isInitialLoad || switchedDataset) {
      const totalChunks = Math.ceil(len / chunkSize);
      setStartChunk(0);
      setEndChunk(Math.min(1, totalChunks));
      if (lastGrowthRef) lastGrowthRef.current = null;
    } else if (len > prevLen) {
      const totalChunks = Math.ceil(len / chunkSize);

      if (firstId !== prevFirst) {
        // data was prepended
        setStartChunk((s) => s + 1);
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        if (lastGrowthRef) lastGrowthRef.current = "up";
      } else if (lastId !== prevLast) {
        // data was appended
        setEndChunk((e) => Math.min(e + 1, totalChunks));
        if (lastGrowthRef) lastGrowthRef.current = "down";
      }
    }

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;
    prevLenRef.current = len;
  }, [data, chunkSize, setStartChunk, setEndChunk, lastGrowthRef]);
}
