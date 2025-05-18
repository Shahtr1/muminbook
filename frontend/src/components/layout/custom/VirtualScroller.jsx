import React, { useEffect, useRef, useState } from "react";
import { Box, Spinner, useColorModeValue } from "@chakra-ui/react";

export const VirtualScroller = ({
  items = [],
  renderItem = (item) => item.ayat,
  direction = "rtl",
  fontSize = "30px",
  chunkSize = 100,
  onLoadMore,
  isFetching,
  hasMore,
}) => {
  const containerRef = useRef(null);
  const observerRef = useRef();
  const [renderedChunks, setRenderedChunks] = useState(1);
  const prevItemsLengthRef = useRef(items.length);
  const textColor = useColorModeValue("#000", "whiteAlpha.900");

  // Automatically increase renderedChunks when new items arrive
  useEffect(() => {
    if (items.length > prevItemsLengthRef.current) {
      prevItemsLengthRef.current = items.length;
      setRenderedChunks((prev) => prev + 1);
    }
  }, [items.length]);

  // Load more when reaching bottom
  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          if (renderedChunks * chunkSize >= items.length) {
            onLoadMore?.();
          } else {
            setRenderedChunks((prev) => prev + 1);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    hasMore,
    isFetching,
    items.length,
    renderedChunks,
    chunkSize,
    onLoadMore,
  ]);

  const visibleItems = items.slice(0, renderedChunks * chunkSize);

  return (
    <Box
      ref={containerRef}
      height="80vh"
      overflowY="auto"
      fontFamily="ArabicFont, serif"
      fontSize={fontSize}
      whiteSpace="pre-wrap"
      wordBreak="break-word"
      dir={direction}
      textAlign={direction === "rtl" ? "right" : "left"}
      px={2}
    >
      {visibleItems.map((item, i) => (
        <Box as="span" key={item._id || i} display="inline">
          {renderItem(item, i)}{" "}
        </Box>
      ))}

      {isFetching && (
        <Box as="span" display="inline-block" mx={2} verticalAlign="middle">
          <Spinner size="sm" color={textColor} />
        </Box>
      )}

      <Box ref={observerRef} height="1px" />
    </Box>
  );
};
