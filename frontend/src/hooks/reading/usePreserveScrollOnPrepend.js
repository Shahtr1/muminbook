// hooks/ui/usePreserveScrollOnPrepend.js
import { useLayoutEffect, useRef } from "react";

export const usePreserveScrollOnPrepend = ({
  containerRef,
  items,
  isFetchingPrevious,
  offset = 40, // scroll up by 40px after prepend
}) => {
  const prevScrollHeight = useRef(0);
  const prevScrollTop = useRef(0);

  const recordScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;
    prevScrollHeight.current = container.scrollHeight;
    prevScrollTop.current = container.scrollTop;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isFetchingPrevious) return;

    const timeout = setTimeout(() => {
      const newScrollHeight = container.scrollHeight;
      const diff = newScrollHeight - prevScrollHeight.current;
      container.scrollTop = prevScrollTop.current + diff - offset; // subtract to move up
    }, 0);

    return () => clearTimeout(timeout);
  }, [isFetchingPrevious, items, offset]);

  return { recordScrollPosition };
};
