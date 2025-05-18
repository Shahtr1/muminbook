import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const VirtualScroller = ({
  items,
  height = "300px",
  renderItem,
  estimatedItemHeight = 500,
  footer = null,
  buffer = 5,
}) => {
  items = Array.from({ length: 5000 }, (_, i) => `Item ${i}`);

  return (
    <Box height={height} overflowY="auto" border="1px solid gray">
      <Flex flexWrap="wrap" gap={2}>
        {items.map((item, i) => (
          <Box as="span" display="inline" key={i}>
            <Text whiteSpace="nowrap">hi</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
