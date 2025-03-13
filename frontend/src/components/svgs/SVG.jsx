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
  const defaultActiveColor = useColorModeValue("active.light", "active.dark");
  const defaultDefaultColor = useColorModeValue(
    "default.light",
    "default.dark",
  );

  let lgViewBox = "0 0 48 48";
  let smViewBox = "0 0 68 68";

  const breakpointViewBox = useBreakpointValue({
    base: lgViewBox,
    md: smViewBox,
  });

  const computedActiveColor = activeColor ?? defaultActiveColor;
  const computedDefaultColor = defaultColor ?? defaultDefaultColor;

  const [isHovered, setIsHovered] = useState(false);

  let viewBoxDim;

  if (viewBox === "sm") {
    viewBoxDim = smViewBox;
  } else if (viewBox === "lg") {
    viewBoxDim = lgViewBox;
  }

  const computedViewBox = viewBoxDim ?? breakpointViewBox;

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
