import { useEffect, useRef } from 'react';

export const usePreserveScrollOnPrepend = ({
  containerRef,
  items,
  isFetchingPrevious,
  offset = 40,
}) => {
  const prevItemsLength = useRef(items.length);
  const prevScrollTop = useRef(0);
  const prevScrollHeight = useRef(0);
  const shouldRestore = useRef(false);

  const recordScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;
    prevScrollTop.current = container.scrollTop;
    prevScrollHeight.current = container.scrollHeight;
    shouldRestore.current = true;
    prevItemsLength.current = items.length;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      shouldRestore.current &&
      items.length > prevItemsLength.current &&
      !isFetchingPrevious
    ) {
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - prevScrollHeight.current;
        container.scrollTop = prevScrollTop.current + scrollDiff - offset;
        shouldRestore.current = false;
      });
    }
  }, [items, isFetchingPrevious]);

  return { recordScrollPosition };
};
