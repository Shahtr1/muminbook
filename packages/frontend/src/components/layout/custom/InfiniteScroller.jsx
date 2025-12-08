import React, { useEffect, useRef } from 'react';
import { Box, Flex, Spinner, useColorModeValue } from '@chakra-ui/react';
import { useTrackVisibleAyat } from '@/hooks/quran/useTrackVisibleAyat.js';
import { usePreserveScrollOnPrepend } from '@/hooks/reading/usePreserveScrollOnPrepend.js';

export const InfiniteScroller = ({
  items = [],
  renderItem = (item) => item.ayat,
  direction = 'rtl',
  fontSize = '30px',
  onLoadNext,
  onLoadPrevious,
  isFetchingNext,
  hasNext,
  hasPrevious,
  isFetchingPrevious,
}) => {
  const containerRef = useRef(null);
  const topObserverRef = useRef();
  const bottomObserverRef = useRef();
  const textColor = useColorModeValue('#000', 'whiteAlpha.900');

  const { recordScrollPosition } = usePreserveScrollOnPrepend({
    containerRef,
    items,
    isFetchingPrevious,
    offset: 8,
  });

  useTrackVisibleAyat(items, containerRef);

  // Top observer
  useEffect(() => {
    const el = topObserverRef.current;
    const container = containerRef.current;
    if (!el || !hasPrevious || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasPrevious && !isFetchingPrevious) {
          recordScrollPosition();
          onLoadPrevious?.();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPrevious, isFetchingPrevious, onLoadPrevious]);

  // Bottom observer
  useEffect(() => {
    const el = bottomObserverRef.current;
    if (!el || !hasNext) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNext && !isFetchingNext) {
          onLoadNext?.();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, isFetchingNext, onLoadNext]);

  return (
    <Box
      position="relative"
      ref={containerRef}
      height="80vh"
      overflowY="auto"
      fontFamily="ArabicFont, serif"
      fontSize={fontSize}
      whiteSpace="pre-wrap"
      wordBreak="break-word"
      dir={direction}
      textAlign={direction === 'rtl' ? 'right' : 'left'}
      px={2}
    >
      <Box as="span" ref={topObserverRef} height="1px" />

      {isFetchingPrevious && (
        <Flex mx={2} w="100%" justifyContent="center">
          <Spinner size="sm" color={textColor} />
        </Flex>
      )}

      {items.map((item, i) => (
        <Box as="span" key={item._id || i} display="inline" data-idx={i}>
          {renderItem(item, i)}{' '}
        </Box>
      ))}

      {isFetchingNext && (
        <Box as="span" mx={2} verticalAlign="middle">
          <Spinner size="sm" color={textColor} />
        </Box>
      )}

      <Box as="span" ref={bottomObserverRef} height="1px" />
    </Box>
  );
};
