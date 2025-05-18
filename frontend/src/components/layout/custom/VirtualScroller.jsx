import React, { useEffect, useRef, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";

export const VirtualScroller = ({
  items = [],
  renderItem = (item) => item.ayat,
  direction = "rtl",
  fontSize = "30px",
  chunkSize = 100,
  buffer = 2,
}) => {
  const containerRef = useRef(null);
  const [renderedChunks, setRenderedChunks] = useState(1);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef();

  useEffect(() => {
    const observerEl = observerRef.current;
    if (!observerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoading(true);
          setTimeout(() => {
            setRenderedChunks((prev) => prev + 1);
            setLoading(false);
          }, 300); // simulate async loading (adjust if needed)
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(observerEl);
    return () => observer.disconnect();
  }, []);

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

      {/* Inline Loading Spinner */}
      {loading && (
        <Box as="span" display="inline-block" mx={2} verticalAlign="middle">
          <Spinner size="sm" color="gray.500" />
        </Box>
      )}

      {/* Trigger next chunk load */}
      <Box ref={observerRef} height="1px" />
    </Box>
  );
};
