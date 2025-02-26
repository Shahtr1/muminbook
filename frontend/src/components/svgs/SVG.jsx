import { Box, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const SVG = ({ dimensions, viewBox, children }) => {
  const defaultColor = useColorModeValue("text.secondary", "whiteAlpha.800");
  const hoverColor = useColorModeValue("text.primary", "white");

  const [color, setColor] = useState(defaultColor);

  useEffect(() => {
    setColor(defaultColor);
  }, [defaultColor]);

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
      onMouseEnter={() => setColor(hoverColor)}
      onMouseLeave={() => setColor(defaultColor)}
    >
      {children}
    </Box>
  );
};
