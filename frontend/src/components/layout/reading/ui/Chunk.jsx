import { useLayoutEffect, useRef } from "react";

export const Chunk = ({ chunk, index, onMeasure }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      onMeasure(index, height);
    }
  }, [chunk, index, onMeasure]);

  return (
    <span ref={ref}>
      {chunk.ayat} <span>﴿{chunk.uuid}﴾</span>{" "}
    </span>
  );
};
