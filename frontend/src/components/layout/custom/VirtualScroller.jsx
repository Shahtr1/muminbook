import React, { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";

export const VirtualScroller = ({
  items = Array.from({ length: 2000 }, (_, i) => ({ ayat: `Item${i}` })),
  renderItem = (item, index) => `${item.ayat} `,
  height = "400px",
  buffer = 10,
  direction = "rtl",
  estimatedItemCharLength = 40, // average char length per ayat
  estimatedCharWidth = 10,
  estimatedLineHeight = 24,
  fontSize = "10px",
}) => {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(100);

  // Estimate number of items that fit in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, clientWidth } = container;

      const charsPerLine = Math.floor(clientWidth / estimatedCharWidth);
      const linesVisible = Math.ceil(clientHeight / estimatedLineHeight);

      const visibleChars = charsPerLine * linesVisible;
      const scrollOffsetChars =
        Math.floor(scrollTop / estimatedLineHeight) * charsPerLine;

      const totalVisibleChars = visibleChars + scrollOffsetChars;
      const estimatedVisibleItems = Math.ceil(
        totalVisibleChars / estimatedItemCharLength,
      );

      setVisibleCount(estimatedVisibleItems + buffer);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [
    buffer,
    estimatedCharWidth,
    estimatedLineHeight,
    estimatedItemCharLength,
  ]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <Box
      ref={containerRef}
      height={height}
      overflowY="auto"
      border="1px solid gray"
      p={2}
      fontFamily="ArabicFont, serif"
      fontSize={fontSize}
      whiteSpace="pre-wrap"
      wordBreak="break-word"
      dir={direction}
      textAlign={direction === "rtl" ? "right" : "left"}
    >
      {visibleItems.map(renderItem)}
    </Box>
  );
};
