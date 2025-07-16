import { useEffect, useRef } from "react";

export const Chunk = ({ chunk, index, onMeasure }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry?.contentRect?.height) {
        onMeasure(index, entry.contentRect.height);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, onMeasure]);

  return (
    <span ref={ref}>
      {chunk.ayat} <span>﴿{chunk.uuid}﴾</span>{" "}
    </span>
  );
};
