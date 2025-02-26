import { Box, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const SVG = ({ dimensions, viewBox, children, active }) => {
  const defaultColor = useColorModeValue("text.secondary", "whiteAlpha.700");
  const primaryColor = useColorModeValue("text.primary", "white");

  const [color, setColor] = useState(active ? primaryColor : defaultColor);

  useEffect(() => {
    setColor(active ? primaryColor : defaultColor);
  }, [defaultColor, primaryColor, active]);

  return (
    <Box
      as="svg"
      width={dimensions}
      height={dimensions}
      viewBox={viewBox}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      cursor="pointer"
      overflow="visible"
      onMouseEnter={() => setColor(primaryColor)}
      onMouseLeave={() => setColor(active ? primaryColor : defaultColor)}
    >
      {children}
    </Box>
  );
};
