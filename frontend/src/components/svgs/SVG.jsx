import { Box, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export const SVG = ({ dimensions, children, active }) => {
  const responsiveViewBox = useBreakpointValue({
    base: "0 0 48 48",
    md: "0 0 68 68",
  });

  const defaultColor = useColorModeValue("default.light", "default.dark");
  const activeColor = useColorModeValue("active.light", "active.dark");

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      as="svg"
      width={dimensions}
      height={dimensions}
      viewBox={responsiveViewBox}
      fill={isHovered || active ? activeColor : defaultColor}
      xmlns="http://www.w3.org/2000/svg"
      cursor="pointer"
      overflow="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Box>
  );
};
