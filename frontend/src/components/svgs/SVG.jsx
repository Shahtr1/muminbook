import { Box, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export const SVG = ({
  dimensions,
  children,
  active = true,
  activeColor,
  defaultColor,
  viewBox,
  absolute = false,
  absoluteStyles,
}) => {
  const defaultActiveColor = useColorModeValue("active.light", "active.dark");
  const defaultDefaultColor = useColorModeValue(
    "default.light",
    "default.dark",
  );

  const computedActiveColor = activeColor ?? defaultActiveColor;
  const computedDefaultColor = defaultColor ?? defaultDefaultColor;

  const [isHovered, setIsHovered] = useState(false);

  const abStyles = {
    position: "absolute",
    ...absoluteStyles,
  };

  return (
    <Box
      as="svg"
      width={dimensions}
      height={dimensions}
      viewBox={viewBox}
      fill={isHovered || active ? computedActiveColor : computedDefaultColor}
      xmlns="http://www.w3.org/2000/svg"
      cursor="pointer"
      overflow="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(absolute ? abStyles : {})}
    >
      {children}
    </Box>
  );
};
