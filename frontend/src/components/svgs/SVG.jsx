import { Box, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export const SVG = ({
  dimensions,
  children,
  active = true,
  activeColor,
  defaultColor,
  viewBox,
}) => {
  const computedActiveColor =
    activeColor ?? useColorModeValue("active.light", "active.dark");
  const computedDefaultColor =
    defaultColor ?? useColorModeValue("default.light", "default.dark");

  const [isHovered, setIsHovered] = useState(false);

  const computedViewBox =
    viewBox ??
    useBreakpointValue({
      base: "0 0 48 48",
      md: "0 0 68 68",
    });

  return (
    <Box
      as="svg"
      width={dimensions}
      height={dimensions}
      viewBox={computedViewBox}
      fill={isHovered || active ? computedActiveColor : computedDefaultColor}
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
